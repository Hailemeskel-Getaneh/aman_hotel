import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Section from "../components/ui/Section";
import Button from "../components/ui/Button";
import { eventService } from "../services/api";
import placeholderImg from '../assets/images/placeholder.png';

const defaultImages = [
    "https://images.unsplash.com/photo-1529634806980-5e0ec3b22046?auto=format&fit=crop&w=900&q=60",
    "https://images.unsplash.com/photo-1532619675605-1ede6d6f2cfc?auto=format&fit=crop&w=900&q=60",
    "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=900&q=60"
];

const Events = () => {
    const navigate = useNavigate();
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Check if user is logged in
    const user = JSON.parse(localStorage.getItem("user"));

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const data = await eventService.getAll();
                if (data.data) {
                    const mappedEvents = data.data.map((e, index) => ({
                        id: e.event_id,
                        title: e.title,
                        date: new Date(e.start_time).toLocaleDateString(),
                        location: e.location,
                        description: e.description,
                        image: defaultImages[index % defaultImages.length],
                        regular_price: e.regular_price,
                        vip_price: e.vip_price,
                        regular_capacity: e.regular_capacity,
                        vip_capacity: e.vip_capacity,
                        regular_available: e.regular_available,
                        vip_available: e.vip_available
                    }));
                    setEvents(mappedEvents);
                } else {
                    setEvents([]);
                }
            } catch (err) {
                console.error("Error fetching events:", err);
                setError("Failed to load events.");
            } finally {
                setLoading(false);
            }
        };

        fetchEvents();
    }, []);

    const handleBookNow = (eventId) => {
        navigate(`/event/${eventId}`);
    };

    return (
        <main className="bg-background min-h-screen pt-20">
            <div className="bg-primary-900 py-20 text-center text-white mb-10">
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-4xl md:text-5xl font-serif font-bold mb-4 text-white"
                >
                    Upcoming Events
                </motion.h1>
                <p className="text-gray-300 max-w-xl mx-auto">
                    Join us for exclusive events and memorable experiences at Aman Hotel
                </p>
            </div>

            <Section>
                {loading && <p className="text-center">Loading events...</p>}
                {error && <p className="text-center text-red-500">{error}</p>}

                {!loading && !error && events.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-gray-600 text-lg">No upcoming events at the moment.</p>
                    </div>
                )}

                {!loading && !error && events.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {events.map((event) => (
                            <motion.article
                                key={event.id}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5 }}
                                className="group relative bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
                            >
                                <div
                                    className="relative h-64 overflow-hidden cursor-pointer"
                                    onClick={() => navigate(`/event/${event.id}`)}
                                >
                                    <img
                                        src={event.image}
                                        alt={event.title}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                        onError={(e) => { e.target.src = placeholderImg; }}
                                    />
                                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                                </div>

                                <div className="p-6">
                                    <h3 className="text-xl font-serif font-bold text-primary-900 mb-3">
                                        {event.title}
                                    </h3>

                                    <div className="space-y-2 mb-4">
                                        <p className="text-sm text-gray-600 flex items-center gap-2">
                                            <span className="text-lg">📅</span>
                                            <span>{event.date}</span>
                                        </p>
                                        <p className="text-sm text-gray-600 flex items-center gap-2">
                                            <span className="text-lg">📍</span>
                                            <span>{event.location}</span>
                                        </p>

                                        <div className="mt-3 flex flex-col gap-2">
                                            {(Number(event.regular_capacity) > 0 || Number(event.regular_price) > 0) && (
                                                <div className="flex justify-between items-center text-sm">
                                                    <span className="text-gray-600 font-medium">Regular</span>
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-semibold text-primary-900">
                                                            ${event.regular_price}
                                                        </span>
                                                        <span className="text-xs bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-full font-medium border border-blue-100">
                                                            {event.regular_available ?? event.regular_capacity} of {event.regular_capacity} available
                                                        </span>
                                                    </div>
                                                </div>
                                            )}

                                            {(Number(event.vip_capacity) > 0 || Number(event.vip_price) > 0) && (
                                                <div className="flex justify-between items-center text-sm">
                                                    <span className="text-gray-600 font-medium">VIP</span>
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-semibold text-amber-600">
                                                            ${event.vip_price}
                                                        </span>
                                                        <span className="text-xs bg-amber-50 text-amber-700 px-2.5 py-0.5 rounded-full font-medium border border-amber-100">
                                                            {event.vip_available ?? event.vip_capacity} of {event.vip_capacity} available
                                                        </span>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Legacy/Fallback Display: Show generic if no specific types are set */}
                                            {(!event.regular_capacity && !event.vip_capacity && !event.regular_price && !event.vip_price) && (
                                                <div className="flex justify-between items-center text-sm">
                                                    <span className="text-gray-600 font-medium">Entry</span>
                                                    <span className="font-semibold text-primary-900">Free</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                                        {event.description}
                                    </p>

                                    <Button
                                        variant="primary"
                                        className="w-full text-white bg-blue-900"
                                        onClick={() => handleBookNow(event.id)}
                                    >
                                        Book Now
                                    </Button>
                                </div>
                            </motion.article>
                        ))}
                    </div>
                )}
            </Section>
        </main >
    );
};

export default Events;

