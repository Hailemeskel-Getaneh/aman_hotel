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
                        image: defaultImages[index % defaultImages.length] // Cycle through default images
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
        if (!user) {
            // Redirect to sign in if not logged in
            navigate("/signin");
        } else {
            // In a real app, you might navigate to an event booking page
            // For now, we'll just show an alert
            alert("Event booking functionality coming soon!");
        }
    };

    return (
        <main className="bg-background min-h-screen pt-20">
            <div className="bg-primary-900 py-20 text-center text-white mb-10">
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-4xl md:text-5xl font-serif font-bold mb-4"
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
                                <div className="relative h-64 overflow-hidden">
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
        </main>
    );
};

export default Events;

