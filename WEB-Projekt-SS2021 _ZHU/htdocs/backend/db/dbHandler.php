<?php
    require_once 'db.php';
    require 'model/appointment.php';
    require 'model/user.php';
    //use OOP to create a class for the database handler
    //使用 OOP 为数据库处理程序创建一个类
    class dbHandler {
        private $conn;

        //create a constructor to connect to the database
        //创建一个构造函数来连接数据库
        public function __construct() {
            $this->conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
        }
        //create a function to run a query
        //创建一个函数来运行查询
        public function runQuery($query,$type) {
            if($type == "insert") {
                $result = $this->conn->query($query);
                return $this->conn->insert_id;
            } else {
                $result = $this->conn->query($query);
                return $result;
            }
        }
        //create a function to escape special characters from a string
        //创建一个函数来转义字符串中的特殊字符
        public function escape_str($str){
            return $this->conn->real_escape_string($str);
        }
        //create a function to fetch all rows from a query
        //创建一个函数以从查询中获取所有行
        public function fetch_all($result) {
            $rows = array();
            while($row = $result->fetch_assoc()) {
                $rows[] = $row;
            }
            return $rows;
        }
    }
?>