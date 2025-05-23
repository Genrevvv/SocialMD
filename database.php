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

        // Auxiliaries
        public function user_exist($username) {
            $stmt = $this->db->prepare('SELECT * FROM users WHERE username = :username');
            $stmt->bindValue(':username', $username, SQLITE3_TEXT);
            $result = $stmt->execute();

            return $result->fetchArray();
        }

        public function get_user_id($username) {
            $stmt = $this->db->prepare('SELECT id FROM users WHERE username = :username');
            $stmt->bindValue(':username', $username, SQLITE3_TEXT);
            $result = $stmt->execute();

            return $result->fetchArray();
        }

        public function verify_password($username, $password) {
            $result = $this->user_exist($username);

            if ($result == false) {
                return ['success' => false, 'error' => 'User not found'];
            }

            $stmt = $this->db->prepare('SELECT password FROM users WHERE username = :username');
            $stmt->bindValue(':username', $username, SQLITE3_TEXT);
            $result = $stmt->execute()->fetchArray();

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
            $stmt->bindValue(':username', $username, SQLITE3_TEXT);
            $stmt->bindValue(':password', password_hash($password, PASSWORD_DEFAULT), SQLITE3_TEXT);
            
            return $stmt->execute();
        }

        public function delete_user($username) {
            $stmt = $this->db->prepare('DELETE FROM users WHERE username = :username');
            $stmt->bindValue(':username', $username);
            $result = $stmt->execute();

            return $this->db->changes();
        }

        public function change_username($old_username, $new_username) {
            $stmt = $this->db->prepare('UPDATE users SET username = :new_username WHERE username = :old_username');
            $stmt->bindValue(':new_username', $new_username, SQLITE3_TEXT);
            $stmt->bindValue(':old_username', $old_username, SQLITE3_TEXT);
            $result = $stmt->execute();

            return $this->db->changes();
        }
        
        // Content Management
        public function get_feed() {
            $stmt = $this->db->prepare('
                SELECT posts.id AS post_id, username, date, caption
                FROM posts
                JOIN users ON posts.user_id = users.id
                WHERE users.username = :username'
            );

            $stmt->bindValue(':username', $_SESSION['username'], SQLITE3_TEXT);
            $result = $stmt->execute();

            $data = [];
            while ($row = $result->fetchArray(SQLITE3_ASSOC)) {
                $data[] = $row;
            }

            return $data;
        }

        public function create_post($caption, $date) {
            $result = $this->get_user_id($_SESSION['username']);
            $user_id = $result['id'];

            $stmt = $this->db->prepare('INSERT INTO posts (user_id, date, caption) VALUES (:user_id, :date, :caption)');
            $stmt->bindValue(':user_id', $user_id, SQLITE3_INTEGER);
            $stmt->bindValue(':date', $date, SQLITE3_TEXT);
            $stmt->bindValue(':caption', $caption, SQLITE3_TEXT);
            $stmt->execute();

            $changes = $this->db->changes();
            if ($changes == 0) {
                return ['changes' => $changes];
            }
            
            return ['changes' => $changes, 'post_id' => $this->db->lastInsertRowID()];
        }

        public function delete_post($post_id) {
            $stmt = $this->db->prepare('DELETE FROM posts WHERE id = :post_id');
            $stmt->bindValue(':post_id', $post_id);
            $stmt->execute();

            return $this->db->changes();
        }

        public function update_post($post_id, $caption) {
            $stmt = $this->db->prepare('UPDATE posts SET caption = :caption WHERE id = :post_id');
            $stmt->bindValue(':caption', $caption, SQLITE3_TEXT);
            $stmt->bindValue(':post_id', $post_id, SQLITE3_INTEGER);
            $stmt->execute();

            return $this->db->changes();
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

            $stmt->bindValue('user_id', $_SESSION['user_id'], SQLITE3_INTEGER);
            $result = $stmt->execute();

            $data = [];
            while ($row = $result->fetchArray(SQLITE3_ASSOC)) {
                $data[] = $row;
            }

            return $data;
        }

        public function accept_friend_request($username) {
            $friend_id = $this->get_user_id($username);
            if ($friend_id === false) {
                return 0;
            }
            $friend_id = $friend_id['id'];

            $stmt = $this->db->prepare('
                UPDATE friends 
                SET status = "F" 
                WHERE user_id = :friend_id
                AND friend_id = :user_id'
            );
            $stmt->bindValue('friend_id', $friend_id, SQLITE3_INTEGER);
            $stmt->bindValue('user_id', $_SESSION['user_id'], SQLITE3_INTEGER);
            $stmt->execute();

            return $this->db->changes();
        }

        public function delete_friend_request($username) {
            $friend_id = $this->get_user_id($username);
            if ($friend_id === false) {
                return 0;
            }
            $friend_id = $friend_id['id'];

            $stmt = $this->db->prepare('DELETE FROM friends WHERE user_id = :friend_id AND friend_id = :user_id');
            $stmt->bindValue('friend_id', $friend_id, SQLITE3_INTEGER);
            $stmt->bindValue('user_id', $_SESSION['user_id'], SQLITE3_INTEGER);
            $stmt->execute();

            return $this->db->changes();
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

            $stmt->bindValue(':user_id', $user_id, SQLITE3_INTEGER);
            $result = $stmt->execute();

            $data = [];
            while ($row = $result->fetchArray(SQLITE3_ASSOC)) {
                $data[] = $row;
            }

            return $data;
        }

        public function send_friend_request($user_id, $friend_id) {
            $stmt = $this->db->prepare('INSERT OR IGNORE INTO friends (user_id, friend_id) VALUES (:user_id, :friend_id)');
            $stmt->bindValue(':user_id', $user_id, SQLITE3_INTEGER);
            $stmt->bindValue(':friend_id', $friend_id, SQLITE3_INTEGER);
            $stmt->execute();

            return $this->db->changes();
        }

        public function cancel_friend_request($user_id, $friend_id) {
            $stmt = $this->db->prepare('DELETE FROM friends WHERE user_id = :user_id AND friend_id = :friend_id');
            $stmt->bindValue(':user_id', $user_id, SQLITE3_INTEGER);
            $stmt->bindValue(':friend_id', $friend_id, SQLITE3_INTEGER);
            $stmt->execute();

            return $this->db->changes();        
        }
    }
?>