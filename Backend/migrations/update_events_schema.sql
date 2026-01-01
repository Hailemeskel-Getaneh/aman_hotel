-- Add missing capacity and price columns to events table
ALTER TABLE `events`
ADD COLUMN IF NOT EXISTS `vip_capacity` int(11) NOT NULL DEFAULT 0 AFTER `organizer_id`,
ADD COLUMN IF NOT EXISTS `regular_capacity` int(11) NOT NULL DEFAULT 0 AFTER `vip_capacity`,
ADD COLUMN IF NOT EXISTS `vip_price` decimal(10,2) NOT NULL DEFAULT 0.00 AFTER `regular_capacity`,
ADD COLUMN IF NOT EXISTS `regular_price` decimal(10,2) NOT NULL DEFAULT 0.00 AFTER `vip_price`;

SELECT 'events table schema updated successfully!' as Status;
