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
    const [checkIn, setCheckIn] = useState('');
    const [checkOut, setCheckOut] = useState('');
    const [dateFilterActive, setDateFilterActive] = useState(false);

    useEffect(() => {
        fetchRoomTypes();
    }, []);

    const fetchRoomTypes = async (useFilters = false) => {
        setLoading(true);
        setError(null);
        try {
            let data;
            if (useFilters && checkIn && checkOut) {
                // Fetch with date filters using checkAvailability
                const roomsData = await roomTypeService.checkAvailability(checkIn, checkOut);

                // Group by room type and count availability
                const typeMap = {};
                if (roomsData.data) {
                    roomsData.data.forEach(room => {
                        const typeId = room.room_type_id;
                        if (!typeMap[typeId]) {
                            typeMap[typeId] = {
                                type_id: typeId,
                                type_name: room.room_type,
                                price_per_night: room.price_per_night,
                                description: room.description,
                                image_url: room.image_url,
                                amenities: room.amenities,
                                max_occupancy: room.max_occupancy,
                                available_rooms: 0,
                                total_rooms: 0
                            };
                        }
                        typeMap[typeId].total_rooms++;
                        if (room.available_for_dates) {
                            typeMap[typeId].available_rooms++;
                        }
                    });
                }

                data = { data: Object.values(typeMap) };
                setDateFilterActive(true);
            } else {
                // Fetch all room types with availability
                data = await roomTypeService.getAvailability();
                setDateFilterActive(false);
            }

            if (data.data) {
                const mappedRoomTypes = data.data.map(rt => ({
                    id: rt.type_id,
                    name: rt.type_name,
                    price: rt.price_per_night,
                    image: rt.image_url || getImageForRoomType(rt.type_name),
                    short_description: rt.description,
                    status: rt.available_rooms > 0 ? 'available' : 'unavailable',
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

    const handleSearchAvailability = () => {
        if (checkIn && checkOut) {
            if (new Date(checkOut) <= new Date(checkIn)) {
                alert('Check-out date must be after check-in date');
                return;
            }
            fetchRoomTypes(true);
        } else {
            alert('Please select both check-in and check-out dates');
        }
    };

    const handleClearDates = () => {
        setCheckIn('');
        setCheckOut('');
        fetchRoomTypes(false);
    };

    const dateFilterRef = React.useRef(null);
    const checkInInputRef = React.useRef(null);

    const handleDateRequired = () => {
        if (dateFilterRef.current) {
            dateFilterRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
            setTimeout(() => {
                if (checkInInputRef.current) {
                    checkInInputRef.current.focus();
                    checkInInputRef.current.click();
                }
            }, 500);
            alert('Please select your check-in and check-out dates first to see availability.');
        }
    };


    return (
        <main className="bg-background min-h-screen pt-20"> {/* pt-20 to account for fixed navbar */}
            <div className="bg-primary-900 py-20 text-center text-white mb-10">
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-4xl md:text-5xl font-serif font-bold mb-4 text-white"
                >
                    Our Accommodations
                </motion.h1>
                <p className="text-gray-300 max-w-xl mx-auto">
                    Choose from our wide range of premium rooms and suites designed for your comfort.
                </p>

                {/* Date Filter */}
                <div ref={dateFilterRef} className="max-w-4xl mx-auto mt-10">
                    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                            <div>
                                <label className="block text-sm font-medium mb-2 text-white">Check-in Date</label>
                                <input
                                    ref={checkInInputRef}
                                    type="date"
                                    value={checkIn}
                                    onChange={(e) => setCheckIn(e.target.value)}
                                    min={new Date().toISOString().split('T')[0]}
                                    className="w-full px-4 py-3 rounded-lg bg-white text-gray-900 border-none focus:ring-2 focus:ring-secondary"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2 text-white">Check-out Date</label>
                                <input
                                    type="date"
                                    value={checkOut}
                                    onChange={(e) => setCheckOut(e.target.value)}
                                    min={checkIn || new Date().toISOString().split('T')[0]}
                                    className="w-full px-4 py-3 rounded-lg bg-white text-gray-900 border-none focus:ring-2 focus:ring-secondary"
                                />
                            </div>

                            <div className="flex gap-2">
                                <button
                                    onClick={handleSearchAvailability}
                                    className="flex-1 bg-secondary text-primary-900 hover:bg-secondary-light py-3 px-6 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    disabled={!checkIn || !checkOut}
                                >
                                    Search Rooms
                                </button>
                                {dateFilterActive && (
                                    <button
                                        onClick={handleClearDates}
                                        className="bg-white/20 text-white border border-white hover:bg-white/30 py-3 px-6 rounded-lg font-semibold transition-colors"
                                    >
                                        Clear
                                    </button>
                                )}
                            </div>
                        </div>

                        {dateFilterActive && (
                            <div className="mt-4 text-center text-sm text-gray-200">
                                Showing rooms available from {new Date(checkIn).toLocaleDateString()} to {new Date(checkOut).toLocaleDateString()}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <Section>
                {loading && <p className="text-center">Loading rooms...</p>}
                {error && <p className="text-center text-red-500">{error}</p>}
                {!loading && !error && roomTypes.length === 0 && (
                    <p className="text-center text-gray-600">No rooms available{dateFilterActive ? ' for selected dates' : ''}.</p>
                )}
                {!loading && !error && roomTypes.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {roomTypes.map(room => (
                            <RoomCard
                                key={room.id}
                                room={room}
                                user={user}
                                checkIn={dateFilterActive ? checkIn : ''}
                                checkOut={dateFilterActive ? checkOut : ''}
                                onDateRequired={handleDateRequired}
                            />
                        ))}
                    </div>
                )}
            </Section>
        </main>
    );
}



