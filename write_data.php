<?php
echo "Hello world";
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// $db = parse_url(getenv("DATABASE_URL"));

// Heroku handles the connstring part of this. 
// Presumably our credentials are safe so we needn't take any safety measures here?

$data_array = json_decode(file_get_contents("php://input"), true);

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

    $dbhost = $_SERVER['RDS_HOSTNAME'];
    $dbport = $_SERVER['RDS_PORT'];
    $dbname = $_SERVER['RDS_DB_NAME'];
    $charset = 'utf8' ;

    $dsn = "pgsql:host={$dbhost};port={$dbport};dbname={$dbname};charset={$charset}";
    $username = $_SERVER['RDS_USERNAME'];
    $password = $_SERVER['RDS_PASSWORD'];

    $pdo = new PDO($dsn, $username, $password);

    // $db_host = getenv("RDS_HOSTNAME");
    // $db_port = getenv("RDS_PORT");
    // $db_name = getenv("RDS_DB_NAME");
    // $db_user = getenv("RDS_USERNAME");
    // $db_pass = getenv("RDS_PASSWORD");

    // $pdo = new PDO("pgsql:host=$db_host;port=$db_port;dbname=$db_name", $db_user, $db_pass);
    // $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    // The access object
    foreach ($data_array as $name => $data){
        $pdo->query("INSERT INTO timeofaction (pid) VALUES ('$name') ON CONFLICT DO NOTHING");

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
                    $pdo->query("INSERT INTO reaction_time (pid, $colname) VALUES ('$name', '$dpoint') ON CONFLICT (pid) DO UPDATE SET $colname = '$dpoint'");
                    console_log($dpoint, $with_script_tags=FALSE);
                } else if(substr($col, -1) === 'R'){
                    // The subject response
                    $ctype = 'text';
                    $colname = substr($col, 0, -1);
                    $pdo->query("ALTER TABLE response ADD COLUMN IF NOT EXISTS $colname $ctype");
                    $pdo->query("INSERT INTO response (pid, $colname) VALUES ('$name', '$dpoint') ON CONFLICT (pid) DO UPDATE SET $colname = '$dpoint'");
                } else if(substr($col, -1) === 'O'){
                    // The ordering number that shows in which order the subject saw each task.
                    $ctype = 'integer';
                    $colname = substr($col, 0, -1);
                    $dpoint = round($dpoint);
                    $pdo->query("ALTER TABLE ordering ADD COLUMN IF NOT EXISTS $colname $ctype");
                    $pdo->query("INSERT INTO ordering (pid, $colname) VALUES ('$name', '$dpoint') ON CONFLICT (pid) DO UPDATE SET $colname = '$dpoint'");

                }

            }
        }
    }
    console_log("Data inserted successfully");

} catch(\PDOException $e) {
    throw new \PDOException($e->getMessage(), (int)$e->getCode());
  }

?>