-- COPY THIS ENTIRE FILE AND PASTE INTO phpMyAdmin SQL TAB
-- This will create the room_types table and update the rooms table

USE `hotel_management`;

-- Step 1: Create room_types table
CREATE TABLE IF NOT EXISTS `room_types` (
  `type_id` int(11) NOT NULL AUTO_INCREMENT,
  `type_name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `price_per_night` decimal(10,2) NOT NULL,
  `image_url` varchar(255) DEFAULT NULL,
  `amenities` text DEFAULT NULL,
  `max_occupancy` int(11) DEFAULT 2,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`type_id`),
  UNIQUE KEY `type_name` (`type_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Step 2: Check if rooms table has old structure
-- If room_type column exists, migrate data
SET @column_exists = (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = 'hotel_management'
  AND TABLE_NAME = 'rooms'
  AND COLUMN_NAME = 'room_type'
);

-- Step 3: Migrate existing room types to room_types table (only if old structure exists)
INSERT IGNORE INTO `room_types` (`type_name`, `description`, `price_per_night`, `max_occupancy`)
SELECT DISTINCT 
    r.room_type,
    r.description,
    r.price_per_night,
    CASE 
        WHEN LOWER(r.room_type) LIKE '%single%' THEN 1
        WHEN LOWER(r.room_type) LIKE '%double%' THEN 2
        WHEN LOWER(r.room_type) LIKE '%suite%' THEN 4
        WHEN LOWER(r.room_type) LIKE '%deluxe%' THEN 3
        ELSE 2
    END as max_occupancy
FROM rooms r
WHERE EXISTS (
    SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = 'hotel_management'
    AND TABLE_NAME = 'rooms'
    AND COLUMN_NAME = 'room_type'
);

-- Step 4: Add room_type_id column if it doesn't exist
SET @column_exists_new = (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = 'hotel_management'
  AND TABLE_NAME = 'rooms'
  AND COLUMN_NAME = 'room_type_id'
);

SET @sql = IF(@column_exists_new = 0,
    'ALTER TABLE `rooms` ADD COLUMN `room_type_id` int(11) DEFAULT NULL AFTER `room_number`',
    'SELECT "Column room_type_id already exists"'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Step 5: Populate room_type_id based on existing room_type (if old column exists)
UPDATE rooms r
INNER JOIN room_types rt ON r.room_type = rt.type_name
SET r.room_type_id = rt.type_id
WHERE EXISTS (
    SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = 'hotel_management'
    AND TABLE_NAME = 'rooms'
    AND COLUMN_NAME = 'room_type'
)
AND r.room_type_id IS NULL;

-- Step 6: Add foreign key constraint if it doesn't exist
SET @fk_exists = (
    SELECT COUNT(*)
    FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS
    WHERE CONSTRAINT_SCHEMA = 'hotel_management'
    AND TABLE_NAME = 'rooms'
    AND CONSTRAINT_NAME = 'fk_room_type'
);

SET @sql = IF(@fk_exists = 0,
    'ALTER TABLE `rooms` ADD CONSTRAINT `fk_room_type` FOREIGN KEY (`room_type_id`) REFERENCES `room_types` (`type_id`) ON DELETE RESTRICT ON UPDATE CASCADE',
    'SELECT "Foreign key fk_room_type already exists"'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Step 7: Remove old columns if they exist
SET @sql = IF(@column_exists > 0,
    'ALTER TABLE `rooms` DROP COLUMN `room_type`, DROP COLUMN `price_per_night`, DROP COLUMN `description`',
    'SELECT "Old columns already removed or never existed"'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Step 8: Add index for better query performance
CREATE INDEX IF NOT EXISTS `idx_room_type_status` ON `rooms` (`room_type_id`, `status`);

-- Done! You should see "Query executed successfully"
SELECT 'Migration completed successfully!' as Status;
