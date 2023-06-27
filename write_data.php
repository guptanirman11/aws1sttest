<?php
echo "Hello world";
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// $db = parse_url(getenv("DATABASE_URL"));

// Heroku handles the connstring part of this. 
// Presumably our credentials are safe so we needn't take any safety measures here?

$data_array = json_decode(file_get_contents("php://input"), true);
// console_log($data_array)

function console_log($output, $with_script_tags = true) {
    $js_code = 'console.log(' . json_encode($output, JSON_HEX_TAG) . 
');';
    if ($with_script_tags) {
        $js_code = '<script>' . $js_code . '</script>';
    }
    echo $js_code;
}

try{
    // $pdo = new PDO("pgsql:" . sprintf(
    //     "host=%s;port=%s;user=%s;password=%s;dbname=%s",
    //     $db["host"],
    //     $db["port"],
    //     $db["user"],
    //     $db["pass"],
    //     ltrim($db["path"], "/")
    // ));

    $pdo = new mysqli($_SERVER['RDS_HOSTNAME'], $_SERVER['RDS_USERNAME'], $_SERVER['RDS_PASSWORD'], $_SERVER['RDS_DB_NAME'], $_SERVER['RDS_PORT']);

    // $query = "SELECT 1";
    // $result = $pdo->query($query);
    
    // if ($result !== false) {
    //     // Connection and query execution were successful
    //     console_log("Connection to the database established successfully");
        
    //     // Continue with your data insertion logic here
        
    //     // ...
    // } else {
    //     // Connection or query execution failed
    //     console_log("Failed to connect to the database or execute query");
    // }
    // console_log($result);
    // Create the required tables if they do not exist
    $pdo->query("CREATE TABLE IF NOT EXISTS timeofaction (pid INT PRIMARY KEY)");
    $pdo->query("CREATE TABLE IF NOT EXISTS reaction_time (pid INT, colname INT)");
    $pdo->query("CREATE TABLE IF NOT EXISTS response (pid INT, colname TEXT)");
    $pdo->query("CREATE TABLE IF NOT EXISTS ordering (pid INT, colname INT)");
    
    try {
        // Insert a record with pid = 21 into the timeofaction table
        $insertQuery = "INSERT INTO timeofaction (pid) VALUES (11)";
        $pdo->query($insertQuery);
    
        // Fetch the record with pid = 21
        $selectQuery = "SELECT * FROM timeofaction WHERE pid = 21";
        $result = $pdo->query($selectQuery);
    
        if ($result !== false) {
            // Fetch the row
            $row = mysqli_fetch_assoc($result);
    
            if ($row) {
                // Log the fetched record to the console
                console_log($row);
            } else {
                console_log("Record with pid = 21 not found");
            }
        } else {
            console_log("Failed to execute the fetch query");
        }
    
        // Delete the record with pid = 21
        $deleteQuery = "DELETE FROM timeofaction WHERE pid = 21";
        $pdo->query($deleteQuery);
    } catch (\PDOException $e) {
        throw new \PDOException($e->getMessage(), (int)$e->getCode());
    }
    



    // The access object
    if (is_array($data_array) || is_object($data_array)) {
        foreach ($data_array as $name => $data){
            // $pdo->query("INSERT INTO timeofaction (pid) VALUES ('$name') ON CONFLICT DO NOTHING");
            $pdo->query("INSERT INTO timeofaction (pid) VALUES ('$name') ON DUPLICATE KEY UPDATE pid=pid");
            foreach ($data as $result){
                $colnames = [];
                $colvals = [];
                foreach ($result as $col => $dpoint){
                    if(substr($col, -1) === 'T'){
                        // For reaction times
                        $ctype = 'integer';
                        $colname = substr($col, 0, -1);
                        $dpoint = round($dpoint);
                        $pdo->query("ALTER TABLE reaction_time ADD COLUMN IF NOT EXISTS $colname $ctype");
                        // $pdo->query("INSERT INTO reaction_time (pid, $colname) VALUES ('$name', '$dpoint') ON CONFLICT (pid) DO UPDATE SET $colname = '$dpoint'");
                        $pdo->query("INSERT INTO reaction_time (pid, $colname) VALUES ('$name', '$dpoint') ON DUPLICATE KEY UPDATE $colname='$dpoint'");
                        console_log($dpoint, $with_script_tags=FALSE);
                    } else if(substr($col, -1) === 'R'){
                        // The subject response
                        $ctype = 'text';
                        $colname = substr($col, 0, -1);
                        $pdo->query("ALTER TABLE response ADD COLUMN IF NOT EXISTS $colname $ctype");
                        $pdo->query("INSERT INTO response (pid, $colname) VALUES ('$name', '$dpoint') ON DUPLICATE KEY UPDATE $colname='$dpoint'");
                        // $pdo->query("INSERT INTO response (pid, $colname) VALUES ('$name', '$dpoint') ON CONFLICT (pid) DO UPDATE SET $colname = '$dpoint'");
                    } else if(substr($col, -1) === 'O'){
                        // The ordering number that shows in which order the subject saw each task.
                        $ctype = 'integer';
                        $colname = substr($col, 0, -1);
                        $dpoint = round($dpoint);
                        $pdo->query("ALTER TABLE ordering ADD COLUMN IF NOT EXISTS $colname $ctype");
                        // $pdo->query("INSERT INTO ordering (pid, $colname) VALUES ('$name', '$dpoint') ON CONFLICT (pid) DO UPDATE SET $colname = '$dpoint'");
                        $pdo->query("INSERT INTO ordering (pid, $colname) VALUES ('$name', '$dpoint') ON DUPLICATE KEY UPDATE $colname='$dpoint'");

                    }

                }
            }
        }
        console_log("Data inserted successfully");
    }

} catch(\PDOException $e) {
    throw new \PDOException($e->getMessage(), (int)$e->getCode());
  }

?>