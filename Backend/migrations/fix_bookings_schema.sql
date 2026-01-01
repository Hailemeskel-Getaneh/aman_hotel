-- Migration: Fix Bookings Table Schema
-- This migration adds support for room_type_id, quantity, and tx_ref columns
-- to enable multi-room bookings and payment tracking

USE `hotel_management`;

-- Step 1: Add room_type_id column (nullable to support existing bookings)
ALTER TABLE `bookings`
ADD COLUMN IF NOT EXISTS `room_type_id` int(11) DEFAULT NULL AFTER `user_id`;

-- Step 2: Add quantity column (default 1 for existing bookings)
ALTER TABLE `bookings`
ADD COLUMN IF NOT EXISTS `quantity` int(11) DEFAULT 1 AFTER `room_type_id`;

-- Step 3: Add tx_ref column for payment tracking
ALTER TABLE `bookings`
ADD COLUMN IF NOT EXISTS `tx_ref` varchar(255) DEFAULT NULL AFTER `status`;

-- Step 4: Make room_id nullable (to support bookings by room_type_id)
-- First, we need to check if there's a foreign key constraint
SET @fk_name = (
    SELECT CONSTRAINT_NAME 
    FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
    WHERE TABLE_SCHEMA = 'hotel_management' 
    AND TABLE_NAME = 'bookings' 
    AND COLUMN_NAME = 'room_id' 
    AND REFERENCED_TABLE_NAME IS NOT NULL
    LIMIT 1
);

-- Drop the foreign key if it exists
SET @sql = IF(@fk_name IS NOT NULL,
    CONCAT('ALTER TABLE `bookings` DROP FOREIGN KEY `', @fk_name, '`'),
    'SELECT "No foreign key to drop"'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Modify room_id to be nullable
ALTER TABLE `bookings`
MODIFY COLUMN `room_id` int(11) DEFAULT NULL;

-- Re-add the foreign key constraint
ALTER TABLE `bookings`
ADD CONSTRAINT `bookings_ibfk_2` FOREIGN KEY (`room_id`) REFERENCES `rooms` (`room_id`) ON DELETE CASCADE;

-- Step 5: Add foreign key constraint for room_type_id
-- Check if constraint already exists
SET @fk_exists = (
    SELECT COUNT(*)
    FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS
    WHERE CONSTRAINT_SCHEMA = 'hotel_management'
    AND TABLE_NAME = 'bookings'
    AND CONSTRAINT_NAME = 'bookings_room_type_fk'
);

SET @sql = IF(@fk_exists = 0,
    'ALTER TABLE `bookings` ADD CONSTRAINT `bookings_room_type_fk` FOREIGN KEY (`room_type_id`) REFERENCES `room_types` (`type_id`) ON DELETE RESTRICT ON UPDATE CASCADE',
    'SELECT "Foreign key bookings_room_type_fk already exists"'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Step 6: Add indexes for better query performance
CREATE INDEX IF NOT EXISTS `idx_bookings_room_type` ON `bookings` (`room_type_id`);
CREATE INDEX IF NOT EXISTS `idx_bookings_status` ON `bookings` (`status`);
CREATE INDEX IF NOT EXISTS `idx_bookings_dates` ON `bookings` (`check_in`, `check_out`);
CREATE INDEX IF NOT EXISTS `idx_bookings_tx_ref` ON `bookings` (`tx_ref`);

-- Step 7: Update existing bookings to populate room_type_id from room_id
UPDATE `bookings` b
INNER JOIN `rooms` r ON b.room_id = r.room_id
SET b.room_type_id = r.room_type_id
WHERE b.room_type_id IS NULL AND b.room_id IS NOT NULL;

-- Done!
SELECT 'Bookings table migration completed successfully!' as Status;
