<?php
    class SqliteDB {
        private $db = null;

        public function __construct($db_name = 'socialMD.db') {
            try {
                $this->db = new SQLite3($db_name);
            }
            catch (Exception $e) {
                echo json_encode(['error' => 'Unable to connect to the database']);
                exit();
            }
        }

        public function user_exist($username) {
            $stmt = $this->db->prepare('SELECT * FROM users WHERE username = :username');
            $stmt->bindValue(':username', $username, SQLITE3_TEXT);
            $result = $stmt->execute();

            return $result->fetchArray();
        }

        public function insert_user($username, $password, $confirm) {
            if (!(strlen($username) > 0 && strlen($password) > 0)) {
                return ['error' => 'Empty username or password field'];
            }

            if ($password != $confirm) {
                return ['error' => 'Incorrect cofirmation password'];
            }
            
            $stmt = $this->db->prepare('INSERT INTO users (username, password) VALUES (:username, :password)');
            $stmt->bindValue(':username', $username, SQLITE3_TEXT);
            $stmt->bindValue(':password', password_hash($password, PASSWORD_DEFAULT), SQLITE3_TEXT);
            
            return $stmt->execute();
        }

        public function get_user_data($username) {
            $result = $this->user_exist($username);

            if ($result == false) {
                return ['error' => 'User not found'];
            }

            $stmt = $this->db->prepare('SELECT username, password FROM users WHERE username = :username');
            $stmt->bindValue(':username', $username, SQLITE3_TEXT);
            $result = $stmt->execute();

            return $result->fetchArray();
        }

        public function delete_user($username) {
            $stmt = $this->db->prepare('DELETE FROM users WHERE username = :username');
            $stmt->bindValue(':username', $username);
            $result = $stmt->execute();

            return $this->db->changes();
        }
    }
?>