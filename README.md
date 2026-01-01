# Aman Hotel Management System

A modern, full-featured web application designed to streamline hotel management operations. This system facilitates seamless booking experiences for guests while providing robust tools for administrators and staff to manage rooms, events, and customer interactions efficiently.

## 🚀 Key Features

### For Guests
*   **Room Booking:** Browse available room types, view details, and make reservations with real-time availability.
*   **Online Payments:** Secure payment integration via **Chapa**.
*   **Event Exploration:** Discover and register for events hosted at the hotel.
*   **Contact & Support:** Easily communicate with hotel staff for inquiries or support.
*   **User Dashboard:** View booking history and manage profile.

### For Administrators & Staff
*   **Dashboard:** Centralized control panel for managing hotel operations.
*   **Room Types Management:** Define room categories (Single, Double, Suite) with pricing and capacities.
*   **Room Inventory:** Manage individual rooms and their status (Available, Booked, Maintenance).
*   **Booking Management:** View and manage guest reservations (Confirm, Cancel, View Receipts).
*   **Event Management:** Organize and schedule hotel events.
*   **User Management:** Manage customer, staff, and admin accounts.
*   **Messages:** View and respond to customer inquiries.

## 🛠 Tech Stack

### Frontend
*   **React 19:** For building a dynamic and responsive user interface.
*   **Vite 7:** High-performance build tool and development server.
*   **Tailwind CSS 4:** Utility-first CSS framework for modern styling.
*   **Framer Motion 12:** For smooth animations and improved UX.
*   **React Router 7:** For seamless client-side navigation.
*   **Axios:** For handling API requests.
*   **Lucide React:** For beautiful, scalable vector icons.

### Backend
*   **PHP:** Core server-side logic and API endpoints.
*   **MySQL:** Relational database for storing users, rooms, bookings, and events.

## ⚙️ Setup Instructions

### Prerequisites
*   **Node.js** (v18+ recommended)
*   **XAMPP** (or any LAMP stack environment with Apache & MySQL)

### Backend Setup
1.  **Clone/Place Project:** Ensure the project folder `Aman-Hotel` is located inside your XAMPP `htdocs` directory (e.g., `C:\xampp\htdocs\Aman-Hotel`).
2.  **Start Services:** Open the XAMPP Control Panel and start **Apache** and **MySQL**.
3.  **Database Configuration:**
    *   Open phpMyAdmin (`http://localhost/phpmyadmin`).
    *   Create a new database named `hotel_management`.
    *   **Recommendation:** Import the updated schema file located at: `Backend/database_updated.sql`.
    *   *Alternatively:* If you are migrating an older version, see [MIGRATION_INSTRUCTIONS.md](./MIGRATION_INSTRUCTIONS.md).
    *   *Note: `database_updated.sql` contains the complete schema including users, rooms, room types, bookings, events, and contact messages.*

### Frontend Setup
1.  **Navigate to Frontend:**
    ```bash
    cd Frontend
    ```
2.  **Install Dependencies:**
    ```bash
    npm install
    ```
3.  **Run Development Server:**
    ```bash
    npm run dev
    ```
4.  **Access the App:** Open your browser and go to `http://localhost:5173`.

## 📂 Project Structure

```
Aman-Hotel/
├── Backend/                 # Server-side logic and Database
│   ├── api/                 # API endpoints (Auth, Rooms, Bookings, etc.)
│   ├── config/              # Configuration files (Database connection)
│   ├── migrations/          # Database migration scripts
│   ├── database_updated.sql # Complete database schema
│   └── ...
├── Frontend/                # Client-side application
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/           # Application pages
│   │   ├── context/         # React Context
│   │   ├── services/        # API service functions
│   │   └── ...
│   └── ...
├── README.md                # Project documentation
├── ROOM_TYPES_README.md     # Specific documentation for Room Types feature
└── MIGRATION_INSTRUCTIONS.md # Database migration guide
```

## 👥 Contributors

*   **Amanuel Gezahegn**
*   **Amanuel G/Egziabher**
*   **Kidist Kinfe**
*   **Fentaw Getassew**
*   **Hailemeskel Getaneh**
*   **Yismu Mamuye**
*   **Tsedeniya Worku**
