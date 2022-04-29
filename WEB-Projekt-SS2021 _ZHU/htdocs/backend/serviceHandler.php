<?php 
    require 'db/dbHandler.php';
    //serviceHandler to manage all the services requests
    $db = new dbHandler();
    $appointmentHandler = new Appointment();
    $userHandler = new User();
    $endpoint = $_GET['endpoint'];
    //check if the endpoint is set
    //检查是否设置了端点
    if($endpoint == "add_appointment"){
        //get data from user and add appointment to the database and return response in json format
        //从用户获取数据并将约会添加到数据库并以 json 格式返回响应
        $data = $_POST;
        $appt_name = $db->escape_str($data['appt_name']);
        $appt_info = $db->escape_str($data['appt_info']);

        $appt_date = array();
        $appt_start_time = array();
        $appt_end_time = array();

        foreach($data['date'] as $date){
            array_push($appt_date,$db->escape_str($date));
        }
        foreach($data['time1'] as $start_time){
            array_push($appt_start_time, $db->escape_str($start_time));
        }
        foreach($data['time2'] as $end_time){
            array_push($appt_end_time, $db->escape_str($end_time));
        }

        $appt_data = array();
        $appt_data['name'] = $appt_name;
        $appt_data['info'] = $appt_info;
        $appt_data['date'] = $appt_date;
        $appt_data['start_time'] = $appt_start_time;
        $appt_data['end_time'] = $appt_end_time;

        //add data to database
        $appt_id = $appointmentHandler->addAppointment($appt_name,$appt_info);
        if(!empty($appt_id) && strlen($appt_id) > 0){
            $count = 0;
            foreach($appt_data['date'] as $key => $date){
                $start_time = $appt_data['start_time'][$key];
                $end_time = $appt_data['end_time'][$key];
                $result_2 = $appointmentHandler->addAppointmentTiming($appt_id,$date,$start_time,$end_time);
                if(!empty($result_2) && strlen($result_2) > 0){
                    $count++;
                }
            }
            if($count == count($appt_data['date'])){
                if(isset($data['user_id']) && strlen($data['user_id']) > 0){
                    $user_id = $db->escape_str($data['user_id']);
                    $appointmentHandler->addAppointmentUser($appt_id,$user_id);
                }
                echo json_encode(array("status" => "success", "message" => "Appointment added successfully"));
            }else{
                echo json_encode(array("status" => "error", "message" => "Error adding appointment"));
            }
        }else{
            echo json_encode(array("status" => "error", "message" => "Failed to add appointment " . $appt_id));
        }
        die();
    }
    if($endpoint == "get_all_appointments"){
        //get all appointments from the database and return response in json format
        //从数据库中获取所有约会并以 json 格式返回响应
        $data = $appointmentHandler->getAppointments();
        echo json_encode(array("status" => "success", "data" => $data));
        die();
    }
    if($endpoint == "get_appointment_details"){
        //get appointment details from the database and return response in json format
        // 从数据库中获取约会详细信息并以 json 格式返回响应
        $data = array();
        $appt_id = $_POST['id'];
        $appt_id = $db->escape_str($appt_id);

        $result = $appointmentHandler->getAppointment($appt_id);
        if(count($result) > 0){
            $appt_data = $result;
            $appt_data['title'] = $appt_data['title'];
            $appt_data['info'] = $appt_data['info'];
            $result = $appointmentHandler->getAppointmentTimings($appt_id);
            $count = 0;
            foreach($result as $key => $value){
                $appt_data['dates'][$count]['id'] = $value['ID'];
                $appt_data['dates'][$count]['date'] = $value['date'];
                $date = new DateTime($value['date']);
                $appt_data['dates'][$count]['day'] = $date->format('d');
                $appt_data['dates'][$count]['month'] = $date->format('M');
                $appt_data['dates'][$count]['start_time'] = $value['start_time'];
                $appt_data['dates'][$count]['end_time'] = $value['end_time'];
                $count++;
            }
            echo json_encode(array("status" => "success", "data" => $appt_data));
        }else{
            echo json_encode(array("status" => "error", "message" => "Appointment not found"));
        }
        die();
    }
    if($endpoint == "delete_appointment"){
        //delete appointment from the database and return response in json format
        //从数据库中删除约会并以 json 格式返回响应
        $data = $_POST;
        $appt_id = $db->escape_str($data['id']);
        $result = $appointmentHandler->deleteAppointment($appt_id);
        if(!empty($result) && strlen($result) > 0){
            echo json_encode(array("status" => "success", "message" => "Appointment deleted successfully"));
        }else{
            echo json_encode(array("status" => "error", "message" => "Failed to delete appointment"));
        }
        die();
    }
    if($endpoint == "vote_appointment"){
        //vote for appointment and return response in json format
        // 以json格式投票任命并返回响应
        $data = $_POST;
        $appt_id = $db->escape_str($data['id']);
        $name =  $db->escape_str($data['name']);
        $dates =  json_encode($data['dates']) ;
        $result = $appointmentHandler->voteAppointment($appt_id,$name,$dates);
        if(!empty($result) && strlen($result) > 0){
            echo json_encode(array("status" => "success", "message" => "Vote added successfully"));
        }else{
            echo json_encode(array("status" => "error", "message" => "Failed to add vote"));
        }
        die();
    }
    if($endpoint == "get_appointment_votes"){
        //get votes for appointment and return response in json format
        // 获取预约投票并以 json 格式返回响应
        $data = $_POST;
        $appt_id = $db->escape_str($data['id']);
        $data = $appointmentHandler->getVotes($appt_id);
        echo json_encode(array("status" => "success", "data" => $data));
        die();
    }
    if($endpoint == "add_comments"){
        //add comments for appointment and return response in json format
        // 以 json 格式添加预约和返回响应的评论
        $data = $_POST;
        $appt_id = $db->escape_str($data['id']);
        $comment =  $db->escape_str($data['comment']);
        $name =  $db->escape_str($data['name']);
        //check if appointment exists
        // 检查约会是否存在
        $result = $appointmentHandler->getAppointment($appt_id);
        if(count($result) > 0){
            $result = $appointmentHandler->addComment($name,$appt_id,$comment);
            if(!empty($result) && strlen($result) > 0){
                echo json_encode(array("status" => "success", "message" => "Comment added successfully"));
            }else{
                echo json_encode(array("status" => "error", "message" => "Error adding comment"));
            }
        }else{
            echo json_encode(array("status" => "error", "message" => "Appointment not found"));
        }
        die();
    }
    if($endpoint == "get_all_comments"){
        //get all comments for appointment and return response in json format
        // 获取所有预约评论并以 json 格式返回响应
        $appt_id = $_POST['id'];
        $appt_id = $db->escape_str($appt_id);
        $data = $appointmentHandler->getComments($appt_id);
        echo json_encode(array("status" => "success", "data" => $data));
        die();
    }
    if($endpoint == "get_user_details"){
        //get user details from the database and return response in json format
        // 从数据库中获取用户详细信息并以 json 格式返回响应
        $id = $_POST['id'];
        $id = $db->escape_str($id);
        $result = $userHandler->getUser($id);
        if(count($result) > 0){
            $data = $result;
            echo json_encode(array("status" => "success", "data" => $data));
        }else{
            echo json_encode(array("status" => "error", "message" => "User not found"));
        }
        die();
    }
    if($endpoint == "get_appointments"){
        //get all appointments from the database and return response in json format
        // 从数据库中获取所有约会并以 json 格式返回响应
        $result = $appointmentHandler->getAllAppointmentTimings();
        $appt_data = array();
        $count = 0;
        foreach($result as $key => $value){
            $appt_data[$count]['id'] = $value['ID'];
            $appt_data[$count]['date'] = $value['date'];
            $date = new DateTime($value['date']);
            $appt_data[$count]['day'] = $date->format('d');
            $appt_data[$count]['month'] = $date->format('M');
            $appt_data[$count]['start_time'] = $value['start_time'];
            $appt_data[$count]['end_time'] = $value['end_time'];
            $count++;
        }
        echo json_encode(array("status" => "success", "data" => $appt_data));
        die();
    }
    if($endpoint == "register"){
        //validate data and register user and return response in json format
        // 验证数据并注册用户并以 json 格式返回响应
        $data = $_POST;
        $username = $db->escape_str($data['username']);
        $password = $db->escape_str($data['password']);
        $firstname = $db->escape_str($data['firstname']);
        $lastname = $db->escape_str($data['lastname']);
        $email = $db->escape_str($data['email']);
        $birthday = $db->escape_str($data['birthday']);

        if(!preg_match('/^[a-zA-Z0-9]{5,}$/', $username)){
            echo json_encode(array("status" => "error", "message" => "Username must be at least 5 characters long and contain only letters and numbers"));
            die();
        }
        if(strlen($password) < 8){
            echo json_encode(array("status" => "error", "message" => "Password must be at least 8 characters long"));
            die();
        }
        if(!preg_match('/^[a-zA-Z]{2,}$/', $firstname)){
            echo json_encode(array("status" => "error", "message" => "Firstname must be at least 2 characters long and contain only letters"));
            die();
        }
        if(!preg_match('/^[a-zA-Z]{2,}$/', $lastname)){
            echo json_encode(array("status" => "error", "message" => "Lastname must be at least 2 characters long and contain only letters"));
            die();
        }
        if(!filter_var($email, FILTER_VALIDATE_EMAIL)){
            echo json_encode(array("status" => "error", "message" => "Invalid email address"));
            die();
        }
        if(strlen($birthday) != 10){
            echo json_encode(array("status" => "error", "message" => "Invalid birthday"));
            die();
        }
        //check if username  exists
        if($userHandler->checkUsername($username)){
            echo json_encode(array("status" => "error", "message" => "Username already exists"));
            die();
        }
        //check if email exists
        if($userHandler->checkEmail($email)){
            echo json_encode(array("status" => "error", "message" => "Email already exists"));
            die();
        }
        $password = password_hash($password, PASSWORD_DEFAULT);
        $result = $userHandler->addUser($firstname,$lastname,$email,$username,$password,$birthday);
        if(!empty($result) && strlen($result) > 0){
            echo json_encode(array("status" => "success", "message" => "User registered successfully" , "ID" => $result , "name" => $firstname . " " . $lastname ) );
        }else{
            echo json_encode(array("status" => "error", "message" => "Error registering user "));
        }
        die();
    }
    if($endpoint == "login"){
        //validate data and login user and return response in json format
        // 验证数据和登录用户并以 json 格式返回响应
        $data = $_POST;
        $username = $db->escape_str($data['username']);
        $password = $db->escape_str($data['password']);

        if(!preg_match('/^[a-zA-Z0-9]{5,}$/', $username)){
            echo json_encode(array("status" => "error", "message" => "Username must be at least 5 characters long and contain only letters and numbers"));
            die();
        }
        if(strlen($password) < 8){
            echo json_encode(array("status" => "error", "message" => "Password must be at least 8 characters long"));
            die();
        }

        if($userHandler->checkUsername($username) == false){
            echo json_encode(array("status" => "error", "message" => "Username Not exists"));
            die();
        }
        $data = $userHandler->getUserByUsername($username);
        if(password_verify($password, $data['password'])){
            echo json_encode(array("status" => "success", "message" => "Login successful", "ID" => $data['ID'] , "name" => $data['firstname']." ".$data['lastname']));
        }else{
            echo json_encode(array("status" => "error", "message" => "Invalid password"));
        }
        die();
    }
    echo json_encode(array("status" => "error" , "message" => "Invalid endpoint"));
    die();
?>