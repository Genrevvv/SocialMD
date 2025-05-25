<?php
    class Database {
        private $db = null;

        public function __construct($db_name = 'socialMD.db') {
            $config = require 'config.php';
            $config = require 'config.php';

            try {
                $this->db = new PDO(
                    "mysql:host={$config['db_host']};dbname={$config['db_name']}",
                    $config['db_user'],
                    $config['db_pass']
                );

               $this->db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            }
            catch (PDOException $e) {
                echo json_encode(['error' => 'Unable to connect', 'log' => $e->getMessage()]);
                exit();
            }
        }

        // Auxiliaries
        public function user_exist($username) {
            $stmt = $this->db->prepare('SELECT * FROM users WHERE username = :username');
            $stmt->execute(['username' => $username]);

            return $stmt->fetch(PDO::FETCH_ASSOC);
        }

        public function get_user_id($username) {
            $stmt = $this->db->prepare('SELECT id FROM users WHERE username = :username');
            $stmt->execute(['username' => $username]);

            return $stmt->fetch(PDO::FETCH_ASSOC);
        }

        public function verify_password($username, $password) {
            $result = $this->user_exist($username);

            if ($result == false) {
                return ['success' => false, 'error' => 'User not found'];
            }

            $stmt = $this->db->prepare('SELECT password FROM users WHERE username = :username');
            $stmt->execute(['username' => $username]);
            $result = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!password_verify($password, $result['password'])) {
                echo json_encode(['success' => false, 'error' => 'Incorrect password']);
                exit();
            }

            return ['success' => true];
        }

        // User Management
        public function insert_user($username, $password, $confirm) {
            if (!(strlen($username) > 0 && strlen($password) > 0)) {
                return ['error' => 'Empty username or password field'];
            }

            if ($password != $confirm) {
                return ['error' => 'Incorrect cofirmation password'];
            }
            
            $stmt = $this->db->prepare('INSERT INTO users (username, password) VALUES (:username, :password)');

            return $stmt->execute([
                'username' => $username, 
                'password' => password_hash($password, PASSWORD_DEFAULT)
            ]);
        }

        public function delete_user($username) {
            $stmt = $this->db->prepare('DELETE FROM users WHERE username = :username');
            $stmt->execute(['username' => $username]);

            return $stmt>rowCount();
        }

        public function change_username($old_username, $new_username) {
            $stmt = $this->db->prepare('UPDATE users SET username = :new_username WHERE username = :old_username');
            $stmt->execute(['new_username' => $new_username, 'old_username' => $old_username]);

            return $stmt->rowCount();
        }
        
        // Content Management
        public function get_feed() {
            $stmt = $this->db->prepare('
                SELECT posts.id AS post_id, username, date, caption, images
                FROM posts
                JOIN users ON posts.user_id = users.id
                WHERE users.username = :username'
            );

            $stmt->execute(['username' => $_SESSION['username']]);

            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        }

        public function create_post($caption, $images, $date) {
            $stmt = $this->db->prepare('INSERT INTO posts (user_id, date, caption, images) VALUES (:user_id, :date, :caption, :images)');
            $stmt->execute([
                'user_id' => $_SESSION['user_id'],
                'date' => $date,
                'caption' => $caption,
                'images' => json_encode($images)
            ]);

            if ($stmt->rowCount() == 0) {
                return ['changes' => $changes];
            }
            
            return ['changes' => $stmt->rowCount(), 'post_id' => $this->db->lastInsertID()];
        }

        public function update_post($post_id, $caption, $images) {
            $stmt = $this->db->prepare('UPDATE posts SET caption = :caption, images = :images WHERE id = :post_id');
            $stmt->execute([
                'caption' => $caption, 
                'images' => json_encode($images), 
                'post_id' => $post_id
            ]);

            return $stmt->rowCount();
        }

        public function delete_post($post_id) {
            $stmt = $this->db->prepare('DELETE FROM posts WHERE id = :post_id');
            $stmt->execute(['post_id' => $post_id]);

            return $stmt->rowCount();
        }

        // Friends
        public function get_friend_requests() {
            $stmt = $this->db->prepare('
                SELECT username
                FROM users
                WHERE id IN (
                    SELECT user_id 
                    FROM friends 
                    WHERE friend_id = :user_id 
                    AND status = "P"
                )'
            );
            $stmt->execute(['user_id' => $_SESSION['user_id']]);

            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        }

        public function accept_friend_request($username) {
            $friend_id = $this->get_user_id($username);
            $friend_id = $friend_id['id'] ?? 0;

            if ($friend_id === 0) {
                return 0;
            }

            $stmt = $this->db->prepare('
                UPDATE friends 
                SET status = "F" 
                WHERE user_id = :friend_id
                AND friend_id = :user_id'
            );
            $stmt->execute(['friend_id' => $friend_id, 'user_id' => $_SESSION['user_id']]);

            return $stmt->rowCount();
        }

        public function delete_friend_status($username) {
            $friend_id = $this->get_user_id($username);
            $friend_id = is_array($friend_id) ? ($friend_id['id'] ?? 0) : 0;

            if ($friend_id == 0) {
                return 0;
            }

            $stmt = $this->db->prepare('
                DELETE FROM friends 
                WHERE (user_id = :user_id OR user_id = :friend_id)
                AND (friend_id = :user_id OR friend_id = :friend_id)
            ');
            $stmt->execute(['friend_id' => $friend_id, 'user_id' => $_SESSION['user_id']]);

            return $stmt->rowCount();
        }

        public function find_friends() {
            $result = $this->get_user_id($_SESSION['username']);
            $user_id = $result['id'];
            
            $stmt = $this->db->prepare('
                SELECT username 
                FROM users 
                WHERE id != :user_id
                AND id NOT IN (
                    SELECT user_id FROM friends WHERE friend_id = :user_id
                    UNION
                    SELECT friend_id FROM friends WHERE user_id = :user_id
                )'
            );
            $stmt->execute(['user_id' => $user_id]);

            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        }

        public function send_friend_request($friend_id) {
            $stmt = $this->db->prepare('INSERT IGNORE INTO friends (user_id, friend_id) VALUES (:user_id, :friend_id)');
            $stmt->execute(['friend_id' => $friend_id, 'user_id' => $_SESSION['user_id']]);

            return $stmt->rowCount();
        }

        // public function cancel_friend_request($friend_id) {
        //     $stmt = $this->db->prepare('DELETE FROM friends WHERE user_id = :user_id AND friend_id = :friend_id');
        //     $stmt->execute(['friend_id' => $friend_id, 'user_id' => $_SESSION['user_id']]);

        //     return $stmt->rowCount();
        // }

        public function get_friends($username) {
            $result = $this->get_user_id($username);
            $user_id = $result['id'];
            
            $stmt = $this->db->prepare('
                SELECT username
                FROM users 
                WHERE id != :user_id
                AND id IN (
                    SELECT user_id FROM friends WHERE friend_id = :user_id AND status = "F"
                    UNION
                    SELECT friend_id FROM friends WHERE user_id = :user_id AND status = "F"
                )
            ');
            $stmt->execute(['user_id' => $user_id]);

            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        }
    }
?>