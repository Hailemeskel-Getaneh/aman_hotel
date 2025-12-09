# Room Type Management System - Quick Start Guide

## Database Migration

You need to run the migration to update your database schema. Choose one option:

### Option 1: Migration Script (If you have existing data)
This will preserve your existing rooms and convert them to the new structure.

```bash
# From the project root
mysql -u root -p hotel_management < Backend/migrations/add_room_types.sql
```

### Option 2: Fresh Install (Clean database)
This will create a fresh database with the new schema and sample data.

```bash
# Drop and recreate the database
mysql -u root -p -e "DROP DATABASE IF EXISTS hotel_management;"
mysql -u root -p < Backend/database_updated.sql
```

## Testing the System

### 1. Admin Panel - Create Room Types

1. Navigate to `http://localhost:5173/admin` (login as admin)
2. Click "Room Types" in the sidebar
3. Click "+ Add New Room Type"
4. Create some room types:
   - **Single**: $100/night, Max 1 guest
   - **Double**: $150/night, Max 2 guests
   - **Suite**: $300/night, Max 4 guests
   - **Deluxe**: $200/night, Max 3 guests

### 2. Admin Panel - Create Individual Rooms

1. Click "Manage Rooms" in the sidebar
2. Click "+ Add New Room"
3. Create multiple rooms for each type:
   - Rooms 101-105 (Single type)
   - Rooms 201-205 (Double type)
   - Rooms 301-303 (Suite type)
   - Rooms 401-404 (Deluxe type)

### 3. User Side - View Room Types

1. Navigate to `http://localhost:5173/rooms`
2. You should see **4 cards** (one per room type)
3. Each card shows:
   - Room type name
   - Price per night
   - Availability count (e.g., "5 Available")
   - "Book Now" button

### 4. Test Availability Logic

1. In admin panel, change status of all "Single" rooms to "booked"
2. Refresh the user Rooms page
3. The Single room type card should now show "Fully Booked" and the button should be disabled

## API Endpoints

### Room Types
- `GET /api/room-types/read.php` - Get all room types
- `GET /api/room-types/availability.php` - Get types with availability
- `POST /api/room-types/create.php` - Create room type
- `PUT /api/room-types/update.php` - Update room type
- `DELETE /api/room-types/delete.php` - Delete room type

### Rooms
- `GET /api/rooms/read.php` - Get all rooms (with type info)
- `POST /api/rooms/create.php` - Create room (requires room_type_id)
- `PUT /api/rooms/update.php` - Update room
- `DELETE /api/rooms/delete.php` - Delete room

## Troubleshooting

### Frontend not showing room types
- Check browser console for errors
- Verify backend is running (XAMPP Apache + MySQL)
- Test API endpoint: `http://localhost/Aman-Hotel/Backend/api/room-types/availability.php`

### Migration errors
- Backup your database first
- Check MySQL error log
- Ensure no foreign key conflicts

### Admin panel not loading
- Clear browser cache
- Check that user has 'admin' role in database
- Verify you're logged in

## What's Next?

The booking flow needs to be updated to work with room types. Currently, users can see room types but the booking system still expects individual room IDs. This will be implemented in a future update.
