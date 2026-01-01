import React, { useState, useEffect } from "react";
import "../styles/Booking.css";
import { useNavigate, useSearchParams } from "react-router-dom";
import { bookingService, roomService, roomTypeService, paymentService } from "../services/api";

export default function BookingPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const roomTypeIdFromUrl = searchParams.get("roomTypeId");
    const checkInIdx = searchParams.get("checkIn");
    const checkOutIdx = searchParams.get("checkOut");

    // Check if user is logged in
    const user = JSON.parse(localStorage.getItem("user"));

    useEffect(() => {
        if (!user) {
            alert("Please sign in to book a room.");
            navigate("/signin");
        }
    }, [user, navigate]);

    const [form, setForm] = useState({
        checkin: checkInIdx || "",
        checkout: checkOutIdx || "",
        guests: 1,
        roomCount: 1,
        selectedRoomId: "", // Optional now if roomCount > 1
    });

    const [availableRooms, setAvailableRooms] = useState([]);
    const [roomTypeName, setRoomTypeName] = useState("");
    const [loading, setLoading] = useState(false);
    // Removed isDatesValid two-step logic
    const [error, setError] = useState("");

    // Fetch available room COUNT when inputs change
    useEffect(() => {
        const fetchDetails = async () => {
            if (!roomTypeIdFromUrl) return;

            setLoading(true);
            setError("");

            try {
                // Fetch room type details
                const typeData = await roomTypeService.getSingle(roomTypeIdFromUrl);
                if (typeData.data) {
                    setRoomTypeName(typeData.data.type_name);
                }

                let roomsData;
                if (form.checkin && form.checkout) {
                    // Check availability for specific dates
                    roomsData = await roomService.checkAvailability(form.checkin, form.checkout, roomTypeIdFromUrl);
                    if (roomsData.data) {
                        roomsData.data = roomsData.data.filter(r => r.available_for_dates);
                    }
                } else {
                    // General availability
                    roomsData = await roomService.getRoomsByType(roomTypeIdFromUrl, 'available');
                }

                if (roomsData.data) {
                    setAvailableRooms(roomsData.data);
                } else {
                    setAvailableRooms([]);
                }

            } catch (err) {
                console.error("Error fetching available rooms:", err);
                setError("Failed to load availability.");
            } finally {
                setLoading(false);
            }
        };

        fetchDetails();
    }, [roomTypeIdFromUrl, form.checkin, form.checkout]);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleBooking = async (e) => {
        e.preventDefault();
        setError("");

        // Validation
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

        const requestedRooms = parseInt(form.roomCount);
        if (availableRooms.length < requestedRooms) {
            setError(`Only ${availableRooms.length} room${availableRooms.length !== 1 ? 's' : ''} available for these dates.`);
            return;
        }

        setLoading(true);

        try {
            // Use createMultiple endpoint
            // We pass room_type_id instead of room_id

            const bookingData = {
                user_id: user.id,
                room_type_id: roomTypeIdFromUrl,
                check_in: form.checkin,
                check_out: form.checkout,
                count: requestedRooms
            };

            const data = await bookingService.createMultiple(bookingData);

            if (data.message === "Bookings Created" && data.booking_ids && data.booking_ids.length > 0) {
                // Success
                // Handle Payment for FIRST booking or redirect to my bookings
                // For MVP, redirect to My Bookings with message

                // Or try to pay for the first one?
                if (requestedRooms === 1 && data.booking_ids.length === 1) {
                    try {
                        const paymentData = await paymentService.initialize(data.booking_ids[0]);
                        if (paymentData.checkout_url) {
                            window.location.href = paymentData.checkout_url;
                            return;
                        }
                    } catch (payErr) {
                        console.error("Payment init error", payErr);
                    }
                }

                alert(`Successfully booked ${requestedRooms} room(s)! Please proceed to payment in "My Bookings".`);
                navigate("/my-bookings");

            } else {
                setError(data.message || "Booking failed.");
            }
        } catch (err) {
            console.error(err);
            setError("Server error during booking.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="booking-container">
            <h2>Book Your Room</h2>

            {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}
            {loading && <p style={{ textAlign: 'center' }}>Processing...</p>}

            <form className="booking-form" onSubmit={handleBooking}>
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
                    <label>Number of Rooms</label>
                    <select
                        name="roomCount"
                        value={form.roomCount}
                        onChange={handleChange}
                        required
                        disabled={loading}
                    >
                        {Array.from({ length: Math.min(5, availableRooms.length || 1) }, (_, i) => i + 1).map(num => (
                            <option key={num} value={num}>{num} Room{num > 1 ? 's' : ''}</option>
                        ))}
                    </select>
                    {availableRooms.length > 0 && (
                        <small style={{ color: '#666', fontSize: '0.85rem' }}>
                            {availableRooms.length} room{availableRooms.length !== 1 ? 's' : ''} available total
                        </small>
                    )}
                </div>

                {/* Price Display */}
                {form.checkin && form.checkout && availableRooms.length > 0 && (
                    <div className="price-summary" style={{
                        background: '#f8f9fa',
                        padding: '15px',
                        borderRadius: '8px',
                        marginBottom: '20px',
                        border: '1px solid #e9ecef'
                    }}>
                        <h3 style={{ margin: '0 0 10px 0', fontSize: '1.1rem', color: '#1a1a1a' }}>Price Summary</h3>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px', fontSize: '0.9rem', color: '#666' }}>
                            <span>Room Type:</span>
                            <span style={{ fontWeight: '600', color: '#1a1a1a' }}>{roomTypeName || availableRooms[0]?.room_type || 'N/A'}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px', fontSize: '0.9rem', color: '#666' }}>
                            <span>Price per night:</span>
                            <span>${availableRooms[0]?.price_per_night}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px', fontSize: '0.9rem', color: '#666' }}>
                            <span>Nights:</span>
                            <span>{Math.max(0, Math.ceil((new Date(form.checkout) - new Date(form.checkin)) / (1000 * 60 * 60 * 24)))}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '0.9rem', color: '#666' }}>
                            <span>Rooms:</span>
                            <span>{form.roomCount}</span>
                        </div>
                        <div style={{ borderTop: '1px solid #ddd', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '1.2rem', color: '#000' }}>
                            <span>Total Price:</span>
                            <span>${(
                                (availableRooms[0]?.price_per_night || 0) *
                                Math.max(0, Math.ceil((new Date(form.checkout) - new Date(form.checkin)) / (1000 * 60 * 60 * 24))) *
                                form.roomCount
                            ).toFixed(2)}</span>
                        </div>
                    </div>
                )}

                <button type="submit" className="book-btn proceed-btn" disabled={loading}>
                    Confirm Booking
                </button>
            </form>
        </div>
    );
}
