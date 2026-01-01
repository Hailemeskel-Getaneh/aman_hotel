-- Add payment_ref column to bookings table if it doesn't exist
ALTER TABLE `bookings`
ADD COLUMN IF NOT EXISTS `payment_ref` VARCHAR(255) DEFAULT NULL AFTER `status`;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS `idx_bookings_payment_ref` ON `bookings` (`payment_ref`);

SELECT 'Payment_ref column added successfully!' as Status;
