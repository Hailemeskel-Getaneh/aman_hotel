import React, { useState, useEffect } from "react";
import "../styles/Booking.css";
import { useNavigate, useSearchParams } from "react-router-dom";
import { bookingService, roomService, roomTypeService } from "../services/api";

export default function BookingPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const roomTypeIdFromUrl = searchParams.get("roomTypeId");

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
        selectedRoomId: "",
    });

    const [availableRooms, setAvailableRooms] = useState([]);
    const [roomTypeName, setRoomTypeName] = useState("");
    const [loading, setLoading] = useState(false);
    const [isDatesValid, setIsDatesValid] = useState(false);
    const [error, setError] = useState("");

    // Fetch available rooms when component mounts or roomTypeId changes
    useEffect(() => {
        const fetchAvailableRooms = async () => {
            if (!roomTypeIdFromUrl) return;

            setLoading(true);
            setError("");

            try {
                // Fetch room type details
                const typeData = await roomTypeService.getSingle(roomTypeIdFromUrl);
                if (typeData.data) {
                    setRoomTypeName(typeData.data.type_name);
                }

                // Fetch available rooms for this type
                const roomsData = await roomService.getRoomsByType(roomTypeIdFromUrl, 'available');

                if (roomsData.data && roomsData.data.length > 0) {
                    setAvailableRooms(roomsData.data);
                } else {
                    setAvailableRooms([]);
                    setError("No available rooms for this room type at the moment.");
                }
            } catch (err) {
                console.error("Error fetching available rooms:", err);
                setError("Failed to load available rooms.");
            } finally {
                setLoading(false);
            }
        };

        fetchAvailableRooms();
    }, [roomTypeIdFromUrl]);

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

        if (!form.selectedRoomId) {
            setError("Please select a room.");
            return;
        }

        // In a real app, we'd check against backend availability for the specific dates here.
        // For now, we assume available if dates are valid and room is selected.
        setIsDatesValid(true);
    };

    const handleBooking = async () => {
        if (!isDatesValid) return;

        if (!form.selectedRoomId) {
            setError("Please select a room.");
            return;
        }

        try {
            // Verify the room is still available
            const roomData = await roomService.getSingle(form.selectedRoomId);

            if (!roomData.data) {
                setError("Room not found.");
                return;
            }

            const roomStatus = roomData.data.status?.toLowerCase();

            if (roomStatus !== 'available') {
                setError(`This room is currently ${roomStatus}. Please select another room.`);
                return;
            }

            // Proceed with booking if room is available
            const bookingData = {
                user_id: user.id,
                room_id: form.selectedRoomId,
                check_in: form.checkin,
                check_out: form.checkout
            };

            const data = await bookingService.create(bookingData);

            if (data.message === "Booking Created") {
                alert("Booking Successful!");
                navigate("/my-bookings"); // Redirect to My Bookings page
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

            {roomTypeName && (
                <p style={{ textAlign: 'center', fontSize: '1.1rem', marginBottom: '1rem', color: '#333' }}>
                    Room Type: <strong>{roomTypeName}</strong>
                </p>
            )}

            {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}
            {loading && <p style={{ textAlign: 'center' }}>Loading available rooms...</p>}

            <form className="booking-form" onSubmit={checkAvailability}>
                <div className="form-group">
                    <label>Check-In Date</label>
                    <input
                        type="date"
                        name="checkin"
                        required
                        value={form.checkin}
                        onChange={handleChange}
                        min={new Date().toISOString().split('T')[0]}
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
                        min={form.checkin || new Date().toISOString().split('T')[0]}
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
                    <label>Select Room Number</label>
                    <select
                        name="selectedRoomId"
                        value={form.selectedRoomId}
                        onChange={handleChange}
                        required
                        disabled={loading || availableRooms.length === 0}
                    >
                        <option value="">-- Select a Room --</option>
                        {availableRooms.map((room) => (
                            <option key={room.room_id} value={room.room_id}>
                                Room {room.room_number} - ${room.price_per_night}/night
                            </option>
                        ))}
                    </select>
                    {availableRooms.length > 0 && (
                        <small style={{ color: '#666', fontSize: '0.85rem' }}>
                            {availableRooms.length} room{availableRooms.length !== 1 ? 's' : ''} available
                        </small>
                    )}
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
