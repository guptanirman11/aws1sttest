<?php
try {
    
    exec('python3 bin/generate_data.py');
    // console_log('Command given: ' . $e->getMessage());
} catch (Exception $e) {
    // Handle the exception here
    error_log('An error occurred: ' . $e->getMessage());
}
?>