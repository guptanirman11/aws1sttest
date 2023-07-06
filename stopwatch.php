<?php

// $db = parse_url(getenv("DATABASE_URL"));

$data_array = json_decode(file_get_contents("php://input"));


try{
    // $pdo = new PDO("pgsql:" . sprintf(
    //     "host=%s;port=%s;user=%s;password=%s;dbname=%s",
    //     $db["host"],
    //     $db["port"],
    //     $db["user"],
    //     $db["pass"],
    //     ltrim($db["path"], "/")
    // ));

    #Database connection using mysqli
    $pdo = new mysqli($_SERVER['RDS_HOSTNAME'], $_SERVER['RDS_USERNAME'], $_SERVER['RDS_PASSWORD'], $_SERVER['RDS_DB_NAME'], $_SERVER['RDS_PORT']);
    
    $pdo->query("CREATE TABLE IF NOT EXISTS time_elapsed (pid VARCHAR(255) UNIQUE)");

    $checkColumnQuery = "SELECT COLUMN_NAME
                        FROM INFORMATION_SCHEMA.COLUMNS
                        WHERE TABLE_NAME = 'time_elapsed'
                        AND COLUMN_NAME = 'time_elapsed'";

    $checkColumnResult = $pdo->query($checkColumnQuery);

    if ($checkColumnResult->num_rows === 0) {
    // Add the column with the desired data type
    $alterTableQuery = "ALTER TABLE time_elapsed ADD COLUMN time_elapsed DATE";
    $pdo->query($alterTableQuery);}

    $time = $data_array->time;
    $pid = $data_array->pid;
    // Sends in the total time in ms that the person spend taking the battery.
    $pdo->query("INSERT INTO time_elapsed (pid, time_elapsed) VALUES ('$pid', $time)");
} catch(\PDOException $e) {
    throw new \PDOException($e->getMessage(), (int)$e->getCode());
  }