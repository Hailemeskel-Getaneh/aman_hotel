-- Migration: Add Room Types System
-- This script creates the room_types table and migrates existing room data

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

-- Step 2: Migrate existing room types to room_types table
-- Extract unique room types from existing rooms
INSERT INTO `room_types` (`type_name`, `description`, `price_per_night`, `max_occupancy`)
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
WHERE NOT EXISTS (
    SELECT 1 FROM room_types rt WHERE rt.type_name = r.room_type
);

-- Step 3: Add room_type_id column to rooms table
ALTER TABLE `rooms` 
ADD COLUMN `room_type_id` int(11) DEFAULT NULL AFTER `room_number`;

-- Step 4: Populate room_type_id based on existing room_type
UPDATE rooms r
INNER JOIN room_types rt ON r.room_type = rt.type_name
SET r.room_type_id = rt.type_id;

-- Step 5: Add foreign key constraint
ALTER TABLE `rooms`
ADD CONSTRAINT `fk_room_type` 
FOREIGN KEY (`room_type_id`) REFERENCES `room_types` (`type_id`) 
ON DELETE RESTRICT ON UPDATE CASCADE;

-- Step 6: Remove old columns from rooms table (now redundant)
ALTER TABLE `rooms` 
DROP COLUMN `room_type`,
DROP COLUMN `price_per_night`,
DROP COLUMN `description`;

-- Step 7: Add index for better query performance
ALTER TABLE `rooms` 
ADD INDEX `idx_room_type_status` (`room_type_id`, `status`);

COMMIT;
