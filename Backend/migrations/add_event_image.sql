-- Add image column to events table
ALTER TABLE `events`
ADD COLUMN `image` VARCHAR(255) DEFAULT NULL AFTER `description`;

SELECT 'events table schema updated with image column!' as Status;
