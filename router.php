<?php
    class Router {
        private $routes = [];

        public function add($path, $handler) {
            $this->routes[$path] = $handler;
        }

        public function dispatch($path) {
            if (array_key_exists($path, $this->routes)) {
                $handler = $this->routes[$path];

                call_user_func($handler);
            }
            else {
                echo 'Page not found';
            }
        }

    }
?>