import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Section from "../components/ui/Section";
import { bookingService, paymentService } from "../services/api";
import placeholderImg from '../assets/images/placeholder.png';

export default function MyBookings() {
    const navigate = useNavigate();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Check if user is logged in
    const user = JSON.parse(localStorage.getItem("user"));

    useEffect(() => {
        if (!user) {
            alert("Please sign in to view your bookings.");
            navigate("/signin");
            return;
        }

        const fetchBookings = async () => {
            try {
                const data = await bookingService.getUserBookings(user.id);
                if (data.data) {
                    setBookings(data.data);
                } else {
                    setBookings([]);
                }
            } catch (err) {
                console.error("Error fetching bookings:", err);
                setError("Failed to load your bookings.");
            } finally {
                setLoading(false);
            }
        };

        fetchBookings();
    }, [user, navigate]);

    const handlePayment = async (bookingId) => {
        try {
            // Optimistic UI or specific loading state could be better, but using global loading for safety
            setLoading(true);
            const response = await paymentService.initialize(bookingId);
            if (response.checkout_url) {
                window.location.href = response.checkout_url;
            } else {
                alert(response.message || "Failed to initialize payment. Please try again.");
                console.error("Payment init failed response:", response);
            }
        } catch (err) {
            console.error("Payment initialization error:", err);
            const errorMessage = err.response?.data?.message || err.message || "Payment initialization failed.";
            alert(`Payment Error: ${errorMessage}`);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'confirmed':
                return 'bg-green-100 text-green-800';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'cancelled':
                return 'bg-red-100 text-red-800';
            case 'completed':
                return 'bg-blue-100 text-blue-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <main className="bg-background min-h-screen pt-20">
            <div className="bg-primary-900 py-20 text-center text-white mb-10">
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-4xl md:text-5xl font-serif font-bold mb-4 text-white"
                >
                    My Bookings
                </motion.h1>
                <p className="text-gray-300 max-w-xl mx-auto">
                    View and manage your hotel reservations
                </p>
            </div>

            <Section>
                {loading && <p className="text-center">Loading your bookings...</p>}
                {error && <p className="text-center text-red-500">{error}</p>}

                {!loading && !error && bookings.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-gray-600 text-lg mb-4">You don't have any bookings yet.</p>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => navigate("/rooms")}
                            className="bg-primary-900 text-white px-6 py-3 rounded-lg hover:bg-primary-800 transition-colors"
                        >
                            Browse Rooms
                        </motion.button>
                    </div>
                )}

                {!loading && !error && bookings.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {bookings.map((booking) => (
                            <motion.div
                                key={booking.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
                            >
                                <div className="p-6">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h3 className="text-xl font-serif font-bold text-primary-900 mb-1">
                                                Booking #{booking.id}
                                            </h3>
                                            <p className="text-sm text-gray-600">
                                                Room ID: {booking.room_id}
                                            </p>
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(booking.status)}`}>
                                            {booking.status || 'Pending'}
                                        </span>
                                    </div>

                                    <div className="space-y-3 mb-4">
                                        <div className="flex items-center text-sm text-gray-700">
                                            <span className="font-semibold w-24">Check-in:</span>
                                            <span>{new Date(booking.check_in).toLocaleDateString()}</span>
                                        </div>
                                        <div className="flex items-center text-sm text-gray-700">
                                            <span className="font-semibold w-24">Check-out:</span>
                                            <span>{new Date(booking.check_out).toLocaleDateString()}</span>
                                        </div>
                                        <div className="flex items-center text-sm text-gray-700">
                                            <span className="font-semibold w-24">Nights:</span>
                                            <span>{booking.nights || 'N/A'}</span>
                                        </div>
                                        <div className="flex items-center text-sm text-gray-700">
                                            <span className="font-semibold w-24">Total Price:</span>
                                            <span className="text-primary-900 font-bold">
                                                ${booking.final_price || booking.base_price}
                                            </span>
                                        </div>
                                    </div>


                                    <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
                                        <p className="text-xs text-gray-500">
                                            Booked on: {new Date(booking.created_at).toLocaleDateString()}
                                        </p>
                                        {booking.status === 'pending' && (
                                            <motion.button
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => handlePayment(booking.id)}
                                                className="bg-primary-900 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow hover:bg-primary-800 transition-colors"
                                            >
                                                Pay Now
                                            </motion.button>
                                        )}
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
