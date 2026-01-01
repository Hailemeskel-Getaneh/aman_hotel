import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Wifi, Users, Star, Coffee, MapPin, ArrowLeft, Check, Calendar } from "lucide-react";
import Section from "../components/ui/Section";
import Button from "../components/ui/Button";
import { roomTypeService } from "../services/api";

// Import images (reusing from Rooms.jsx imports or similar utility)
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

export default function RoomDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const checkInParam = searchParams.get('checkIn');
    const checkOutParam = searchParams.get('checkOut');

    const [room, setRoom] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [availableGaps, setAvailableGaps] = useState([]);

    const user = JSON.parse(localStorage.getItem("user"));

    useEffect(() => {
        const fetchRoomDetails = async () => {
            try {
                const data = await roomTypeService.getSingle(id);
                if (data) {
                    // Check availability if dates are provided
                    let status = 'available';
                    let availableCount = null;

                    if (checkInParam && checkOutParam) {
                        const availData = await roomTypeService.checkAvailability(checkInParam, checkOutParam);

                        if (availData.data) {
                            const thisType = availData.data.find(r => r.room_type_id == id);
                            if (thisType) {
                                if (thisType.available_for_dates) {
                                    const count = availData.data.filter(r => r.room_type_id == id && r.available_for_dates).length;
                                    availableCount = count;
                                    status = count > 0 ? 'available' : 'unavailable';
                                } else {
                                    status = 'unavailable';
                                }
                            } else {
                                status = 'unavailable';
                            }
                        }

                        // Get next availability if unavailable
                        if (status === 'unavailable' && checkInParam) {
                            try {
                                const nextData = await roomTypeService.getNextAvailability(id, checkInParam);
                                if (nextData.gaps) {
                                    setAvailableGaps(nextData.gaps);
                                } else if (nextData.available_date) {
                                    setAvailableGaps([{ start: nextData.available_date }]);
                                }
                            } catch (e) {
                                console.error("Error fetching next availability", e);
                            }
                        } else {
                            setAvailableGaps([]);
                        }
                    }

                    setRoom({
                        ...data,
                        status: status,
                        available_rooms: availableCount,
                        image: data.image_url || getImageForRoomType(data.name || data.type_name)
                    });
                }
            } catch (err) {
                console.error("Error fetching room details:", err);
                setError("Failed to load room details.");
            } finally {
                setLoading(false);
            }
        };

        fetchRoomDetails();
    }, [id, checkInParam, checkOutParam]);

    const formatGaps = (gaps) => {
        if (!gaps || gaps.length === 0) return '';
        // Show first 2 gaps
        const display = gaps.slice(0, 2).map(g => {
            const start = new Date(g.start);
            const end = g.end ? new Date(g.end) : null;

            const opts = { month: 'short', day: 'numeric' };

            if (!g.end || (end && (end - start > 30 * 24 * 60 * 60 * 1000))) {
                return `From ${start.toLocaleDateString(undefined, opts)}`;
            }
            return `${start.toLocaleDateString(undefined, opts)}-${end.toLocaleDateString(undefined, opts)}`;
        });

        return `Free: ${display.join(', ')}${gaps.length > 2 ? '...' : ''}`;
    };

    const handleBookNow = () => {
        if (!user) {
            const redirectUrl = `/rooms/${id}?checkIn=${checkInParam}&checkOut=${checkOutParam}`;
            localStorage.setItem('redirectAfterLogin', redirectUrl);
            navigate('/signin');
            return;
        }
        navigate(`/booking?roomTypeId=${id}&checkIn=${checkInParam}&checkOut=${checkOutParam}`);
    };

    if (loading) return <div className="min-h-screen pt-24 text-center">Loading...</div>;
    if (error || !room) return <div className="min-h-screen pt-24 text-center text-red-500">{error || "Room not found"}</div>;

    const isAvailable = room.status === 'available';

    return (
        <main className="bg-background min-h-screen pt-20">
            {/* Back Button */}
            <div className="container mx-auto px-4 py-6">
                <button onClick={() => navigate(-1)} className="flex items-center text-gray-600 hover:text-primary-900 transition-colors">
                    <ArrowLeft className="h-5 w-5 mr-2" />
                    Back
                </button>
            </div>

            <Section className="pt-0">
                <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
                    <div className="grid grid-cols-1 lg:grid-cols-2">
                        {/* Image Section */}
                        <div className="relative h-96 lg:h-auto">
                            <img
                                src={room.image}
                                alt={room.name || room.type_name}
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute top-6 left-6">
                                <span className={`px-4 py-2 rounded-full text-sm font-bold shadow-sm ${isAvailable ? 'bg-green-100 text-green-800' : (availableGaps.length > 0 ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800')
                                    }`}>
                                    {isAvailable ? 'Available' : (availableGaps.length > 0 ? formatGaps(availableGaps) : 'Currently Unavailable')}
                                </span>
                            </div>
                        </div>

                        {/* Content Section */}
                        <div className="p-8 md:p-12 flex flex-col justify-center">
                            <h1 className="text-4xl font-serif font-bold text-primary-900 mb-4">
                                {room.name || room.type_name}
                            </h1>

                            <div className="flex items-center gap-6 mb-8 text-gray-600">
                                <div className="flex items-center">
                                    <Users className="h-5 w-5 mr-2 text-secondary" />
                                    <span>Max Occupancy: {room.max_occupancy}</span>
                                </div>
                                <div className="flex items-center">
                                    <Star className="h-5 w-5 mr-2 text-secondary" />
                                    <span>Premium Service</span>
                                </div>
                            </div>

                            <p className="text-gray-600 mb-8 leading-relaxed text-lg">
                                {room.description}
                            </p>

                            <div className="mb-8">
                                <h3 className="font-bold text-primary-900 mb-4 flex items-center">
                                    <Coffee className="h-5 w-5 mr-2 text-secondary" />
                                    Amenities
                                </h3>
                                <div className="grid grid-cols-2 gap-3">
                                    {(room.amenities ? room.amenities.split(',') : ['Free WiFi', 'Air Conditioning', 'Room Service', 'Smart TV']).map((amenity, idx) => (
                                        <div key={idx} className="flex items-center text-gray-600 text-sm">
                                            <Check className="h-4 w-4 mr-2 text-green-500" />
                                            {amenity.trim()}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-8 border-t border-gray-100">
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Price per night</p>
                                    <p className="text-3xl font-bold text-primary-900">
                                        ${room.price || room.price_per_night}
                                    </p>
                                </div>

                                <div className="flex-1 w-full sm:w-auto">
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase">Check-In</label>
                                                <input
                                                    type="date"
                                                    value={checkInParam || ''}
                                                    onChange={(e) => {
                                                        const newParams = new URLSearchParams(searchParams);
                                                        newParams.set('checkIn', e.target.value);
                                                        if (checkOutParam && e.target.value >= checkOutParam) {
                                                            newParams.delete('checkOut'); // Reset invalid checkout
                                                        }
                                                        setSearchParams(newParams);
                                                    }}
                                                    min={new Date().toISOString().split('T')[0]}
                                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-900 focus:border-transparent"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase">Check-Out</label>
                                                <input
                                                    type="date"
                                                    value={checkOutParam || ''}
                                                    onChange={(e) => {
                                                        const newParams = new URLSearchParams(searchParams);
                                                        newParams.set('checkOut', e.target.value);
                                                        setSearchParams(newParams);
                                                    }}
                                                    min={checkInParam || new Date().toISOString().split('T')[0]}
                                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-900 focus:border-transparent"
                                                />
                                            </div>
                                        </div>

                                        <Button
                                            size="lg"
                                            className="w-full bg-primary-900 text-white hover:bg-primary-800 shadow-lg"
                                            disabled={!isAvailable || !checkInParam || !checkOutParam}
                                            onClick={handleBookNow}
                                        >
                                            {checkInParam && checkOutParam
                                                ? (isAvailable ? 'Book This Room' : 'Not Available')
                                                : 'Check Availability'}
                                        </Button>

                                        {availableGaps.length > 0 && !isAvailable && checkInParam && (
                                            <p className="text-center text-sm text-blue-600 font-medium bg-blue-50 p-2 rounded-lg">
                                                {formatGaps(availableGaps)}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {checkInParam && checkOutParam && (
                                <p className="text-center text-sm text-gray-500 mt-4">
                                    Selected Dates: {new Date(checkInParam).toLocaleDateString()} - {new Date(checkOutParam).toLocaleDateString()}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </Section>
        </main>
    );
}
