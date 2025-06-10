<?php
    class Database {
        private $db = null;

        public function __construct($db_name = 'socialMD.db') {
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

        public function reaction_exist($post_id) {
            $stmt = $this->db->prepare('
                SELECT *
                FROM reactions 
                WHERE post_id = :post_id
                AND user_id = :user_id'
            );
            $stmt->execute(['post_id' => $post_id, 'user_id' => $_SESSION['user_id']]);

            return $stmt->fetch(PDO::FETCH_ASSOC);
        }

        // User Management
        public function insert_user($username, $password, $confirm) {
            if (!(strlen($username) > 0 && strlen($password) > 0)) {
                return ['error' => 'Empty username or password field'];
            }

            if ($password != $confirm) {
                return ['error' => 'Incorrect cofirmation password'];
            }
            
            $stmt = $this->db->prepare('
                INSERT INTO users (username, password, profile_image)
                 VALUES (:username, :password, :profile_image)');

            return $stmt->execute([
                'username' => $username, 
                'password' => password_hash($password, PASSWORD_DEFAULT),
                'profile_image' => '/assets/images/user.png'
            ]);
        }

        public function delete_user($username) {
            $stmt = $this->db->prepare('DELETE FROM users WHERE username = :username');
            $stmt->execute(['username' => $username]);

            return $stmt->rowCount();
        }

        public function get_user_data($user_id) {
            $stmt = $this->db->prepare('SELECT username, profile_image FROM users WHERE id = :user_id');
            $stmt->execute(['user_id' => $user_id]);
            
            return $stmt->fetch(PDO::FETCH_ASSOC);
        }

        public function update_profile_image($profile_image) {
            $stmt = $this->db->prepare('
                UPDATE users 
                SET profile_image = :profile_image 
                WHERE id = :user_id'
            );
            $stmt->execute(['profile_image' => $profile_image, 'user_id' => $_SESSION['user_id']]);

            return $stmt->rowCount();
        }

        public function change_username($old_username, $new_username) {
            $stmt = $this->db->prepare('
                UPDATE users 
                SET username = :new_username 
                WHERE username = :old_username'
            );
            $stmt->execute(['new_username' => $new_username, 'old_username' => $old_username]);

            return $stmt->rowCount();   
        }
        
        // Content Management
        public function get_feed() {
            $stmt = $this->db->prepare('
                SELECT 
                    username, 
                    profile_image, 
                    posts.id AS post_id, 
                    posts.date AS date, 
                    caption, 
                    images, 
                    COUNT(DISTINCT reactions.id) AS reactions,
                    COUNT(DISTINCT comments.id) AS comments,
                    IF(user_reactions.id IS NOT NULL, "T", "F") AS reacted
                FROM posts
                JOIN users ON posts.user_id = users.id
                LEFT JOIN reactions ON posts.id = reactions.post_id
                LEFT JOIN reactions AS user_reactions 
                    ON posts.id = user_reactions.post_id AND user_reactions.user_id = :user_id
                LEFT JOIN comments ON posts.id = comments.post_id
                WHERE users.id = :user_id
                OR users.id IN (
                        SELECT user_id FROM friends WHERE friend_id = :user_id AND status = "F"
                        UNION
                        SELECT friend_id FROM friends WHERE user_id = :user_id AND status = "F"
                    )
                GROUP BY posts.id'
            );
            $stmt->execute(['user_id' => $_SESSION['user_id']]);
            
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

        public function toggle_reaction($post_id) {
            $result = $this->reaction_exist($post_id);
            
            $query = '';
            $action = 0;

            if ($result == false) {
                $query = '
                    INSERT INTO reactions (post_id, user_id)
                    VALUES (:post_id, :user_id)
                ';

                $action = 1; // Add reaction
            }
            else {
                $query = '
                    DELETE FROM reactions
                    WHERE post_id = :post_id
                    AND user_id = :user_id
                ';  

                $action = 0; // Remove reaction
            }

            $stmt = $this->db->prepare($query);
            $stmt->execute(['post_id' => $post_id, 'user_id' => $_SESSION['user_id']]);
            
            return ['changes' => $stmt->rowCount(), 'action' => $action];
        }

        public function get_comments($post_id) {
            $stmt = $this->db->prepare('
                SELECT
                    comments.id as comment_id,
                    username,
                    profile_image,
                    date,
                    comment_text
                FROM comments 
                JOIN users ON comments.user_id = users.id
                WHERE post_id = :post_id'
            );
            $stmt->execute(['post_id' => $post_id]);
            
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        }

        public function create_comment($post_id, $date, $comment_text) {
            $stmt = $this->db->prepare('
                INSERT INTO comments (user_id, post_id, date, comment_text)
                VALUES (:user_id, :post_id, :date, :comment_text);
            ');

            $stmt->execute([
                'user_id' => $_SESSION['user_id'],
                'post_id' => $post_id,
                'date' => $date,
                'comment_text' => $comment_text
            ]);

            return ['changes' => $stmt->rowCount(), 'comment_id' => $this->db->lastInsertID()];
        }

        public function delete_comment($comment_id) {
            $stmt = $this->db->prepare('DELETE FROM comments WHERE id = :comment_id');
            $stmt->execute(['comment_id' => $comment_id]);

            return $stmt->rowCount();
        }

        // Friends
        public function get_friends($username) {
            $result = $this->get_user_id($username);
            $user_id = $result['id'];
            
            $stmt = $this->db->prepare('
                SELECT username, profile_image
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

        public function get_friend_requests() {
            $stmt = $this->db->prepare('
                SELECT username, profile_image
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

        public function find_friends() {
            $result = $this->get_user_id($_SESSION['username']);
            $user_id = $result['id'];
            
            $stmt = $this->db->prepare('
                SELECT username, profile_image
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

        // Hide users and hidden users
        public function get_hidden_users_count() {
            $stmt = $this->db->prepare('SELECT COUNT(*) as hidden_users FROM friends WHERE user_id = :user_id AND status = "H"');
            $stmt->execute(['user_id' => $_SESSION['user_id']]);

            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            return $result['hidden_users'];
        }

        public function hide_user($friend_id) {
            $stmt = $this->db->prepare('
                INSERT IGNORE INTO friends (user_id, friend_id, status)
                VALUES (:user_id, :friend_id, :status)'
            );
            
            $stmt->execute([
                'friend_id' => $friend_id, 
                'user_id' => $_SESSION['user_id'],
                'status' => 'H'
            ]);

            return $stmt->rowCount();
        }

        public function unhide_hidden_users() {
            $stmt = $this->db->prepare('DELETE FROM friends WHERE user_id = :user_id AND status = "H"');
            $stmt->execute(['user_id' => $_SESSION['user_id']]);
            
            return $stmt->rowCount();
        }
    }
?>