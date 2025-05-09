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

        $result = $db->get_user_data($data['username']);
        if (isset($result['error'])) {
            echo json_decode($result);
            exit();
        }

        $match = password_verify($data['password'], $result['password']);
        if (!$match) {
            echo json_encode(['error' => 'Incorrect password']);
            exit();
        }

        $_SESSION['username'] = $data['username'];
        echo json_encode(['success' => true]);
    });

    $router->dispatch($path);
?>