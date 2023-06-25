<?php

$db = parse_url(getenv("DATABASE_URL"));

$data_array = json_decode(file_get_contents("php://input"));


try{
    $pdo = new PDO("pgsql:" . sprintf(
        "host=%s;port=%s;user=%s;password=%s;dbname=%s",
        $db["host"],
        $db["port"],
        $db["user"],
        $db["pass"],
        ltrim($db["path"], "/")
    ));

    $time = $data_array->time;
    $pid = $data_array->pid;
    // Sends in the total time in ms that the person spend taking the battery.
    $pdo->query("INSERT INTO time_elapsed (pid, time_elapsed) VALUES ('$pid', $time)");
} catch(\PDOException $e) {
    throw new \PDOException($e->getMessage(), (int)$e->getCode());
  }