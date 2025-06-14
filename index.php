<?php
    session_start();

    require 'database.php';
    require 'router.php';

    $path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
    $router = new Router;
    $db = new Database('socialMD.db');

    $router->add('/', function () {
        if (isset($_SESSION['username']) && isset($_SESSION['user_id'])) {
            header('Location: index.html');
        }
        else {
            header('Location: /html/login.html');
        }
    });

    // User Management
    $router->add('/load-user-data', function () use ($db) {
        $result = $db->get_user_data($_SESSION['user_id']);

        echo json_encode(['success' => true, 'user_data' => $result]);
    });

    $router->add('/update-profile-image', function () use ($db) {
        $data = get_json_input();
        
        $result = $db->update_profile_image($data['profile_image']);
        if ($result == 0) {
            echo json_encode(['success' => false]);
            exit();
        }

        echo json_encode(['success' => true]);
    });

    // Authentications
    $router->add('/login', function () use ($db) {
        $data = get_json_input();
        
        $result = $db->verify_password($data['username'], $data['password']);
        if (!$result['success']) {
            echo json_encode($result);
            exit();
        }

        $user_id = $db->get_user_id($data['username']);
        $user_id = $user_id['id'];

        $_SESSION['username'] = $data['username'];
        $_SESSION['user_id'] = $user_id;
        echo json_encode(['success' => true, 'username' => $data['username']]);
    });

    $router->add('/logout', function () {
        unset($_SESSION['username']);
        unset($_SESSION['user_id']);

        echo json_encode(['success' => true, 'message' => 'logout successful']);
    });

    $router->add('/register', function () use ($db) {
        $data = get_json_input();

        $result = $db->user_exist($data['username']);
        if ($result != false) {
            echo json_encode(['error' => 'Username already exist']);
            exit();
        }
        
        $result = $db->insert_user($data['username'], $data['password'], $data['confirm']);
        if (is_array($result) && isset($result['error'])) {
            echo json_encode($result);
            exit();    
        }

        echo json_encode(['success' => true]);
    });

    // User Management
    $router->add('/delete-account', function () use ($db) {        
        $result = $db->delete_user($_SESSION['username']);

        if ($result == 0) {
            echo json_encode(['error' => 'Unable to delete user']);
            exit();
        }

        unset($_SESSION['username']);
        echo json_encode(['success' => true, 'message' => 'Account deletion successful']);
    });

    $router->add('/change-username', function () use ($db) {
        $data = get_json_input();

        $result = $db->verify_password($_SESSION['username'], $data['password']);
        if (!$result['success']) {
            echo json_encode($result);
            exit();
        }

        $result = $db->user_exist($data['username']);
        if ($result != false) {
            echo json_encode(['success' => false, 'error' => 'Username already taken']);
            exit();
        }
        
        $result = $db->change_username($_SESSION['username'], $data['username']);
        if ($result == 0) {
            echo json_encode(['success' => fasle, 'error' => 'Unable to change username']);
            exit();
        }

        $_SESSION['username'] = $data['username'];
        echo json_encode(['success' => true, 'username' => $data['username']]);
    });

    // Content Management
    $router->add('/load-feed', function () use ($db) {
        $result = $db->get_feed();
        echo json_encode(['result' => $result]);
    });

    $router->add('/create-post', function () use ($db) {
        $data = get_json_input();
        
        date_default_timezone_set('Asia/Manila');
        $date = [
            'date-ui' => date('F j \a\t g:i A'),
            'date-tooltip' => date('l, F j, Y \a\t g:i A')
        ];
        $date = json_encode($date);

        if ($data['caption'] == '') {
            echo json_encode(['success' => false, 'error' => 'No post caption input found']);
            exit();
        }

        $result = $db->create_post($data['caption'], $data['images'], $date);
        if ($result['changes'] == 0) {
            echo json_encode(['success' => false, 'error' => 'Unable to createa post']);
        }

        $data['date'] = $date;
        $data['post_id'] = $result['post_id']; 
        $data['images'] = $data['images'];
        $data['reactions'] = 0;
        $data['reacted'] = 'F';
        $data['comments'] = 0;

        echo json_encode(['success' => true, 'post_data' => $data]);
    });

    $router->add('/update-post', function () use ($db) {
        $data = get_json_input();

        $result = $db->update_post($data['post_id'], $data['caption'], $data['images']);
        if ($result == 0) {
            echo json_encode(['success' => false]);
            exit();
        }

        echo json_encode(['success' => true]);
    });

    $router->add('/delete-post', function () use ($db) {
        $data = get_json_input();

        $result = $db->delete_post($data['post_id']);
        if ($result == 0) {
            echo json_encode(['success' => false]);
        }

        echo json_encode(['success' => true]);
    });

    $router->add('/toggle-reaction', function () use ($db) {
        $data = get_json_input();

        $result = $db->toggle_reaction($data['post_id']);
        if ($result['changes'] == 0) {
            echo json_encode(['success' => false]);
            exit();
        }

        echo json_encode(['success' => true, 'action' => $result['action']]);
    });

    $router->add('/load-comments', function () use ($db) {
        $data = get_json_input();

        $result = $db->get_comments($data['post_id']);
        echo json_encode(['result' => $result]);
    });

    $router->add('/create-comment', function () use ($db) {
        $data = get_json_input();
        $date = date('F j, Y');
        
        $result = $db->create_comment($data['post_id'], $date, $data['comment_text']);
        if ($result['changes'] == 0) {
            echo json_encode(['success' => false]);
            exit();
        }

        $data['date'] = $date;
        $data['comment_id'] = $result['comment_id'];
        
        echo json_encode(['success' => true, 'data' => $data]);
    });

    $router->add('/delete-comment', function () use ($db) {
        $data = get_json_input();

        $result = $db->delete_comment($data['comment_id']);
        if ($result == 0) {
            echo json_encode(['success' => false]);
            exit();
        }

        echo json_encode(['success' => true]);
    });
    
    // Friends
    $router->add('/my-friends', function () use ($db) {
        if (isset($_SESSION['username']) && isset($_SESSION['user_id'])) {
            header('Location: /html/my-friends.html');
        }
        else {
            header('Location: /html/login.html');
        }
    });

    $router->add('/get-friends', function () use ($db) {
        $friends = $db->get_friends($_SESSION['username']);
        echo json_encode(['users' => $friends]);
    });

    $router->add('/friends', function () {
        if (isset($_SESSION['username']) && isset($_SESSION['user_id'])) {
            header('Location: /html/friends.html');
        }
        else {
            header('Location: /html/login.html');
        }
    });
    
    $router->add('/friend-requests', function () use ($db) {
        $result = $db->get_friend_requests();
        echo json_encode(['users' => $result]);
    });

    $router->add('/find-friends', function () use ($db) {
        $result = $db->find_friends();
        $hidden_users = $db->get_hidden_users_count();
        echo json_encode(['users' => $result, 'hidden_users' => $hidden_users]);
    });

    $router->add('/add-friend', function () use ($db) {
        $data = get_json_input();

        $friend_id = $db->get_user_id($data['username']);
        if ($friend_id == false) {
            echo json_encode(['success' => false, 'error' => 'friend_id not found']);
            exit();
        }
        $friend_id = $friend_id['id'];

        $result = $db->send_friend_request($friend_id);
        if ($result == 0) {
            echo json_encode(['success' => false, 'error' => 'Unable to send friend request']);
            exit();
        }

        echo json_encode(['success' => true]);
    });

    $router->add('/accept-friend-request', function () use ($db) {
        $data = get_json_input();

        $result = $db->accept_friend_request($data['username']);
        if ($result == 0) {
            echo json_encode(['success' => false, 'error' => 'Unable to accept friend request']);
            exit();
        }
        
        echo json_encode(['success' => true]);
    });

    // For deleting and canceling friend requests, and unfriending user
    $router->add('/delete-friend-status', function () use ($db) {
        $data = get_json_input();

        $result = $db->delete_friend_status($data['username']);
        if ($result == 0) {
            echo json_encode(['success' => false, 'error' => 'Unable to delete friend status']);
            exit();
        }

        echo json_encode(['success' => true]);
    });

    $router->add('/hide-user', function () use ($db) {
        $data = get_json_input();

        $friend_id = $db->get_user_id($data['username']);
        if ($friend_id == false) {
            echo json_encode(['success' => false, 'error' => 'friend_id not found']);
            exit();
        }
        $friend_id = $friend_id['id'];

        $result = $db->hide_user($friend_id);
        if ($result == 0) {
            echo json_encode(['success' => false, 'error' => 'Unable to hide user']);
            exit();
        }

        echo json_encode(['success' => true]);
    });

    $router->add('/unhide-hidden-users', function () use ($db) {
        $result = $db->unhide_hidden_users();
        if ($result == 0) {
            echo json_encode(['success' => false]);
            exit();
        }

        echo json_encode(['success' => true]);
    });

    $router->dispatch($path);

    // Auxilliary
    function get_json_input() {
        $input = file_get_contents('php://input');
        return json_decode($input, true);
    }
?>