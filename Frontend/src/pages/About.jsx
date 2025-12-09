import React from "react";
import Section from "../components/ui/Section";
import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";

export default function About() {
    const services = [
        "Luxury Rooms & Suites",
        "Fine Dining Restaurant",
        "Conference & Event Hall",
        "Free High-Speed Wi-Fi",
        "24/7 Customer Support"
    ];

    return (
        <main className="bg-background min-h-screen pt-16">
            {/* Header */}
            <div className="bg-primary-900 text-white py-20 text-center">
                <div className="container mx-auto px-4">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl md:text-5xl font-serif font-bold mb-4"
                    >
                        About Us
                    </motion.h1>
                    <p className="text-secondary text-lg font-medium">Your comfort is our top priority</p>
                </div>
            </div>

            <Section>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    {/* Image Side */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="relative"
                    >
                        <div className="absolute -inset-4 bg-secondary/20 rounded-xl transform -rotate-2" />
                        <img
                            src="https://images.unsplash.com/photo-1566073771259-6a8506099945"
                            alt="Aman Hotel Interior"
                            className="relative rounded-xl shadow-xl w-full object-cover h-[400px] md:h-[500px]"
                        />
                    </motion.div>

                    {/* Text Side */}
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                    >
                        <h2 className="text-3xl font-serif font-bold text-primary-900 mb-6">Welcome to Aman Hotel</h2>
                        <div className="space-y-4 text-gray-600 leading-relaxed">
                            <p>
                                Aman Hotel is a luxury sanctuary designed to provide an unforgettable
                                hospitality experience. Located in the heart of Debre Berhan, we offer a perfect blend of modern elegance and traditional warmth.
                            </p>
                            <p>
                                Whether you are here for business or leisure, our top-grade service, delicious cuisine, and calm environment ensure a stay that exceeds expectations.
                            </p>
                        </div>

                        <div className="mt-8 space-y-6">
                            <div>
                                <h3 className="text-xl font-bold text-primary-900 mb-2">Our Mission</h3>
                                <p className="text-gray-600">To deliver high-quality hospitality services that exceed guest expectations through personalized care and attention to detail.</p>
                            </div>

                            <div>
                                <h3 className="text-xl font-bold text-primary-900 mb-2">What We Offer</h3>
                                <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                                    {services.map((item, idx) => (
                                        <li key={idx} className="flex items-center gap-2 text-primary-700 font-medium">
                                            <CheckCircle2 className="h-5 w-5 text-secondary" />
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </Section>
        </main>
    );
}
