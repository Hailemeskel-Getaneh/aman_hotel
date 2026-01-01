<?php
class Database {
    // DB Paarams
    private $host = 'localhost';
    private $db_name = 'hotel_management';
    private $username = 'root';
    private $password = '';
    private $conn;

    // DB Connect
    public function connect() {
        $this->conn = null;

        try {
            $this->conn = new PDO('mysql:host=' . $this->host . ';dbname=' . $this->db_name, $this->username, $this->password);
            $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            $this->conn->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
        } catch(PDOException $e) {
            header('Content-Type: application/json');
            http_response_code(500);
            echo json_encode(array(
                'status' => 'error',
                'message' => 'Database Connection Error: ' . $e->getMessage()
            ));
            exit();
        }

        return $this->conn;
    }
}
