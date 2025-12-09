import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import RoomCard from "../components/RoomCard";
import Section from "../components/ui/Section";
import { roomTypeService } from "../services/api";

// Import images
import deluxeImg from '../assets/images/deluxe.jpg';
import singleImg from '../assets/images/single.jpg';
import familyImg from '../assets/images/family.jpg';
import kingImg from '../assets/images/kingsize.jpg';
import doubleImg from '../assets/images/double.jpg';
import vipImg from '../assets/images/vip.jpg';
import placeholderImg from '../assets/images/placeholder.png';

const getImageForRoomType = (type) => {
    if (!type) return singleImg;
    const lowerType = type.toLowerCase();
    if (lowerType.includes("deluxe")) return deluxeImg;
    if (lowerType.includes("single")) return singleImg;
    if (lowerType.includes("family")) return familyImg;
    if (lowerType.includes("king")) return kingImg;
    if (lowerType.includes("double")) return doubleImg;
    if (lowerType.includes("vip") || lowerType.includes("luxury") || lowerType.includes("suite")) return vipImg;
    return singleImg;
};

export default function Rooms() {
    const user = JSON.parse(localStorage.getItem("user"));
    const [roomTypes, setRoomTypes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchRoomTypes = async () => {
            try {
                const data = await roomTypeService.getAvailability();
                if (data.data) {
                    const mappedRoomTypes = data.data.map(rt => ({
                        id: rt.type_id,
                        name: rt.type_name,
                        price: rt.price_per_night,
                        image: rt.image_url || getImageForRoomType(rt.type_name),
                        short_description: rt.description,
                        status: rt.status, // 'available' or 'unavailable'
                        available_rooms: rt.available_rooms,
                        total_rooms: rt.total_rooms,
                        amenities: rt.amenities,
                        max_occupancy: rt.max_occupancy
                    }));
                    setRoomTypes(mappedRoomTypes);
                } else {
                    setRoomTypes([]);
                }
            } catch (err) {
                console.error("Error fetching room types:", err);
                setError("Failed to load room types.");
            } finally {
                setLoading(false);
            }
        };

        fetchRoomTypes();
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
                        {roomTypes.map((roomType) => (
                            <RoomCard key={roomType.id} room={roomType} user={user} />
                        ))}
                    </div>
                )}
            </Section>
        </main>
    );
}



