<?php 
    //USer class to handle user related functions
    //用于处理用户相关功能的 User类
    class User {
        private $db;
        //create a constructor to connect to the database
        //创建一个构造函数来连接数据库
        public function __construct() {
            $this->db = new dbHandler();
        }
        //create a function to get all users
        //创建一个函数来获取所有用户
        public function getUsers() {
            $sql = "SELECT * FROM users";
            $result = $this->db->runQuery($sql, "select");
            //return all users
            $users = $this->db->fetch_all($result);
            return $users;
        }
        //create a function to get a single user
        //创建一个函数来获取单个用户
        public function getUser($id) {
            $sql = "SELECT * FROM users WHERE ID = $id";
            $result = $this->db->runQuery($sql, "select");
            return $result->fetch_assoc();
        }
        //get user by username
        //通过用户名获取用户
        public function getUserByUsername($username) {
            $sql = "SELECT * FROM users WHERE username = '$username'";
            $result = $this->db->runQuery($sql, "select");
            return $result->fetch_assoc();
        }
        //create a function to add a user
        //创建一个添加用户的函数
        public function addUser($firstname, $lastname, $email,$username, $password, $birthday) {
            $sql = "INSERT INTO users(firstname,lastname,email,username,password,birthday) VALUES('$firstname','$lastname','$email','$username','$password','$birthday')";
            $result = $this->db->runQuery($sql,"insert");
            return $result;
        }
        //create a function to update a user
        //创建一个函数来更新用户
        public function updateUser($id, $firstname, $lastname, $email,$username, $password, $birthday) {
            $sql = "UPDATE users SET firstname = '$firstname', lastname = '$lastname', email = '$email', username = '$username', password = '$password', birthday = '$birthday' WHERE id = $id";
            $result = $this->db->runQuery($sql,"update");
            return $result;
        }
        //create a function to delete a user
        //创建一个删除用户的函数
        public function deleteUser($id) {
            $sql = "DELETE FROM users WHERE id = $id";
            $result = $this->db->runQuery($sql,"delete");
            return $result;
        }
        //create a function to check if username exists
        //创建一个函数来检查用户名是否存在
        public function checkUsername($username) {
            $sql = "SELECT * FROM users WHERE username = '$username'";
            $result = $this->db->runQuery($sql, "select");
            if($result->num_rows > 0) {
                return true;
            } else {
                return false;
            }
        }
        //create a function to check if email exists
        //创建一个函数来检查电子邮件是否存在
        public function checkEmail($email) {
            $sql = "SELECT * FROM users WHERE email = '$email'";
            $result = $this->db->runQuery($sql, "select");
            if($result->num_rows > 0) {
                return true;
            } else {
                return false;
            }
        }
    }
?>