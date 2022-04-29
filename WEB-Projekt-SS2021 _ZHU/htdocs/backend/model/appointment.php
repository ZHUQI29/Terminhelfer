<?php 
    class Appointment {
        //create a variable to hold the database connection
        //创建一个变量来保存数据库连接
        private $db;
        
        //create a constructor to connect to the database
        //创建一个构造函数来连接数据库
        public function __construct() {
            $this->db = new dbHandler();
        }
        
        //create a function to get all appointments
        //创建一个函数来获取所有约会
        public function getAppointments() {
            $sql = "SELECT * FROM appointments";
            $result = $this->db->runQuery($sql, "select");
            //return all appointments
            $appointments = $this->db->fetch_all($result);
            return $appointments;
        }
        
        //create a function to get a single appointment
        //创建一个函数来获得一个约会
        public function getAppointment($id) {
            $sql = "SELECT * FROM appointments WHERE id = $id";
            $result = $this->db->runQuery($sql, "select");
            return $result->fetch_assoc();
        }
        
        //create a function to add an appointment
        public function addAppointment($name, $info) {
            $sql = "INSERT INTO appointments(title,info,date_created) VALUES('$name','$info',NOW())";
            $result = $this->db->runQuery($sql,"insert");
            return $result;
        }
        
        //create a function to update an appointment
        //创建一个更新约会的函数
        public function updateAppointment($id, $name, $email, $phone, $date, $time, $service) {
            $sql = "UPDATE appointments SET name = '$name', email = '$email', phone = '$phone', date = '$date', time = '$time', service = '$service' WHERE id = $id";
            $result = $this->db->runQuery($sql,"update");
            return $result;
        }
        public function voteAppointment($id, $name,$dates) {
            //add a vote to the vote table
            //在投票表中添加投票
            $sql = "INSERT INTO appt_votes(appt_id,name,vote) VALUES('$id','$name','$dates')";
            $result = $this->db->runQuery($sql,"insert");
            return $result;

        }
        
        public function getVotes($id) {
            $sql = "SELECT * FROM appt_votes WHERE appt_id = $id";
            $result = $this->db->runQuery($sql, "select");
            //return all appointments
            //返回所有约会
            $data = $this->db->fetch_all($result);
            $dates = $this->getAppointmentTimings($id);
            $output = array();
            $output['dates'] = $dates;
            $votes = array();
            foreach($data as $row) {
                $vote = array(
                    'name' => $row['name'],
                    'vote' =>  json_decode($row['vote'],true)
                );
                array_push($votes, $vote);
            }
            $output['votes'] = $votes;
            return $output;
        }
        //create a function to delete an appointment
        //创建一个删除约会的函数
        public function deleteAppointment($id) {
            $sql = "DELETE FROM appointments WHERE id = $id";
            $result = $this->db->runQuery($sql,"delete");

            //delete appointment timings
            //删除约会时间
            $sql_2 = "DELETE FROM appt_timings WHERE appt_id = $id";
            $result_2 = $this->db->runQuery($sql_2,"delete");

            return $result;
        }

        public function addAppointmentTiming($appt,$date,$start_time,$end_time) {
            $sql = "INSERT INTO appt_timings(appt_id,date,start_time,end_time) VALUES('$appt','$date','$start_time','$end_time')";
            $result = $this->db->runQuery($sql,"insert");
            return $result;
        }

        public function getAppointmentTimings($appt) {
            $sql = "SELECT * FROM appt_timings WHERE appt_id = $appt";
            $result = $this->db->runQuery($sql,"select");
            $appt_timings = $this->db->fetch_all($result);
            return $appt_timings;
        }
        //get appointment timings by id
        //通过 id 获取预约时间
        public function getAppointmentTiming($id) {
            $sql = "SELECT * FROM appt_timings WHERE ID = $id";
            $result = $this->db->runQuery($sql,"select");
            return $result->fetch_assoc();
        }
        //update appointment timings
        public function getAllAppointmentTimings() {
            $sql = "SELECT * FROM appt_timings  ORDER BY date DESC";
            $result = $this->db->runQuery($sql,"select");
            return $this->db->fetch_all($result);
        }

        //add appointment user
        //更新预约时间
        public function addAppointmentUser($appt,$user) {
            $sql = "INSERT INTO appt_users(appt_id,user_id) VALUES('$appt','$user')";
            $result = $this->db->runQuery($sql,"insert");
            return $result;
        }
        //add comment in the database
        //在数据库中添加评论
        public function addComment($user,$appt,$comment) {
            $sql = "INSERT INTO comments(user_name,appt_id,comment) VALUES('$user','$appt','$comment')";
            $result = $this->db->runQuery($sql,"insert");
            return $result;
        }
        //get all comments
        //获取所有评论
        public function getComments($appt) {
            $sql = "SELECT * FROM comments WHERE appt_id = $appt ORDER BY ID DESC";
            $result = $this->db->runQuery($sql,"select");
            $comments = $this->db->fetch_all($result);
            return $comments;
        }
    }
?>