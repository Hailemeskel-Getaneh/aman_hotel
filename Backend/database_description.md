Title :  Hotel Management System 

         Group members

No.  Student name                       Id
1.     Amanuel Gezahegn          1500976
2.     Amanuel G/Egziabher      1501758
3.     kidist Kinfe                          1501304
4.     Fentaw Getassew              1501201
5.     Hailemeskel Getaneh        1501246
6.    Yismu Mamuye                    1501569
7.    Tsedeniya Worku                 1600032







Our Project Overview

Our Hotel Website is a modern web application designed to make hotel management easier and more convenient for both guests and administrators. The platform allows users to explore available rooms, make bookings, plan events, and communicate directly with hotel staff , all from one easy-to-use interface.

From the user’s side, the website offers a simple and enjoyable experience. Guests can view room types, check prices, and reserve their stay online without the need to call or visit the hotel. They can also organize events, such as meetings or celebrations, and get quick responses through the contact section.

On the management side, hotel staff and admins can efficiently handle daily operations , from tracking bookings and updating room statuses to reviewing customer messages and event requests. This helps the hotel team maintain smooth communication and deliver better service.

Overall, our Hotel Website aims to digitalize the hotel experience, making it faster, smarter, and more connected. It’s built to improve efficiency, reduce manual work, and create a seamless bridge between the hotel and its customers.





Database Design and description
1.	USERS
•	Stores all system users — customers, staff, and admins.
Field	Data Type	Description
user_id	INT (PK)	Unique identifier for each user
name	VARCHAR(100)	User’s full name
email	VARCHAR(150)	User’s login email
password_hash	VARCHAR(255)	Encrypted password
phone	VARCHAR(20)	Contact phone number
role	ENUM('admin','staff','customer')	Defines user role
created_at	DATETIME	Account creation timestamp

Relationships
•	 One user → many bookings
•	One user → many events (as organizer)
•	 One user → many contact messages
•	
 2. ROOMS
Represents every hotel room and its availability.
Field	Data Type	Description
room_id	INT (PK)	Unique ID for each room
room_number	VARCHAR(10)	Room label, e.g. "A101"
Room_type	VARCHAR(50)	Room type (Single, Double, Suite, etc.)
price_per_night	DECIMAL(10,2)	Room cost per night
status	ENUM('available','booked','maintenance')	Room availability
description	TEXT	Details and features of the room
 Relationships
•	One room → many bookings
3. BOOKINGS
Field	Data Type	Description
booking_id	INT (PK)	Unique booking ID
user_id	INT (FK)	Refers to user id(users table)
room_id	INT (FK)	Refers to room_id(rooms table)
check_in	DATE	Check-in date
check_out	DATE	Check-out date
nights	INT	Duration of stay
base_price	DECIMAL(10,2)	Total before discount
discount_rate	DECIMAL(5,2)	Discount percentage
final_price	DECIMAL(10,2)	Total after discount
status	ENUM('pending','confirmed','cancelled')	Booking state
created_at	DATETIME	Booking creation date
 Relationships
•	Many bookings belong to one user
•	Many bookings belong to one room
4. EVENTS
 Stores special events or conferences organized in the hotel.
Field	Data Type	Description
event_id	INT (PK)	Unique ID for each event
title	VARCHAR(100)	Name of the event
description	TEXT	Event details
location	VARCHAR(100)	Venue inside the hotel
start_time	DATETIME	Event start time
end_time	DATETIME	Event end time
organizer_id	INT (FK)	Refers to users.user_id (organizer)
 

Relationships
•	Each event organized by one user
•	One user can organize multiple events
5. CONTACT_MESSAGES
Handles messages sent by users via contact forms or support requests.
Field	Data Type	Description
message_id	INT (PK)	Unique ID for each message
user_id	INT (FK)	Refers to users.user_id
name	VARCHAR(100)	Sender name
email	VARCHAR(150)	Sender email
subject	VARCHAR(200)	Message subject
message	TEXT	Full message text
sent_at	DATETIME	When message was sent
 Relationships
•	Each message is sent by one user
•	 One user can send many messages
RELATIONSHIP SUMMARY 
A User can:
o	make many Bookings 
o	organize many Events 
o	send many Contact Messages 
•	A Room can be booked many times (by different users).
•	A Booking always connects one user and one room.
Quick Story Visualization
Imagine you're using the hotel app:
1.	You sign up → added to Users.
2.	You book Room A101 → record added to Bookings linking You ↔Room A101.
3.	You organize a wedding → record created in Events, organized by you.
4.	You contact support → stored in ContactMessages with your ID.
Class diagram
 

