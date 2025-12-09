import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import RoomCard from "../components/RoomCard";
import Section from "../components/ui/Section";
import { roomService } from "../services/api";

// Import images
import deluxeImg from '../assets/images/deluxe.jpg';
import singleImg from '../assets/images/single.jpg';
import familyImg from '../assets/images/family.jpg';
import kingImg from '../assets/images/kingsize.jpg';
import doubleImg from '../assets/images/double.jpg';
import vipImg from '../assets/images/vip.jpg';

const getImageForRoomType = (type) => {
    if (!type) return singleImg;
    const lowerType = type.toLowerCase();
    if (lowerType.includes("deluxe")) return deluxeImg;
    if (lowerType.includes("single")) return singleImg;
    if (lowerType.includes("family")) return familyImg;
    if (lowerType.includes("king")) return kingImg;
    if (lowerType.includes("double")) return doubleImg;
    if (lowerType.includes("vip") || lowerType.includes("luxury")) return vipImg;
    return singleImg;
};

export default function Rooms() {
    const user = JSON.parse(localStorage.getItem("user"));
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchRooms = async () => {
            try {
                const data = await roomService.getAll();
                if (data.data) {
                    const mappedRooms = data.data.map(r => ({
                        id: r.room_id,
                        name: r.room_type || r.room_number,
                        price: r.price_per_night,
                        image: getImageForRoomType(r.room_type),
                        short_description: r.description
                    }));
                    setRooms(mappedRooms);
                } else {
                    setRooms([]);
                }
            } catch (err) {
                console.error("Error fetching rooms:", err);
                setError("Failed to load rooms.");
            } finally {
                setLoading(false);
            }
        };

        fetchRooms();
    }, []);

    return (
        <main className="bg-background min-h-screen pt-20"> {/* pt-20 to account for fixed navbar */}
            <div className="bg-primary-900 py-20 text-center text-white mb-10">
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-4xl md:text-5xl font-serif font-bold mb-4"
                >
                    Our Accommodations
                </motion.h1>
                <p className="text-gray-300 max-w-xl mx-auto">
                    Choose from our wide range of premium rooms and suites designed for your comfort.
                </p>
            </div>

            <Section>
                {loading && <p className="text-center">Loading rooms...</p>}
                {error && <p className="text-center text-red-500">{error}</p>}

                {!loading && !error && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {rooms.map((room) => (
                            <RoomCard key={room.id} room={room} user={user} />
                        ))}
                    </div>
                )}
            </Section>
        </main>
    );
}



