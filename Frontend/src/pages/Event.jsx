import React, { useState, useEffect } from "react";
import "../styles/Event.css";
import { eventService } from "../services/api";

const defaultImages = [
    "https://images.unsplash.com/photo-1529634806980-5e0ec3b22046?auto=format&fit=crop&w=900&q=60",
    "https://images.unsplash.com/photo-1532619675605-1ede6d6f2cfc?auto=format&fit=crop&w=900&q=60",
    "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=900&q=60"
];

const Events = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

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

    return (
        <section className="events-section">
            <h2 className="events-title">Upcoming Events</h2>

            {loading && <p className="text-center">Loading events...</p>}
            {error && <p className="text-center error-message">{error}</p>}

            {!loading && !error && (
                <div className="events-grid">
                    {events.map((event) => (
                        <div key={event.id} className="event-card">
                            <img src={event.image} alt={event.title} className="event-image" />

                            <div className="event-content">
                                <h3 className="event-name">{event.title}</h3>

                                <p className="event-info">
                                    📅 <span>{event.date}</span>
                                </p>
                                <p className="event-info">
                                    📍 <span>{event.location}</span>
                                </p>

                                <p className="event-description">{event.description}</p>

                                <button className="event-btn">Book Now</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </section>
    );
};

export default Events;

