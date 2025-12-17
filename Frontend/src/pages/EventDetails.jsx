import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Calendar, MapPin, Users, ArrowLeft, Clock } from "lucide-react";
import Section from "../components/ui/Section";
import Button from "../components/ui/Button";
import { eventService, paymentService } from "../services/api";
import placeholderImg from '../assets/images/placeholder.png';

const defaultImages = [
    "https://images.unsplash.com/photo-1529634806980-5e0ec3b22046?auto=format&fit=crop&w=900&q=60",
    "https://images.unsplash.com/photo-1532619675605-1ede6d6f2cfc?auto=format&fit=crop&w=900&q=60",
    "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=900&q=60"
];

export default function EventDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [bookingType, setBookingType] = useState('regular');
    const [quantity, setQuantity] = useState(1);

    const user = JSON.parse(localStorage.getItem("user"));

    useEffect(() => {
        const fetchEventDetails = async () => {
            try {
                const data = await eventService.getAll();
                if (data.data) {
                    const foundEvent = data.data.find(e => e.event_id == id);
                    if (foundEvent) {
                        const eventIndex = data.data.findIndex(e => e.event_id == id);
                        setEvent({
                            id: foundEvent.event_id,
                            title: foundEvent.title,
                            description: foundEvent.description,
                            location: foundEvent.location,
                            start_time: foundEvent.start_time,
                            end_time: foundEvent.end_time,
                            capacity: foundEvent.capacity, // Legacy support
                            vip_capacity: foundEvent.vip_capacity,
                            regular_capacity: foundEvent.regular_capacity,
                            vip_available: foundEvent.vip_available,
                            regular_available: foundEvent.regular_available,
                            vip_price: foundEvent.vip_price,
                            regular_price: foundEvent.regular_price,
                            image: defaultImages[eventIndex % defaultImages.length]
                        });
                    } else {
                        setError("Event not found");
                    }
                }
            } catch (err) {
                console.error("Error fetching event details:", err);
                setError("Failed to load event details.");
            } finally {
                setLoading(false);
            }
        };

        fetchEventDetails();
    }, [id]);

    const handleBookNow = async () => {
        if (!user) {
            navigate("/signin");
            return;
        }

        const price = bookingType === 'vip' ? event.vip_price : event.regular_price;
        const total = price * quantity;

        // Direct booking flow
        try {
            // Call booking API
            const result = await eventService.book({
                event_id: event.id,
                user_id: user.id,
                ticket_type: bookingType,
                quantity: quantity,
                total_price: total
            });
            if (result.booking_id) {
                try {
                    const payInit = await paymentService.initializeEvent(result.booking_id);
                    if (payInit && payInit.checkout_url) {
                        window.location.href = payInit.checkout_url;
                    } else {
                        alert("Payment initialization failed: " + (payInit.message || "Unknown error"));
                    }
                } catch (payErr) {
                    console.error("Payment Error", payErr);
                    alert("Failed to start payment process. Please try again.");
                }
            } else {
                alert("Booking failed to initialize.");
            }
        } catch (e) {
            console.error(e);
            alert("Booking failed");
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <p className="text-xl text-gray-600">Loading event details...</p>
            </div>
        );
    }

    if (error || !event) {
        return (
            <div className="flex flex-col items-center justify-center h-screen">
                <p className="text-xl text-red-500 mb-4">{error || "Event not found"}</p>
                <Button onClick={() => navigate("/events")}>Back to Events</Button>
            </div>
        );
    }

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const formatTime = (dateString) => {
        return new Date(dateString).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <main className="bg-background min-h-screen pt-20">
            <Section>
                <motion.button
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    onClick={() => navigate("/events")}
                    className="flex items-center gap-2 text-primary-900 hover:text-primary-800 mb-6 transition-colors"
                >
                    <ArrowLeft size={20} />
                    <span className="font-medium">Back to Events</span>
                </motion.button>

                <div className="grid md:grid-cols-2 gap-8">
                    {/* Image Section */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="relative rounded-2xl overflow-hidden shadow-2xl h-[500px]"
                    >
                        <img
                            src={event.image}
                            alt={event.title}
                            className="w-full h-full object-cover"
                            onError={(e) => { e.target.src = placeholderImg; }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    </motion.div>

                    {/* Details Section */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex flex-col"
                    >
                        <h1 className="text-4xl font-serif font-bold text-primary-900 mb-4">
                            {event.title}
                        </h1>

                        <div className="space-y-4 mb-6">
                            <div className="flex items-start gap-3 text-gray-700">
                                <Calendar className="text-primary-900 mt-1 flex-shrink-0" size={20} />
                                <div>
                                    <p className="font-semibold">Date</p>
                                    <p className="text-sm">{formatDate(event.start_time)}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3 text-gray-700">
                                <Clock className="text-primary-900 mt-1 flex-shrink-0" size={20} />
                                <div>
                                    <p className="font-semibold">Time</p>
                                    <p className="text-sm">
                                        {formatTime(event.start_time)} - {formatTime(event.end_time)}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3 text-gray-700">
                                <MapPin className="text-primary-900 mt-1 flex-shrink-0" size={20} />
                                <div>
                                    <p className="font-semibold">Location</p>
                                    <p className="text-sm">{event.location}</p>
                                </div>
                            </div>
                        </div>

                        <div className="mb-6">
                            <h2 className="text-2xl font-serif font-bold text-primary-900 mb-3">
                                About This Event
                            </h2>
                            <p className="text-gray-700 leading-relaxed">
                                {event.description}
                            </p>
                        </div>


                        {/* Booking Selection Section */}
                        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm mt-6">
                            <h3 className="font-serif font-bold text-xl text-primary-900 mb-4">Select Tickets</h3>

                            <div className="space-y-4 mb-6">
                                {/* Ticket Type Selection */}
                                <div className="grid grid-cols-2 gap-4">
                                    {(event.regular_capacity > 0 || event.regular_price > 0) && (
                                        <div
                                            onClick={() => setBookingType('regular')}
                                            className={`cursor-pointer p-4 rounded-lg border-2 transition-all ${bookingType === 'regular'
                                                ? 'border-primary-900 bg-primary-50'
                                                : 'border-gray-200 hover:border-gray-300'
                                                }`}
                                        >
                                            <div className="font-semibold text-gray-900">Regular</div>
                                            <div className="text-primary-900 font-bold">${event.regular_price}</div>
                                        </div>
                                    )}

                                    {(event.vip_capacity > 0 || event.vip_price > 0) && (
                                        <div
                                            onClick={() => setBookingType('vip')}
                                            className={`cursor-pointer p-4 rounded-lg border-2 transition-all ${bookingType === 'vip'
                                                ? 'border-amber-500 bg-amber-50'
                                                : 'border-gray-200 hover:border-gray-300'
                                                }`}
                                        >
                                            <div className="font-semibold text-gray-900">VIP</div>
                                            <div className="text-amber-600 font-bold">${event.vip_price}</div>
                                        </div>
                                    )}
                                </div>

                                {/* Quantity Selection */}
                                <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
                                    <span className="font-medium text-gray-700">Quantity</span>
                                    <div className="flex items-center gap-4">
                                        <button
                                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                            className="w-8 h-8 rounded-full bg-white border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                                        >
                                            -
                                        </button>
                                        <span className="font-bold text-lg w-8 text-center">{quantity}</span>
                                        <button
                                            onClick={() => setQuantity(quantity + 1)}
                                            className="w-8 h-8 rounded-full bg-white border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>

                                {/* Total Price */}
                                <div className="flex justify-between items-center py-4 border-t border-gray-100">
                                    <span className="font-serif font-bold text-lg text-gray-900">Total</span>
                                    <span className="font-serif font-bold text-2xl text-primary-900">
                                        ${(bookingType === 'vip' ? event.vip_price : event.regular_price) * quantity}
                                    </span>
                                </div>
                            </div>

                            <Button
                                variant="primary"
                                className="w-full py-4 text-lg"
                                onClick={handleBookNow}
                            >
                                Proceed to Payment
                            </Button>
                        </div>
                    </motion.div>
                </div>
            </Section>
        </main>
    );
}
