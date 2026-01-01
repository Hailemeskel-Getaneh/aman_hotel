import React from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import Button from "./ui/Button";
import placeholderImg from '../assets/images/placeholder.png';

export default function RoomCard({ room, user, checkIn, checkOut, onDateRequired }) {
    const navigate = useNavigate();
    const isAvailable = room.status?.toLowerCase() === 'available';

    const getBookingUrl = () => {
        let url = `/booking?roomTypeId=${room.id}`;
        if (checkIn) url += `&checkIn=${checkIn}`;
        if (checkOut) url += `&checkOut=${checkOut}`;
        return url;
    };

    const handleCardClick = () => {
        navigate(`/rooms/${room.id}`);
    };

    const handleBookNowClick = (e) => {
        if (!checkIn || !checkOut) {
            e.preventDefault();
            if (onDateRequired) onDateRequired();
            return;
        }

        if (!user && isAvailable) {
            // Save the intended booking URL before redirecting to sign-in
            const bookingUrl = getBookingUrl();
            localStorage.setItem('redirectAfterLogin', bookingUrl);
        }
    };

    const linkTarget = (checkIn && checkOut)
        ? (user && isAvailable ? getBookingUrl() : (isAvailable ? "/signin" : "#"))
        : "#";

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'available':
                return 'bg-green-100 text-green-800 border-green-300';
            case 'unavailable':
            case 'booked':
                return 'bg-red-100 text-red-800 border-red-300';
            case 'maintenance':
                return 'bg-yellow-100 text-yellow-800 border-yellow-300';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-300';
        }
    };

    const getButtonText = () => {
        if (!checkIn || !checkOut) {
            return "Check Availability";
        }
        if (!isAvailable) {
            return room.status?.toLowerCase() === 'maintenance' ? 'Under Maintenance' : 'Unavailable';
        }
        return 'Book Now';
    };

    const getStatusText = () => {
        if (room.status?.toLowerCase() === 'unavailable') {
            return 'Fully Booked';
        }
        if (room.available_rooms !== undefined) {
            // If specifically checking availability (filtered), show "Available" if count > 0
            return room.available_rooms > 0 ? 'Available' : 'Fully Booked';
        }
        return room.status?.charAt(0).toUpperCase() + room.status?.slice(1) || 'Available';
    };

    // Override isAvailable if we have explicit available_rooms counts from a filter
    const displayIsAvailable = room.available_rooms !== undefined
        ? room.available_rooms > 0
        : isAvailable;


    return (
        <motion.article
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className={`group relative bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 ${!displayIsAvailable ? 'opacity-75' : ''}`}
        >
            {/* Image Container - Clickable */}
            <div
                className="relative h-64 cursor-pointer overflow-hidden"
                onClick={handleCardClick}
            >
                <img
                    src={room.image || placeholderImg}
                    alt={room.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {/* Status Badge - Only show if dates are selected */}
                {checkIn && checkOut && (
                    <div className={`absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(room.status)}`}>
                        {getStatusText()}
                    </div>
                )}
            </div>

            <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <p className="text-secondary text-sm uppercase tracking-wider font-semibold mb-1">Luxury Collection</p>
                        <h3
                            className="text-xl font-serif font-bold text-primary-900 mb-2 cursor-pointer hover:text-secondary transition-colors"
                            onClick={handleCardClick}
                        >
                            {room.name}
                        </h3>
                    </div>
                    <div className="text-right">
                        <p className="text-2xl font-bold text-primary-900">${room.price}</p>
                        <p className="text-sm text-gray-500">per night</p>
                    </div>
                </div>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{room.short_description}</p>

                {(displayIsAvailable || (!checkIn || !checkOut)) ? (
                    <Link to={linkTarget} className="block w-full" onClick={handleBookNowClick}>
                        <Button variant="primary" className="w-full text-white bg-blue-900">
                            {getButtonText()}
                        </Button>
                    </Link>
                ) : (
                    <Button variant="outline" className="w-full cursor-not-allowed" disabled>
                        {getButtonText()}
                    </Button>
                )}
            </div>
        </motion.article>
    );
}
