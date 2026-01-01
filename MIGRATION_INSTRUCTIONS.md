# How to Run the Database Migration

The room type feature requires updating your database. The `room_types` table doesn't exist yet, which is why you can't create room types.

## Option 1: Using phpMyAdmin (Easiest)

1. Open phpMyAdmin: `http://localhost/phpmyadmin`
2. Click on `hotel_management` database in the left sidebar
3. Click the "SQL" tab at the top
4. Copy and paste the ENTIRE contents of `Backend/migrations/add_room_types.sql`
5. Click "Go" button at the bottom
6. You should see "Query executed successfully"

## Option 2: Using MySQL Command Line

1. Open Command Prompt (not PowerShell)
2. Navigate to XAMPP MySQL bin directory:
   ```cmd
   cd C:\xampp\mysql\bin
   ```
3. Run the migration:
   ```cmd
   mysql -u root hotel_management < "C:\xampp\htdocs\Aman-Hotel\Backend\migrations\add_room_types.sql"
   ```

## Option 3: Fresh Database Install

If you don't have important data, you can recreate the entire database:

1. Open phpMyAdmin: `http://localhost/phpmyadmin`
2. Drop the existing database:
   - Click on `hotel_management`
   - Click "Operations" tab
   - Scroll down and click "Drop the database"
3. Click the "SQL" tab
4. Copy and paste the ENTIRE contents of `Backend/database_updated.sql`
5. Click "Go"

## Verify Migration Worked

After running the migration, test this URL in your browser:
```
http://localhost/Aman-Hotel/Backend/api/room-types/read.php
```

You should see:
```json
{"message":"No Room Types Found"}
```

If you see this, the migration worked! Now refresh your admin panel and try creating a room type.

## Still Having Issues?

If you get errors, please share:
1. The exact error message
2. Which method you tried
3. Screenshot of the error (if possible)
