import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Button from "./ui/Button";
import placeholderImg from '../assets/images/placeholder.png';

export default function RoomCard({ room, user, checkIn, checkOut, onDateRequired }) {
    const isAvailable = room.status?.toLowerCase() === 'available';

    const getBookingUrl = () => {
        let url = `/booking?roomTypeId=${room.id}`;
        if (checkIn) url += `&checkIn=${checkIn}`;
        if (checkOut) url += `&checkOut=${checkOut}`;
        return url;
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
            <div className="relative h-64 overflow-hidden">
                <img
                    src={room.image}
                    alt={room.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    onError={(e) => { e.target.src = placeholderImg; }}
                />
                <div className={`absolute inset-0 transition-colors ${!displayIsAvailable ? 'bg-black/40' : 'bg-black/20 group-hover:bg-black/10'}`} />

                {/* Status Badge - Only show if dates are selected */}
                {checkIn && checkOut && (
                    <div className={`absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(room.status)}`}>
                        {getStatusText()}
                    </div>
                )}

                <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm px-4 py-1 rounded-full text-sm font-bold text-primary-900 shadow-sm">
                    ${room.price} <span className="text-xs font-normal text-gray-600">/ night</span>
                </div>
            </div>

            <div className="p-6">
                <h3 className="text-xl font-serif font-bold text-primary-900 mb-2">{room.name}</h3>
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
