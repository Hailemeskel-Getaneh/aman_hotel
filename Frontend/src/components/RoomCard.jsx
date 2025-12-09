import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Button from "./ui/Button";

export default function RoomCard({ room, user }) {
    const linkTarget = user ? `/booking?roomId=${room.id}` : "/signin";

    return (
        <motion.article
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="group relative bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
        >
            <div className="relative h-64 overflow-hidden">
                <img
                    src={room.image}
                    alt={room.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm px-4 py-1 rounded-full text-sm font-bold text-primary-900 shadow-sm">
                    ${room.price} <span className="text-xs font-normal text-gray-600">/ night</span>
                </div>
            </div>

            <div className="p-6">
                <h3 className="text-xl font-serif font-bold text-primary-900 mb-2">{room.name}</h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{room.short_description}</p>

                <Link to={linkTarget} className="block w-full">
                    <Button variant="primary" className="w-full">
                        Book Now
                    </Button>
                </Link>
            </div>
        </motion.article>
    );
}
