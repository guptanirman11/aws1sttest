<?php
try {
    exec('python3 bin/generate_data.py');
} catch (Exception $e) {
    // Handle the exception here
    error_log('An error occurred: ' . $e->getMessage());
}
?>