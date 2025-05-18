<?php
    require 'database.php';
    require 'router.php';

    session_start();

    $path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
    $router = new Router;

    $router->add('/', function () {
        if (isset($_SESSION['username'])) {
            header('Location: index.html');
        }
        else {
            header('Location: /html/login.html');
        }
    });

    $router->add('/register', function () {
        $input = file_get_contents('php://input');
        $data = json_decode($input, true);

        $db = new SqliteDB('socialMD.db');

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

    $router->add('/login', function () {
        $input = file_get_contents('php://input');
        $data = json_decode($input, true);
         
        $db = new SQLiteDB('socialMD.db');
        
        $result = $db->verify_password($data['username'], $data['password']);
        if (!$result['success']) {
            echo json_encode($result);
            exit();
        }

        $_SESSION['username'] = $data['username'];
        echo json_encode(['success' => true, 'username' => $data['username']]);
    });

    $router->add('/logout', function () {
        unset($_SESSION['username']);

        echo json_encode(['success' => true, 'message' => 'logout successful']);
    });

    $router->add('/delete-account', function () {        
        $db = new SQLiteDB('socialMD.db');
        $result = $db->delete_user($_SESSION['username']);

        if ($result == 0) {
            echo json_encode(['error' => 'Unable to delete user']);
            exit();
        }

        unset($_SESSION['username']);
        echo json_encode(['success' => true, 'message' => 'Account deletion successful']);
    });

    $router->add('/change-username', function ()  {
        $input = file_get_contents('php://input');
        $data = json_decode($input, true);

        $db = new SQLiteDB('socialMD.db');

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

    $router->add('/create-post', function () {
        $input = file_get_contents('php://input');
        $data = json_decode($input, true);
        $date = date('Y-m-d');

        $db = new SQLiteDB('socialMD.db');

        date_default_timezone_set('Asia/Manila');
        $date = [
            'date-ui' => date('M j \a\t g:i A'),
            'date-tooltip' => date('l, M j, Y \a\t g:i A')
        ];
        $date = json_encode($date);

        $result = $db->create_post($data['caption'], $date);
        if ($result['changes'] == 0) {
            echo json_encode(['success' => false, 'error' => 'Unable to createa post']);
        }

        $data['date'] = $date;
        $data['post_id'] = $result['post_id']; 

        echo json_encode(['success' => true, 'post_data' => $data]);
    });

    $router->add('/load-feed', function () {
        $db = new SQLiteDB('socialMD.db');

        $result = $db->get_feed();

        echo json_encode(['result' => $result]);
    });

    $router->add('/delete-post', function () {
        $input = file_get_contents('php://input');
        $data = json_decode($input, true);

        $db = new SQLiteDB('socialMD.db');
        $result = $db->delete_post($data['post_id']);

        if ($result == 0) {
            echo json_encode(['success' => false]);
        }

        echo json_encode(['success' => true]);
    });

    $router->dispatch($path);
?>