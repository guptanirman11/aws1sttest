<?php
echo "Hello world";
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

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
    // Creating the connection between aws rds instance in order to add the responses using AJAX Call.
    $pdo = new mysqli($_SERVER['RDS_HOSTNAME'], $_SERVER['RDS_USERNAME'], $_SERVER['RDS_PASSWORD'], $_SERVER['RDS_DB_NAME'], $_SERVER['RDS_PORT']);

    // $pdo->query("DROP TABLE IF EXISTS timeofaction");
    // $pdo->query("DROP TABLE IF EXISTS reaction_time");
    // $pdo->query("DROP TABLE IF EXISTS response");
    // $pdo->query("DROP TABLE IF EXISTS ordering");

    // Create the required tables if they do not exist
    $pdo->query("CREATE TABLE IF NOT EXISTS timeofaction (pid VARCHAR(255) UNIQUE)");
    $pdo->query("CREATE TABLE IF NOT EXISTS reaction_time (pid VARCHAR(255) UNIQUE)");
    $pdo->query("CREATE TABLE IF NOT EXISTS response (pid VARCHAR(255) UNIQUE)");
    $pdo->query("CREATE TABLE IF NOT EXISTS ordering (pid VARCHAR(255) UNIQUE)");
    
    // Dummy value to check if the connection is perfect or not 
   
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
                        // $pdo->query("ALTER TABLE reaction_time ADD COLUMN IF NOT EXISTS $colname $ctype");
                        // $pdo->query("INSERT INTO reaction_time (pid, $colname) VALUES ('$name', '$dpoint') ON CONFLICT (pid) DO UPDATE SET $colname = '$dpoint'");
                        // $pdo->query("ALTER TABLE reaction_time ADD COLUMN $colname $ctype COLUMN_CHECK($colname IS NULL)");
                        
                        // Check if the column already exists in the table
                        $checkColumnQuery = "SELECT COLUMN_NAME
                        FROM INFORMATION_SCHEMA.COLUMNS
                        WHERE TABLE_NAME = 'reaction_time'
                        AND COLUMN_NAME = '$colname'";

                        $checkColumnResult = $pdo->query($checkColumnQuery);

                        if ($checkColumnResult->num_rows === 0) {
                        // Add the column with the desired data type
                        $alterTableQuery = "ALTER TABLE reaction_time ADD COLUMN $colname $ctype";
                        $pdo->query($alterTableQuery);}

                        // insert statement
                        $pdo->query("INSERT INTO reaction_time (pid, $colname) VALUES ('$name', '$dpoint') ON DUPLICATE KEY UPDATE $colname='$dpoint'");
                        error_log($dpoint, $with_script_tags=FALSE);
                    } else if(substr($col, -1) === 'R'){
                        // The subject response
                        $ctype = 'text';
                        $colname = substr($col, 0, -1);
                        // $pdo->query("ALTER TABLE response ADD COLUMN IF NOT EXISTS $colname $ctype");
                        // $pdo->query("ALTER TABLE response ADD COLUMN $colname $ctype COLUMN_CHECK($colname IS NULL)");

                        // checking if column already exist
                        $checkColumnQuery = "SELECT COLUMN_NAME
                        FROM INFORMATION_SCHEMA.COLUMNS
                        WHERE TABLE_NAME = 'response'
                        AND COLUMN_NAME = '$colname'";

                        $checkColumnResult = $pdo->query($checkColumnQuery);

                        #adding the column if it does not exist
                        if ($checkColumnResult->num_rows === 0) {
                            // Add the column with the desired data type
                            $alterTableQuery = "ALTER TABLE response ADD COLUMN $colname $ctype";
                            $pdo->query($alterTableQuery);}

                        $pdo->query("INSERT INTO response (pid, $colname) VALUES ('$name', '$dpoint') ON DUPLICATE KEY UPDATE $colname='$dpoint'");
                        // $pdo->query("INSERT INTO response (pid, $colname) VALUES ('$name', '$dpoint') ON CONFLICT (pid) DO UPDATE SET $colname = '$dpoint'");
                        error_log($dpoint, $with_script_tags=FALSE);
                    } else if(substr($col, -1) === 'O'){
                        // The ordering number that shows in which order the subject saw each task.
                        $ctype = 'integer';
                        $colname = substr($col, 0, -1);
                        $dpoint = round($dpoint);

                        // $pdo->query("ALTER TABLE ordering ADD COLUMN IF NOT EXISTS $colname $ctype");
                        // $pdo->query("INSERT INTO ordering (pid, $colname) VALUES ('$name', '$dpoint') ON CONFLICT (pid) DO UPDATE SET $colname = '$dpoint'");

                        // checking if column already exist
                        $checkColumnQuery = "SELECT COLUMN_NAME
                        FROM INFORMATION_SCHEMA.COLUMNS
                        WHERE TABLE_NAME = 'ordering'
                        AND COLUMN_NAME = '$colname'";

                        $checkColumnResult = $pdo->query($checkColumnQuery);

                        #adding the column if it does not exist
                        if ($checkColumnResult->num_rows === 0) {
                            // Add the column with the desired data type
                            $alterTableQuery = "ALTER TABLE ordering ADD COLUMN $colname $ctype";
                            $pdo->query($alterTableQuery);}
                        $pdo->query("INSERT INTO ordering (pid, $colname) VALUES ('$name', '$dpoint') ON DUPLICATE KEY UPDATE $colname='$dpoint'");

                    }

                }
            }
        }
        error_log("Data inserted successfully");
    }

} catch(\PDOException $e) {
    error_log('PDOException: ' . $e->getMessage() . ' in ' . $e->getFile() . ' on line ' . $e->getLine());
    throw new \PDOException($e->getMessage(), (int)$e->getCode());
  }

?>