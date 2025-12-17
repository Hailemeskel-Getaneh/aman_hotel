import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Section from "../components/ui/Section";
import { bookingService, paymentService, eventService } from "../services/api";
import placeholderImg from '../assets/images/placeholder.png';

export default function MyBookings() {
    const navigate = useNavigate();
    const [bookings, setBookings] = useState([]);
    const [eventBookings, setEventBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Check if user is logged in
    const [user] = useState(() => JSON.parse(localStorage.getItem("user")));

    useEffect(() => {
        if (!user) {
            alert("Please sign in to view your bookings.");
            navigate("/signin");
            return;
        }

        fetchBookings();
    }, [navigate]); // Removed 'user' from dependencies to prevent infinite loop

    const fetchBookings = async () => {
        try {
            const data = await bookingService.getUserBookings(user.id);
            if (data.data) {
                setBookings(data.data);
            } else {
                setBookings([]);
            }

            // Fetch Event Bookings
            const eventData = await eventService.getMyBookings(user.id);
            if (eventData.data) {
                setEventBookings(eventData.data);
            } else {
                setEventBookings([]);
            }
        } catch (err) {
            console.error("Error fetching bookings:", err);
            setError("Failed to load your bookings.");
        } finally {
            setLoading(false);
        }
    };

    // Helper to group bookings
    const getGroupedBookings = () => {
        if (!bookings.length) return [];

        const grouped = bookings.reduce((acc, booking) => {
            const timeKey = booking.created_at ? booking.created_at.substring(0, 16) : 'unknown';
            const key = `${booking.check_in}|${booking.check_out}|${booking.room_type}|${booking.status}|${timeKey}`;

            if (!acc[key]) {
                acc[key] = {
                    ...booking,
                    count: 0,
                    room_numbers: [],
                    ids: [],
                    total_price: 0
                };
            }
            // Use quantity if available (for new bookings), else 1 (for old)
            const qty = booking.quantity ? parseInt(booking.quantity) : 1;
            acc[key].count += qty;

            if (booking.room_number) {
                acc[key].room_numbers.push(booking.room_number);
            }
            acc[key].ids.push(booking.id);
            acc[key].total_price += parseFloat(booking.final_price || booking.base_price);

            return acc;
        }, {});

        // Sort by created_at desc
        return Object.values(grouped).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    };

    const handlePayment = async (bookingIds) => {
        try {
            setLoading(true);
            // Pass array of IDs to initialize
            const response = await paymentService.initialize(bookingIds);

            if (response.checkout_url) {
                window.location.href = response.checkout_url;
            } else {
                alert(response.message || "Failed to initialize payment.");
                console.error("Payment init failed:", response);
            }
        } catch (err) {
            console.error("Payment error:", err);
            const msg = err.response?.data?.message || err.message || "Payment initialization failed.";
            alert(`Payment Error: ${msg}`);
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = async (bookingIds) => {
        if (!window.confirm(`Are you sure you want to cancel ${bookingIds.length > 1 ? 'these bookings' : 'this booking'}?`)) return;

        try {
            setLoading(true);
            await Promise.all(bookingIds.map(id => bookingService.cancel(id)));
            fetchBookings(); // Refresh list to show 'cancelled' status
        } catch (err) {
            console.error("Cancellation error:", err);
            alert("Failed to cancel booking(s).");
            setLoading(false);
        }
    };

    const handleDelete = async (bookingIds, bookingType = 'room') => {
        if (!window.confirm(`Are you sure you want to delete ${bookingIds.length > 1 ? 'these bookings' : 'this booking'}?`)) return;

        try {
            setLoading(true);
            // Delete based on booking type
            if (bookingType === 'event') {
                // For events, bookingIds is a single ID
                await eventService.deleteBooking(bookingIds);
            } else {
                // For rooms, delete all IDs
                await Promise.all(bookingIds.map(id => bookingService.delete(id)));
            }

            fetchBookings(); // Refresh

        } catch (err) {
            console.error("Deletion error:", err);
            alert("Failed to delete booking(s).");
            setLoading(false); // only stop if error, fetchBookings will stop otherwise
        }
    };

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'confirmed':
                return 'bg-green-100 text-green-800 border bg-green-200';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800 border bg-yellow-200';
            case 'cancelled':
                return 'bg-red-100 text-red-800 border bg-red-200';
            case 'completed':
                return 'bg-blue-100 text-blue-800 border bg-blue-200';
            default:
                return 'bg-gray-100 text-gray-800 border bg-gray-200';
        }
    };

    const groupedBookings = getGroupedBookings();

    // Merge and Sort
    const allBookings = [
        ...groupedBookings.map(b => ({ ...b, type: 'room', sortDate: b.created_at })),
        ...eventBookings.map(b => ({ ...b, type: 'event', sortDate: b.created_at }))
    ].sort((a, b) => new Date(b.sortDate) - new Date(a.sortDate));

    return (
        <main className="bg-background min-h-screen pt-20">
            <Section>
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl md:text-4xl font-serif font-bold text-primary-900">
                        My Bookings
                    </h1>
                </div>

                {loading && <p className="text-center text-gray-600">Loading...</p>}
                {error && <p className="text-center text-red-500">{error}</p>}

                {!loading && !error && allBookings.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-xl text-gray-600 mb-4">You haven't made any bookings yet.</p>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => navigate('/rooms')}
                            className="bg-primary-900 text-white px-8 py-3 rounded-full font-semibold shadow-lg hover:bg-primary-800 transition-colors"
                        >
                            Browse Rooms
                        </motion.button>
                    </div>
                )}

                {!loading && !error && allBookings.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {allBookings.map((item) => (
                            <motion.div
                                key={item.type === 'room' ? item.ids.join('-') : item.booking_id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
                            >
                                <div className="p-6">
                                    {/* Header */}
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h3 className="text-lg font-serif font-bold text-primary-900 mb-1">
                                                {item.type === 'room' ? item.room_type : item.event_title}
                                            </h3>
                                            <p className="text-xs text-gray-500 mb-1">
                                                Ref: {item.type === 'room' ? item.ids.join(', ') : item.booking_id}
                                            </p>
                                            <p className="text-sm font-semibold text-gray-700">
                                                {item.type === 'room' ? (
                                                    <>
                                                        {item.count} Room{item.count > 1 ? 's' : ''}
                                                        {item.room_numbers.length > 0 && (
                                                            <span className="font-normal text-gray-500 ml-1">
                                                                (#{item.room_numbers.join(', #')})
                                                            </span>
                                                        )}
                                                    </>
                                                ) : (
                                                    <>{item.quantity} x {item.ticket_type.toUpperCase()}</>
                                                )}
                                            </p>
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(item.status)}`}>
                                            {item.status || 'Pending'}
                                        </span>
                                    </div>

                                    {/* Body */}
                                    <div className="space-y-3 mb-4">
                                        {item.type === 'room' ? (
                                            <>
                                                <div className="flex items-center text-sm text-gray-700">
                                                    <span className="font-semibold w-24">Check-in:</span>
                                                    <span>{new Date(item.check_in).toLocaleDateString()}</span>
                                                </div>
                                                <div className="flex items-center text-sm text-gray-700">
                                                    <span className="font-semibold w-24">Check-out:</span>
                                                    <span>{new Date(item.check_out).toLocaleDateString()}</span>
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <div className="flex items-center text-sm text-gray-700">
                                                    <span className="font-semibold w-24">Date:</span>
                                                    <span>{new Date(item.event_date).toLocaleDateString()}</span>
                                                </div>
                                                <div className="flex items-center text-sm text-gray-700">
                                                    <span className="font-semibold w-24">Location:</span>
                                                    <span className="truncate">{item.location}</span>
                                                </div>
                                            </>
                                        )}
                                        <div className="flex items-center text-sm text-gray-700">
                                            <span className="font-semibold w-24">Total Price:</span>
                                            <span className="text-primary-900 font-bold">
                                                ${parseFloat(item.total_price).toFixed(2)}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Footer / Actions */}
                                    <div className="pt-4 border-t border-gray-100 flex flex-wrap gap-2 justify-between items-center">
                                        <p className="text-xs text-gray-500">
                                            {new Date(item.created_at).toLocaleDateString()}
                                        </p>
                                        <div className="flex gap-2">
                                            {item.type === 'room' ? (
                                                <>
                                                    {['confirmed', 'completed'].includes(item.status?.toLowerCase()) && (
                                                        <motion.button
                                                            whileHover={{ scale: 1.05 }}
                                                            whileTap={{ scale: 0.95 }}
                                                            onClick={() => navigate(`/receipt/${item.ids[0]}`)}
                                                            className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-semibold shadow hover:bg-gray-200 transition-colors"
                                                        >
                                                            View Receipt
                                                        </motion.button>
                                                    )}
                                                    {item.status?.toLowerCase() === 'cancelled' && (
                                                        <motion.button
                                                            whileHover={{ scale: 1.05 }}
                                                            whileTap={{ scale: 0.95 }}
                                                            onClick={() => handleDelete(item.ids)}
                                                            className="bg-red-50 text-red-600 border border-red-200 px-4 py-2 rounded-lg text-sm font-semibold shadow-sm hover:bg-red-100 transition-colors"
                                                        >
                                                            Delete
                                                        </motion.button>
                                                    )}
                                                    {item.status?.toLowerCase() === 'pending' && (
                                                        <>
                                                            <motion.button
                                                                whileHover={{ scale: 1.05 }}
                                                                whileTap={{ scale: 0.95 }}
                                                                onClick={() => handleDelete(item.ids, 'room')}
                                                                className="bg-red-50 text-red-600 border border-red-200 px-4 py-2 rounded-lg text-sm font-semibold shadow-sm hover:bg-red-100 transition-colors"
                                                            >
                                                                Delete
                                                            </motion.button>
                                                            <motion.button
                                                                whileHover={{ scale: 1.05 }}
                                                                whileTap={{ scale: 0.95 }}
                                                                onClick={() => handlePayment(item.ids)}
                                                                className="bg-primary-900 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow hover:bg-primary-800 transition-colors"
                                                            >
                                                                Pay Now
                                                            </motion.button>
                                                        </>
                                                    )}
                                                </>
                                            ) : ( /* Event Actions */
                                                <>
                                                    {item.status?.toLowerCase() === 'pending' && (
                                                        <>
                                                            <motion.button
                                                                whileHover={{ scale: 1.05 }}
                                                                whileTap={{ scale: 0.95 }}
                                                                onClick={() => handleDelete(item.booking_id, 'event')}
                                                                className="bg-red-50 text-red-600 border border-red-200 px-4 py-2 rounded-lg text-sm font-semibold shadow-sm hover:bg-red-100 transition-colors"
                                                            >
                                                                Delete
                                                            </motion.button>
                                                            <motion.button
                                                                whileHover={{ scale: 1.05 }}
                                                                whileTap={{ scale: 0.95 }}
                                                                onClick={async () => {
                                                                    // Event Pay Logic
                                                                    const payInit = await paymentService.initializeEvent(item.booking_id);
                                                                    if (payInit && payInit.checkout_url) window.location.href = payInit.checkout_url;
                                                                }}
                                                                className="bg-primary-900 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow hover:bg-primary-800 transition-colors"
                                                            >
                                                                Pay Now
                                                            </motion.button>
                                                        </>
                                                    )}

                                                    {item.status?.toLowerCase() === 'cancelled' && (
                                                        <motion.button
                                                            whileHover={{ scale: 1.05 }}
                                                            whileTap={{ scale: 0.95 }}
                                                            onClick={() => handleDelete(item.booking_id, 'event')}
                                                            className="bg-red-50 text-red-600 border border-red-200 px-4 py-2 rounded-lg text-sm font-semibold shadow-sm hover:bg-red-100 transition-colors"
                                                        >
                                                            Delete
                                                        </motion.button>
                                                    )}

                                                    {['confirmed', 'completed'].includes(item.status?.toLowerCase()) && (
                                                        <motion.button
                                                            whileHover={{ scale: 1.05 }}
                                                            whileTap={{ scale: 0.95 }}
                                                            className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-semibold shadow hover:bg-gray-200 transition-colors"
                                                            onClick={() => navigate(`/event-receipt/${item.booking_id}`)}
                                                        >
                                                            View Ticket
                                                        </motion.button>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </Section>
        </main>
    );
}
