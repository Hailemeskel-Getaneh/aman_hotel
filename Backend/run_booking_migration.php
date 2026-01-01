<?php
// Migration Runner for Bookings Table Schema Fix
header('Content-Type: text/html; charset=utf-8');

echo "<!DOCTYPE html>
<html>
<head>
    <title>Bookings Migration Runner</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 50px auto; padding: 20px; }
        .success { color: green; background: #e8f5e9; padding: 10px; border-radius: 5px; margin: 10px 0; }
        .error { color: red; background: #ffebee; padding: 10px; border-radius: 5px; margin: 10px 0; }
        .info { color: blue; background: #e3f2fd; padding: 10px; border-radius: 5px; margin: 10px 0; }
        pre { background: #f5f5f5; padding: 10px; border-radius: 5px; overflow-x: auto; }
    </style>
</head>
<body>
    <h1>🔧 Bookings Table Migration</h1>
    <p>This script will update the bookings table schema to support multi-room bookings.</p>
";

include_once 'config/Database.php';

try {
    $database = new Database();
    $db = $database->connect();
    
    echo "<div class='info'>✓ Database connection established</div>";
    
    // Read the migration SQL file
    $sqlFile = __DIR__ . '/migrations/fix_bookings_schema.sql';
    
    if (!file_exists($sqlFile)) {
        throw new Exception("Migration file not found: $sqlFile");
    }
    
    echo "<div class='info'>✓ Migration file found</div>";
    
    $sql = file_get_contents($sqlFile);
    
    // Split by semicolons and execute each statement
    $statements = array_filter(
        array_map('trim', explode(';', $sql)),
        function($stmt) {
            // Filter out empty statements and comments
            return !empty($stmt) && 
                   !preg_match('/^\s*--/', $stmt) && 
                   !preg_match('/^\s*$/', $stmt);
        }
    );
    
    echo "<div class='info'>Found " . count($statements) . " SQL statements to execute</div>";
    
    $successCount = 0;
    $errors = [];
    
    foreach ($statements as $index => $statement) {
        try {
            // Skip USE statements as we're already connected
            if (stripos(trim($statement), 'USE ') === 0) {
                continue;
            }
            
            $db->exec($statement);
            $successCount++;
            
            // Show progress for important statements
            if (stripos($statement, 'ALTER TABLE') !== false || 
                stripos($statement, 'CREATE INDEX') !== false) {
                $preview = substr(trim($statement), 0, 80);
                echo "<div class='success'>✓ Executed: " . htmlspecialchars($preview) . "...</div>";
            }
            
        } catch (PDOException $e) {
            // Some errors are expected (e.g., "column already exists")
            $errorMsg = $e->getMessage();
            
            // Ignore "already exists" errors
            if (stripos($errorMsg, 'Duplicate column') !== false ||
                stripos($errorMsg, 'already exists') !== false) {
                echo "<div class='info'>ℹ " . htmlspecialchars($errorMsg) . "</div>";
            } else {
                $errors[] = "Statement " . ($index + 1) . ": " . $errorMsg;
                echo "<div class='error'>✗ Error: " . htmlspecialchars($errorMsg) . "</div>";
            }
        }
    }
    
    echo "<hr>";
    
    if (empty($errors)) {
        echo "<div class='success'><h2>✓ Migration Completed Successfully!</h2>";
        echo "<p>Executed $successCount SQL statements.</p>";
        echo "<p>The bookings table now supports:</p>";
        echo "<ul>";
        echo "<li>Multi-room bookings via <code>room_type_id</code> and <code>quantity</code></li>";
        echo "<li>Payment tracking via <code>tx_ref</code></li>";
        echo "<li>Flexible booking by room type or specific room</li>";
        echo "</ul>";
        echo "</div>";
        
        // Show updated table structure
        echo "<h3>Updated Bookings Table Structure:</h3>";
        $stmt = $db->query("DESCRIBE bookings");
        $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        echo "<pre>";
        foreach ($columns as $col) {
            echo sprintf("%-20s %-20s %-10s %-10s\n", 
                $col['Field'], 
                $col['Type'], 
                $col['Null'], 
                $col['Key']
            );
        }
        echo "</pre>";
        
    } else {
        echo "<div class='error'><h2>⚠ Migration completed with errors</h2>";
        echo "<p>Some statements failed. Please review the errors above.</p>";
        echo "</div>";
    }
    
} catch (Exception $e) {
    echo "<div class='error'><h2>✗ Migration Failed</h2>";
    echo "<p>" . htmlspecialchars($e->getMessage()) . "</p>";
    echo "</div>";
}

echo "
    <hr>
    <p><a href='run_booking_migration.php'>↻ Run Again</a> | <a href='../Frontend'>← Back to App</a></p>
</body>
</html>";
?>
