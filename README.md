# Aman Hotel Management System

A modern, full-featured web application designed to streamline hotel management operations. This system facilitates seamless booking experiences for guests while providing robust tools for administrators and staff to manage rooms, events, and customer interactions efficiently.

## 🚀 Key Features

### For Guests
*   **Room Booking:** Browse available rooms, view details, and make reservations.
*   **Event Exploration:** Discover and register for events hosted at the hotel.
*   **Contact & Support:** Easily communicate with hotel staff for inquiries or support.

### For Administrators & Staff
*   **Dashboard:** Centralized control panel for managing hotel operations.
*   **Room Management:** Add, update, and manage room inventory and status (Available, Booked, Maintenance).
*   **Booking Management:** View and manage guest reservations (Confirm, Cancel).
*   **Event Management:** Organize and schedule hotel events.
*   **User Management:** Manage customer, staff, and admin accounts.
*   **Messages:** View and respond to customer inquiries.

## 🛠 Tech Stack

### Frontend
*   **React:** For building a dynamic and responsive user interface.
*   **Vite:** High-performance build tool and development server.
*   **Tailwind CSS:** Utility-first CSS framework for modern styling.
*   **Framer Motion:** For smooth animations and improved UX.
*   **React Router:** For seamless client-side navigation.
*   **Axios:** For handling API requests.
*   **React Icons & Lucide React:** For beautiful, scalable vector icons.

### Backend
*   **PHP:** Core server-side logic and API endpoints.
*   **MySQL:** Relational database for storing users, rooms, bookings, and events.

## ⚙️ Setup Instructions

### Prerequisites
*   **Node.js** (v18+ recommended)
*   **XAMPP** (or any LAMP stack environment)

### Backend Setup
1.  **Clone/Place Project:** Ensure the project folder `Aman-Hotel` is located inside your XAMPP `htdocs` directory (e.g., `C:\xampp\htdocs\Aman-Hotel`).
2.  **Start Services:** Open the XAMPP Control Panel and start **Apache** and **MySQL**.
3.  **Database Configuration:**
    *   Open phpMyAdmin (`http://localhost/phpmyadmin`).
    *   Create a new database named `hotel_management` (or check `database.sql` usage).
    *   Import the provided SQL file located at: `Backend/database.sql`.
    *   *Note: This will create the necessary tables (`users`, `rooms`, `bookings`, `events`, `contact_messages`) and insert initial seed data.*

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
4.  **Access the App:** Open your browser and go to `http://localhost:5173` (or the port shown in your terminal).

## 📂 Project Structure

```
Aman-Hotel/
├── Backend/                 # Server-side logic and Database
│   ├── api/                 # API endpoints (Auth, Rooms, Bookings, etc.)
│   ├── config/              # Configuration files (Database connection)
│   ├── database.sql         # Database schema and seed data
│   └── ...
├── Frontend/                # Client-side application
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/           # Application pages (Home, Login, Admin, etc.)
│   │   ├── context/         # React Context for state management
│   │   ├── services/        # API service functions
│   │   └── ...
│   ├── public/              # Static assets
│   └── ...
└── README.md                # Project documentation
```

## 👥 Contributors

*   **Amanuel Gezahegn**
*   **Amanuel G/Egziabher**
*   **Kidist Kinfe**
*   **Fentaw Getassew**
*   **Hailemeskel Getaneh**
*   **Yismu Mamuye**
*   **Tsedeniya Worku**
