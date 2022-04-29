//manage all the AJAX requests and response in the frontend
// 在前端管理所有 AJAX 请求和响应
$(document).ready(function(){
    checkLogIn();//检查是否登陆 522
    getAllAppointments();//得到所有约会 553
    $(".btn_logout").click(function(){
        logout();
    });
    $("#addAppoitmentModal").on('change',function(){
        var date = $("#addAppoitmentModal").find("input[type='date']");//当前日期
        var time = $("#addAppoitmentModal").find("input[type='time']");//当前时间
        var flag_btn = true;
        for(var i = 0; i < date.length; i++){
            if(date[i].value == ""){
                flag_btn = false;
            }
        }
        for(var i = 0; i < time.length && flag_btn == true; i++){
            if(time[i].value == ""){
                flag_btn = false;
            }
        }
        
        if(flag_btn){
            $(this).find("#add_date_btn").removeAttr('disabled');
        }else{
            $(this).find("#add_date_btn").attr('disabled','disabled');
        }
    })
    $("#addAppoitmentForm").on('submit',function(e){
        e.preventDefault();
        var date = $("#addAppoitmentForm").find("input[type='date']");
        var time = $("#addAppoitmentForm").find("input[type='time']");
        var appt_name = $("#addAppoitmentForm").find("input[name='appt_name']").val();
        var appt_info = $("#addAppoitmentForm").find("textarea[name='appt_info']").val();
        var error_p = $("#addAppoitmentForm").find(".error_msg");

        if (localStorage.getItem("user_id") != null) {
            var user_id = localStorage.getItem("user_id");
            var user_id_input = $("#addAppoitmentForm").find("input[name='user_id']");
            if (user_id_input.length > 0) {
                user_id_input.val(user_id);
            }else{
                $("#addAppoitmentForm").append("<input type='hidden' name='user_id' value='"+user_id+"'>");
            }
           
        }

        var flag_err = true;
        var flag_msg = "";
        if(appt_name == ""){
            flag_err = false;
            flag_msg += "Please fill Appointment Name field <br>";
        }
        if(appt_info == ""){
            flag_err = false;
            flag_msg += "Please fill Appointment Info field <br>";
        }
        for(var i = 0; i < date.length && flag_err == true; i++){
            if(date[i].value == ""){
                flag_err = false;
                flag_msg += "Please fill all date fields <br>";
            }
        }
        for(var i = 0; i < time.length && flag_err == true; i++){
            if(time[i].value == ""){
                flag_err = false;
                flag_msg += "Please fill all time fields <br>";
            }
        }
        console.log(flag_msg);
        if(flag_err){
            error_p.html("");
            var form_data = $(this).serializeArray();
            $.ajax({
                url: "../backend/serviceHandler.php?endpoint=add_appointment",
                method: "POST",
                data: form_data,
                success: function(data){
                    data = JSON.parse(data);
                    if(data.status == "success"){
                        location.reload();
                    }else{
                        error_p.html(data.msg);
                    }
                }
            });
        }else{
            error_p.html(flag_msg);
        }
    })
    $("#add_date_btn").on('click',function(){
        var elem_div = $("#other_dates")
        elem_div.append('<div class="row"><div class="col-4"><div class="form-group"><label for="date">Date</label><input type="date" class="form-control" name="date[]" placeholder="Date"></div></div><div class="col-3"><div class="form-group"><label for="time">Start Time</label><input type="time" class="form-control" name="time1[]" placeholder="Start Time"></div></div><div class="col-3"><div class="form-group"><label for="time">End Time</label><input type="time" class="form-control" name="time2[]" placeholder="End Time"></div></div><div class="col-1"><div class="form-group mt-4"> <button type="button" class="btn-close float-end remove_date_btn"></button></div></div></div>');
        $(this).attr('disabled','disabled');
    })
    $(document).on('click','.remove_date_btn',function(){
        //remove date and time input fields and add add button
        // 删除日期和时间输入字段并添加添加按钮
        $(this).parent().parent().parent().remove();
    })
    $(".btn_calander").on('click',function(){
        $(".appointment_calander").removeClass('invisible');
        $(".all_appointments").hide();
        $(".appointment_details").hide();

        var elem_calender = $(".appt_calender");
        $.ajax({
            url: "../backend/serviceHandler.php?endpoint=get_appointments",
            method: "GET",
            success: function(data){
                data = JSON.parse(data);
                
                if(data.status == "success"){
                    data = data.data
                    console.log(data);
                    elem_calender.html("");
                    var appt_data = data.data;
                    var frag = document.createDocumentFragment();
                    for(var i = 0; i < data.length; i++){
                        var elem_div = document.createElement('div');
                        elem_div.className = "col-md-2 col-sm-4 col-xs-6";
                        //check if the appointment is in past 
                        // 检查约会是否过期
                        var date = new Date(data[i].date);
                        var today = new Date();
                        if(date < today){
                            elem_div.innerHTML = '<div class="card  bg-danger text-light"><div class="card-body"><p class="text-center">' + data[i].month + '.</p><h2 class="text-center">' + data[i].day + '</h2><p class="text-center"><i>' + data[i].start_time + '</i> - <i>' + data[i].end_time + '</i></p></div>';
                        }else{
                            elem_div.innerHTML = '<div class="card  bg-secondary text-light"><div class="card-body"><p class="text-center">' + data[i].month + '.</p><h2 class="text-center">' + data[i].day + '</h2><p class="text-center"><i>' + data[i].start_time + '</i> - <i>' + data[i].end_time + '</i></p></div>';
                        }
                
                        frag.appendChild(elem_div);
                    }
                    elem_calender.append(frag);
                }
            }
        });
    })
    $(".appointment_calander").on('click','.btn-close',function(){//日历
        $(".appointment_calander").addClass('invisible');
        $(".all_appointments").show();
        $(".appointment_details").hide();
    })

    $("#btn_delete_appointment").on('click',function(){//删除
        var data_id = $(this).attr('data-id');
        var confirm = window.confirm("Are you sure you want to delete this appointment?");
        if(confirm){
            
            $.ajax({
                url: "../backend/serviceHandler.php?endpoint=delete_appointment",
                method: "POST",
                data: {id: data_id},
                success: function(data){
                    data = JSON.parse(data);
                    if(data.status == "success"){
                        location.reload();
                    }else{
                        alert(data.msg);
                    }
                }
            });
        }
    })

    $("#btnStat").on('click',function(){
        var data_id = $(this).attr('data-id');
        var date_elem = $(".appt_stats");
        $.ajax({
            url: "../backend/serviceHandler.php?endpoint=get_appointment_votes",
            method: "POST",
            data: {
                id: data_id
            },
            success: function(data){
                data = JSON.parse(data);
                
                console.log(data);
                if(data.status == "success"){
                    data = data.data;
                    date_elem.html("");
                    //create a table and thead will be data.dates
                    var table = document.createElement('table');
                    table.style.maxWidth = "max-content";
                    table.className = "table table-borderless table-responsive";
                    var thead = document.createElement('thead');
                    var thead_row = document.createElement('tr');
                    var thead_row_th = document.createElement('th');
                    thead_row_th.innerHTML = "Name";
                    thead_row.appendChild(thead_row_th);
                    for(var i = 0; i < data.dates.length; i++){
                        var th = document.createElement('th');
                        th.innerHTML = data.dates[i].date + "<br />" + data.dates[i].start_time + "<br />" + data.dates[i].end_time;
                        th.className = "text-center";
                        thead_row.appendChild(th);
                    }
                    thead.appendChild(thead_row);
                    table.appendChild(thead);

                    var tbody = document.createElement('tbody');
                    for(var i = 0; i < data.votes.length; i++){
                        var tr = document.createElement('tr');
                        var td = document.createElement('td');
                        td.innerHTML = data.votes[i].name;
                        tr.appendChild(td);
                        for(var j = 0; j < data.votes[i].vote.length; j++){
                            var td = document.createElement('td');
                            
                            if(data.votes[i].vote[j].checked == "true"){
                                td.innerHTML = '<img src="https://img.icons8.com/ios-filled/344/checkmark--v1.png" width="20px" />';
                            }else{
                                td.innerHTML = '';
                            }
                            td.className = "text-center";
                            
                            tr.appendChild(td);
                        }
                        tbody.appendChild(tr);
                    }
                    table.appendChild(tbody);
                    //create a table and append it to the div
                    // 创建一个表并将其附加到 div
                    /*var elem_table = document.createElement('table');
                    elem_table.className = "table table-striped table-bordered";
                    var elem_thead = document.createElement('tr');
                    elem_thead.innerHTML = '<th>Date</th><th>Start Time</th><th>End Time</th><th>Status</th>';
                    elem_table.appendChild(elem_thead);
                    var elem_tbody = document.createElement('tbody');
                    
                    
                    for(var i = 0; i < data.data.dates.length; i++){
                        var elem_tr = document.createElement('tr');
                        var date = new Date(data.data.dates[i].date);
                        var today = new Date();
                        if(data.data.dates[i].status == "1" || date < today){
                            elem_tr.innerHTML = '<td>' + date.getDate() + '.' + (date.getMonth() + 1) + '.' + date.getFullYear() + '</td><td>' + data.data.dates[i].start_time + '</td><td>' + data.data.dates[i].end_time + '</td><td><img src="https://img.icons8.com/ios-filled/344/checkmark--v1.png" width="32" /></td>';
                        }else{
                            elem_tr.innerHTML = '<td>' + date.getDate() + '.' + (date.getMonth() + 1) + '.' + date.getFullYear() + '</td><td>' + data.data.dates[i].start_time + '</td><td>' + data.data.dates[i].end_time + '</td><td></td>';
                        }
                        elem_tbody.appendChild(elem_tr);
                    }
                    elem_table.appendChild(elem_tbody);*/
                    date_elem.append(table);
                }else{
                    alert(data.msg);
                }
            }
        });
    })

    $("#all_appointments").on('click',".appointment_card",function(){
        var data_id = $(this).attr('data-id');

        $(".main_data").hide();
        $(".appointment_details").removeClass('invisible');
        $(".appointment_details").show();
        $("#voteBtn").attr('data-id',data_id);

        var input_uname = $("#apptForm").find("input[name='name']");

        if(localStorage.getItem('user_name') != null){
            input_uname.val(localStorage.getItem('user_name'));
            //input_uname.attr('disabled','disabled');
        }

        $("#btnStat").attr('data-id',data_id);
        $("#btn_delete_appointment").attr('data-id',data_id);

        var heading_elem = $(".appointment_details").find("h1");
        var info_elem = $(".appointment_details").find(".appt_info");
        var date_elem = $(".appointment_details").find(".appt_dates");
        $.ajax({
            url: "../backend/serviceHandler.php?endpoint=get_appointment_details",
            method: "POST",
            data: {
                id: data_id
            },
            success: function(data){
                data = JSON.parse(data);
                if(data.status == "success"){
                    heading_elem.html(data.data.title);
                    info_elem.html(data.data.info);
                    date_elem.html("");
                    var frag = document.createDocumentFragment();
                    for(var i = 0; i < data.data.dates.length; i++){
                        var elem_div = document.createElement('div');
                        elem_div.className = "col-md-2 col-sm-4 col-xs-6";
                        var date_status = "";
                        var date = new Date(data.data.dates[i].date);
                        var today = new Date();
                        if(date < today){
                            date_status = "disabled";
                        }
                        
                        elem_div.innerHTML = '<div class="card  bg-dark text-light border border-light"><div class="card-body"><p class="text-center">' + data.data.dates[i].month + '.</p><h2 class="text-center">' + data.data.dates[i].day + '</h2><p class="text-center"><i>' + data.data.dates[i].start_time + '</i> - <i>' + data.data.dates[i].end_time + '</i></p><center><div class="form-check"><input type="checkbox" class="form-check-input" name="appointment[' + i + ']" data-id="' + data.data.dates[i].id + '" ' + date_status + '></div></center></div>';
                        
                        frag.appendChild(elem_div);
                    }
                    date_elem.append(frag);
                    //find hidden input and set value in apptForm
                    // 在 apptForm 中查找隐藏的输入并设置值
                    $("#apptForm").find("input[name='id']").val(data.data.ID);
                    getAllComments(data.data.ID);
                }else{
                    alert(data.msg);
                }
            }
        });
        
    })
    $(".appointment_details .btn-close").on('click',function(){
        $(".main_data").show();
        $(".appointment_details").hide();
    })

    $("#voteBtn").on('click',function(){
        var data_id = $(this).attr('data-id');
        var input_uname = $("#apptForm").find("input[name='name']").val();
        var checked_boxes = $(".appt_dates").find("input[type='checkbox']");
        var checked_dates = [];
        var countChecked = 0;
        for(var i = 0; i < checked_boxes.length; i++){
            var date_data = {
                id: $(checked_boxes[i]).attr('data-id'),
                checked: $(checked_boxes[i]).is(':checked')
            }
            if(date_data.checked){
                countChecked++;
            }
            checked_dates.push(date_data);
        }
        var flag = false;
        if(input_uname == ""){
            alert("Please enter your name");
            flag = true;
        }
        if(countChecked == 0){
            alert("Please select at least one date");
            flag = true;
        }

        if(!flag){
            console.log(checked_dates);
            $.ajax({
                url: "../backend/serviceHandler.php?endpoint=vote_appointment",
                method: "POST",
                data: {
                    id: data_id,
                    name: input_uname,
                    dates: checked_dates
                },
                success: function(data){
                    console.log(data);
                    data = JSON.parse(data);
                    if(data.status == "success"){
                        alert("Thank you for voting!");
                        $("#apptForm").find("input[name='name']").val("");
                        //uncheck all boxes
                        // 取消选中所有框
                        for(var i = 0; i < checked_boxes.length; i++){
                            $(checked_boxes[i]).prop('checked',false);
                        }

                    }else{
                        alert(data.msg);
                    }
                }
            });    
        }
        
    })

    $("#apptForm").on('submit',function(e){
        e.preventDefault();
        var form_data = $(this).serializeArray();

        
        var appt_id = $(this).find('input[name="id"]').val();
        var error_p = $(this).find(".error_msg");
        var flag_err = true;
        var flag_msg = "";
        if(form_data[0].value == ""){
            flag_err = false;
            flag_msg += "Please Input Your Name <br />";
        }
        if(form_data[1].value == ""){
            flag_err = false;
            flag_msg += "Please Input Your Comment <br />";
        }
        if(flag_err){
            error_p.html("");
            $.ajax({
                url: "../backend/serviceHandler.php?endpoint=add_comments",
                method: "POST",
                data: form_data,
                success: function(data){
                    console.log(data);
                    data = JSON.parse(data);
                    if(data.status == "success"){
                        $("#apptForm").trigger('reset');
                        getAllComments(appt_id);
                    }else{
                        error_p.html(data.msg);
                    }
                }
            });
        }else{
            error_p.html(flag_msg);
        }
    })
    $("#registerForm").on('submit',function(e){
        e.preventDefault();
        var form_data = $(this).serializeArray();
        
        var error_p = $(this).find(".error_msg");
        var flag_err = true;
        var flag_msg = "";
        if(form_data[0].value == ""){
            flag_err = false;
            flag_msg += "Please Input Your Username <br />";
        }
        if(form_data[1].value == ""){
            flag_err = false;
            flag_msg += "Please Input Your Password <br />";
        }
        if(form_data[2].value == ""){
            flag_err = false;
            flag_msg += "Please Input Your First Name <br />";
        }
        if(form_data[3].value == ""){
            flag_err = false;
            flag_msg += "Please Input Your Last Name <br />";
        }
        if(form_data[4].value == ""){
            flag_err = false;
            flag_msg += "Please Input Your Email <br />";
        }
        if(form_data[5].value == ""){
            flag_err = false;
            flag_msg += "Please Input Your Date Of Birthday <br />";
        }
        if(flag_err){
            error_p.html("");
            error_p.removeClass("text-danger");
            error_p.addClass("text-info");
            error_p.html("Please Wait...");
            $.ajax({
                url: "../backend/serviceHandler.php?endpoint=register",
                method: "POST",
                data: form_data,
                success: function(data){
                    data = JSON.parse(data);
                    if(data.status == "success"){
                        $("#registerForm").trigger('reset');
                        $("#registerModal").modal('hide');
                        localStorage.setItem("user_id",data.ID);
                        localStorage.setItem("user_name",data.name);
                        error_p.removeClass("text-info");
                        error_p.addClass("text-success");
                        error_p.html(data.message);
                        checkLogIn();
                    }else{
                        error_p.removeClass("text-info");
                        error_p.addClass("text-danger");
                        error_p.html(data.message);
                    }
                }
            });
        }
        else{
            error_p.html(flag_msg);
        }
    })
    $("#loginForm").on('submit',function(e){
        e.preventDefault();
        var form_data = $(this).serializeArray();
        var error_p = $(this).find(".error_msg");
        var flag_err = true;
        var flag_msg = "";
        if(form_data[0].value == ""){
            flag_err = false;
            flag_msg += "Please Input Your Username <br />";
        }
        if(form_data[1].value == ""){
            flag_err = false;
            flag_msg += "Please Input Your Password <br />";
        }
        if(flag_err){
            error_p.html("");
            error_p.removeClass("text-danger");
            error_p.addClass("text-info");
            error_p.html("Please Wait...");
            $.ajax({
                url: "../backend/serviceHandler.php?endpoint=login",
                method: "POST",
                data: form_data,
                success: function(data){
                    data = JSON.parse(data);
                    if(data.status == "success"){
                        $("#loginForm").trigger('reset');
                        $("#loginModal").modal('hide');
                        localStorage.setItem("user_id",data.ID);
                        localStorage.setItem("user_name",data.name);
                        error_p.removeClass("text-info");
                        error_p.addClass("text-success");
                        error_p.html(data.message);
                        checkLogIn();
                    }else{
                        error_p.removeClass("text-info");
                        error_p.addClass("text-danger");
                        error_p.html(data.message);
                    }
                }
            });
        }
        else{
            error_p.html(flag_msg);
        }

    })
    function checkLogIn(){
        if(localStorage.getItem("user_id") == null){
            $("#notLeggedIn").show();
            $("#loggedIn").hide();
        }else{
            $.ajax({
                url: "../backend/serviceHandler.php?endpoint=get_user_details",
                method: "POST",
                data: {
                    id: localStorage.getItem("user_id")
                },
                success: function(data){
                    data = JSON.parse(data);
                    if(data.status == "success"){
                        $("#notLeggedIn").hide();
                        $("#loggedIn").show();
                        $("#loggedIn").find(".user_name").html(data.data.firstname + " " + data.data.lastname);
                    }else{
                        $("#notLeggedIn").show();
                        $("#loggedIn").hide();
                    }
                }
            });
            
        }
    }
    function logout(){
        localStorage.removeItem("user_id");
        localStorage.removeItem("user_name");
        checkLogIn();
    }
    function getAllAppointments(){
        $.ajax({
            url: "../backend/serviceHandler.php?endpoint=get_all_appointments",
            method: "GET",
            success: function(data){
                data = JSON.parse(data);
                if(data.status == "success"){
                    var elem_div = $("#all_appointments");
                    elem_div.find(".appointment_card").remove();

                    for(var i = 0; i < data.data.length; i++){
                        var appt_name = data.data[i].title;
                        var appt_info = data.data[i].info;
                        if(appt_info.length > 100){
                            appt_info = appt_info.substr(0,100) + "...";
                        }
                        var id = data.data[i].ID;
                        var html = '<div class="col-md-4 col-sm-6 col-xs-12"><div class="card appointment_card  bg-secondary text-light"  data-id="'+id+'"><div class="card-body"><h4 class="card-title">'+appt_name+'</h4><p class="card-text">'+appt_info+'</p></div></div></div>';
                        elem_div.append(html);
                    }
                }
            }
        });
    }
    function getAllComments(appt_id){
        $.ajax({
            url: "../backend/serviceHandler.php?endpoint=get_all_comments",
            method: "POST",
            data: {
                id: appt_id
            },
            success: function(data){
                data = JSON.parse(data);
                if(data.status == "success"){
                    var elem_div = $("#all_comments");
                    elem_div.html("");
                    for(var i = 0; i < data.data.length; i++){
                        var name = data.data[i].user_name;
                        var comment = data.data[i].comment;
                        elem_div.append('<div class="col-12 g-2"><div class="card comment_card  bg-secondary text-light"><div class="card-body"><h6 class="card-title">'+name+'</h6><i class="card-text ps-4">'+comment+'</i></div></div></div>');
                    }
                }
            }
        });
    }
})