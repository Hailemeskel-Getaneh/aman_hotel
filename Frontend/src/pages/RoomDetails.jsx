import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Wifi, Coffee, Bath, Tv, Users, MapPin, Star,
    ChevronLeft, ChevronRight, Calendar, Check
} from 'lucide-react';
import Button from '../components/ui/Button';
import Section from '../components/ui/Section';
import { roomTypeService, roomService } from '../services/api';

// Placeholder images for slider (since API often returns null/single image)
import slider1 from "../assets/images/slider-1.jpg";
import slider2 from "../assets/images/slider-2.jpg";
import slider3 from "../assets/images/slider-3.jpg";
import deluxeImg from '../assets/images/deluxe.jpg';

const RoomDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [roomType, setRoomType] = useState(null);
    const [loading, setLoading] = useState(true);

    // Booking State
    const [checkIn, setCheckIn] = useState('');
    const [checkOut, setCheckOut] = useState('');
    const [isAvailable, setIsAvailable] = useState(null);
    const [checking, setChecking] = useState(false);

    // Slider State
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const images = [slider1, slider2, slider3, deluxeImg]; // Ideally from API

    useEffect(() => {
        const fetchRoomData = async () => {
            try {
                const data = await roomTypeService.getSingle(id);
                setRoomType(data);

                // If the user navigated with pre-selected dates, we could parse them from URL/Location state here
                // For now, simple fetch.
            } catch (error) {
                console.error("Error fetching room details:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchRoomData();
    }, [id]);

    const handleCheckAvailability = async () => {
        if (!checkIn || !checkOut) return;
        setChecking(true);
        try {
            // Check specifically for this room type
            const data = await roomService.checkAvailability(checkIn, checkOut, id);
            // If we get any room back of this type that is available
            const availableRooms = data.data ? data.data.filter(r => r.available_for_dates) : [];
            setIsAvailable(availableRooms.length > 0);
        } catch (error) {
            console.error("Availability check failed", error);
            setIsAvailable(false);
        } finally {
            setChecking(false);
        }
    };

    const handleBookNow = () => {
        navigate(`/booking?roomTypeId=${id}&checkIn=${checkIn}&checkOut=${checkOut}`);
    };

    // Slider Logic
    const nextImage = () => setCurrentImageIndex((prev) => (prev + 1) % images.length);
    const prevImage = () => setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-900"></div>
            </div>
        );
    }

    if (!roomType) {
        return <div className="min-h-screen pt-24 text-center">Room not found</div>;
    }

    // Amenities (Mock or Parse from API string)
    return (
        <main className="bg-background min-h-screen">
            {/* Header Section */}
            <div className="bg-primary-900 text-white py-12 md:py-20">
                <div className="container mx-auto px-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="max-w-4xl"
                    >
                        <span className="inline-block px-3 py-1 bg-secondary text-primary-900 text-xs font-bold uppercase tracking-wider mb-4 rounded-sm">
                            Luxury Collection
                        </span>
                        <h1 className="text-4xl md:text-6xl font-serif font-bold mb-4">
                            {roomType.type_name}
                        </h1>
                        <p className="text-xl text-gray-300">
                            Starting from <span className="text-secondary font-bold">${roomType.price_per_night}</span> / night
                        </p>
                    </motion.div>
                </div>
            </div>

            <div className="container mx-auto px-4 -mt-12 relative z-10 pb-12">
                {/* Contained Image Slider */}
                <div className="relative h-[400px] md:h-[500px] w-full rounded-3xl overflow-hidden shadow-2xl bg-gray-900 mb-12 border-4 border-white">
                    <AnimatePresence mode='wait'>
                        <motion.img
                            key={currentImageIndex}
                            src={images[currentImageIndex]}
                            initial={{ opacity: 0, scale: 1.1 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.5 }}
                            className="absolute inset-0 w-full h-full object-cover"
                            alt={roomType.type_name}
                        />
                    </AnimatePresence>

                    {/* Gradient Overlay for controls visibility */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />

                    {/* Slider Controls */}
                    <button
                        onClick={prevImage}
                        className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-full text-white transition-all shadow-lg"
                    >
                        <ChevronLeft size={24} />
                    </button>
                    <button
                        onClick={nextImage}
                        className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-full text-white transition-all shadow-lg"
                    >
                        <ChevronRight size={24} />
                    </button>

                    {/* Image Indicators (Dots) */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                        {images.map((_, idx) => (
                            <div
                                key={idx}
                                className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentImageIndex ? 'w-6 bg-secondary' : 'w-1.5 bg-white/50'}`}
                            />
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-12">
                        {/* Description */}
                        <div>
                            <h2 className="text-3xl font-serif font-bold text-primary-900 mb-6">About this Room</h2>
                            <p className="text-gray-600 leading-relaxed text-lg">
                                {roomType.description || "Experience the epitome of luxury and comfort. This room is designed to provide you with a serene escape from the bustling city. Meticulously decorated with hand-picked furnishings and vibrant artworks, it offers a perfect blend of modern amenities and classic elegance."}
                            </p>
                        </div>

                        {/* Amenities */}
                        <div>
                            <h2 className="text-3xl font-serif font-bold text-primary-900 mb-8">Amenities & Features</h2>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                                {amenityList.map((item, idx) => (
                                    <div key={idx} className="flex items-center gap-3 p-4 bg-white rounded-xl shadow-sm border border-gray-100/50 hover:shadow-md transition-shadow">
                                        <div className="p-2 bg-primary-50 rounded-full text-primary-700">
                                            <Check size={18} />
                                        </div>
                                        <span className="text-gray-700 font-medium">{item}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Gallery Grid (Static for layout variety) */}
                        <div className="grid grid-cols-2 gap-4 h-64 md:h-96">
                            <img src={images[1]} alt="Interior 1" className="w-full h-full object-cover rounded-2xl" />
                            <div className="grid grid-rows-2 gap-4">
                                <img src={images[2]} alt="Interior 2" className="w-full h-full object-cover rounded-2xl" />
                                <img src={images[3]} alt="Interior 3" className="w-full h-full object-cover rounded-2xl" />
                            </div>
                        </div>
                    </div>

                    {/* Booking Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-24 bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
                            <h3 className="text-2xl font-serif font-bold text-primary-900 mb-2">Book Your Stay</h3>
                            <p className="text-gray-500 mb-6 text-sm">Select dates to check availability</p>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Check-in</label>
                                    <div className="relative">
                                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                        <input
                                            type="date"
                                            className="w-full pl-10 pr-4 py-3 bg-gray-50 rounded-lg border-gray-200 focus:ring-2 focus:ring-secondary focus:border-secondary outline-none transition-all"
                                            value={checkIn}
                                            onChange={(e) => {
                                                setCheckIn(e.target.value);
                                                setIsAvailable(null); // Reset status on change
                                            }}
                                            min={new Date().toISOString().split('T')[0]}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Check-out</label>
                                    <div className="relative">
                                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                        <input
                                            type="date"
                                            className="w-full pl-10 pr-4 py-3 bg-gray-50 rounded-lg border-gray-200 focus:ring-2 focus:ring-secondary focus:border-secondary outline-none transition-all"
                                            value={checkOut}
                                            onChange={(e) => {
                                                setCheckOut(e.target.value);
                                                setIsAvailable(null);
                                            }}
                                            min={checkIn || new Date().toISOString().split('T')[0]}
                                        />
                                    </div>
                                </div>

                                {/* Availability Status */}
                                {isAvailable !== null && (
                                    <div className={`p-4 rounded-lg flex items-center gap-3 ${isAvailable ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                                        <div className={`w-2 h-2 rounded-full ${isAvailable ? 'bg-green-500' : 'bg-red-500'}`} />
                                        <span className="font-medium">
                                            {isAvailable ? "Room is available!" : "Not available for these dates"}
                                        </span>
                                    </div>
                                )}

                                <div className="pt-4 space-y-3">
                                    {(checkIn && checkOut && isAvailable === null) && (
                                        <Button
                                            onClick={handleCheckAvailability}
                                            disabled={checking}
                                            className="w-full bg-primary-900 text-white hover:bg-primary-800 py-4 text-lg shadow-lg shadow-primary-900/20"
                                        >
                                            {checking ? "Checking..." : "Check Availability"}
                                        </Button>
                                    )}

                                    {isAvailable === true && (
                                        <Button
                                            onClick={handleBookNow}
                                            className="w-full bg-secondary text-primary-900 hover:bg-secondary-dark py-4 text-lg font-bold shadow-lg shadow-secondary/20"
                                        >
                                            Book Now
                                        </Button>
                                    )}

                                    {(!checkIn || !checkOut) && (
                                        <div className="text-center text-sm text-gray-400 py-2 border-t border-gray-100 mt-2">
                                            Enter dates to proceed
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
};

export default RoomDetails;
