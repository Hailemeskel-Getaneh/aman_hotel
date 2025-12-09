import React, { useState, useEffect } from "react";
import "../styles/Booking.css";
import { useNavigate, useSearchParams } from "react-router-dom";
import { bookingService } from "../services/api";

export default function BookingPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const roomIdFromUrl = searchParams.get("roomId");

    // Check if user is logged in
    const user = JSON.parse(localStorage.getItem("user"));

    useEffect(() => {
        if (!user) {
            alert("Please sign in to book a room.");
            navigate("/signin");
        }
    }, [user, navigate]);

    const [form, setForm] = useState({
        checkin: "",
        checkout: "",
        guests: 1,
        roomType: roomIdFromUrl || "", // We might use room ID here if available
    });

    const [isDatesValid, setIsDatesValid] = useState(false);
    const [error, setError] = useState("");

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        setIsDatesValid(false); // reset if user changes inputs
    };

    const checkAvailability = (e) => {
        e.preventDefault();
        setError("");

        // Simple client-side date validation
        if (!form.checkin || !form.checkout) {
            setError("Please select dates.");
            return;
        }

        const d1 = new Date(form.checkin);
        const d2 = new Date(form.checkout);

        if (d1 >= d2) {
            setError("Check-out date must be after check-in date.");
            return;
        }

        // In a real app, we'd check against backend availability here.
        // For now, we assume available if dates are valid.
        setIsDatesValid(true);
    };

    const handleBooking = async () => {
        if (!isDatesValid) return;

        // We need a valid room_id. 
        // If the user came from the Rooms page, we have roomIdFromUrl.
        // If not, we might need to map 'roomType' to an ID or error out. 
        // For this simple implementation, let's assume we use the roomId passed or default to 1 if testing.

        const roomIdToUse = roomIdFromUrl || form.roomType; // Use what we have

        // Basic validation that we have a room ID (if roomType select is used as ID selector in this simple version)
        if (!roomIdToUse) {
            setError("Please select a room.");
            return;
        }

        try {
            const bookingData = {
                user_id: user.id,
                room_id: roomIdToUse,
                check_in: form.checkin,
                check_out: form.checkout
            };

            const data = await bookingService.create(bookingData);

            if (data.message === "Booking Created") {
                alert("Booking Successful!");
                navigate("/"); // Redirect to home or user profile
            } else {
                setError(data.message || "Booking failed.");
            }
        } catch (err) {
            console.error(err);
            setError("Server error during booking.");
        }
    };

    return (
        <div className="booking-container">
            <h2>Book Your Room</h2>
            {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}

            <form className="booking-form" onSubmit={checkAvailability}>
                <div className="form-group">
                    <label>Check-In Date</label>
                    <input
                        type="date"
                        name="checkin"
                        required
                        value={form.checkin}
                        onChange={handleChange}
                    />
                </div>

                <div className="form-group">
                    <label>Check-Out Date</label>
                    <input
                        type="date"
                        name="checkout"
                        required
                        value={form.checkout}
                        onChange={handleChange}
                    />
                </div>

                <div className="form-group">
                    <label>Number of Guests</label>
                    <input
                        type="number"
                        name="guests"
                        min="1"
                        max="5"
                        required
                        value={form.guests}
                        onChange={handleChange}
                    />
                </div>

                <div className="form-group">
                    <label>Room ID / Type</label>
                    {/* If we have a roomId from URL, maybe show it as read-only or selected. 
                        Otherwise show a select box. For simplicity, reusing the input/select logic 
                        but treating value as ID if possible. 
                        Ideally we'd fetch room list to populate this select with IDs.
                    */}
                    <input
                        type="text"
                        name="roomType"
                        value={form.roomType}
                        onChange={handleChange}
                        placeholder="Room ID (e.g. 1)"
                        readOnly={!!roomIdFromUrl} // Lock if came from rooms page
                    />
                </div>

                <button type="submit" className="book-btn">
                    Check Details
                </button>
            </form>

            {/* Show Proceed Button Only if Valid */}
            {isDatesValid && (
                <button className="book-btn proceed-btn" onClick={handleBooking}>
                    Confirm Booking
                </button>
            )}
        </div>
    );
}

