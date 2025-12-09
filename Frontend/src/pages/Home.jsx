import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Star, Wifi, Coffee, MapPin } from "lucide-react";
import Button from "../components/ui/Button";
import Section from "../components/ui/Section";
import RoomCard from "../components/RoomCard";
import { roomsData } from "../data/rooms";

// Import slider images
import slider1 from "../assets/images/slider-1.jpg";
import slider2 from "../assets/images/slider-2.jpg";
import slider3 from "../assets/images/slider-3.jpg";

const heroImages = [slider1, slider2, slider3];

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const featuredRooms = roomsData.slice(0, 3);

  return (
    <main className="bg-background min-h-screen">
      {/* Hero Section */}
      <section className="relative h-screen w-full overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5 }}
            className="absolute inset-0"
          >
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${heroImages[currentSlide]})` }}
            />
            <div className="absolute inset-0 bg-black/40" /> {/* Overlay */}
          </motion.div>
        </AnimatePresence>

        <div className="relative h-full container mx-auto px-4 md:px-6 flex flex-col justify-center items-center text-center text-white z-10">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="text-4xl md:text-6xl lg:text-7xl font-serif font-bold mb-6 tracking-tight"
          >
            Welcome to Aman Hotel
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.8 }}
            className="text-lg md:text-2xl font-light mb-10 max-w-2xl text-gray-100"
          >
            Experience luxury and comfort in the heart of the city. Your sanctuary awaits.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1, duration: 0.8 }}
          >
            <Link to="/rooms">
              <Button size="lg" className="bg-secondary text-primary-900 hover:bg-white hover:text-primary-900 border-none">
                Explore Our Rooms
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <Section className="bg-white">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-primary-900 mb-4">Why Choose Aman?</h2>
          <div className="h-1 w-20 bg-secondary mx-auto" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { icon: Star, title: "5-Star Service", desc: "Experience world-class hospitality tailored to your needs." },
            { icon: Wifi, title: "High-Speed WiFi", desc: "Stay connected with complimentary high-speed internet access." },
            { icon: MapPin, title: "Prime Location", desc: "Located in the city center, close to all major attractions." },
          ].map((feature, idx) => (
            <motion.div
              key={idx}
              whileHover={{ y: -5 }}
              className="p-8 rounded-xl bg-gray-50 border border-gray-100 shadow-sm text-center hover:shadow-md transition-all"
            >
              <feature.icon className="h-12 w-12 text-secondary mx-auto mb-6" />
              <h3 className="text-xl font-bold text-primary-900 mb-3">{feature.title}</h3>
              <p className="text-gray-600">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* Featured Rooms */}
      <Section className="bg-gray-50">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-primary-900 mb-4">Featured Rooms</h2>
            <p className="text-gray-600">Discover our most popular accommodations</p>
          </div>
          <Link to="/rooms" className="hidden md:flex items-center text-secondary font-medium hover:text-primary-700 transition-colors">
            View All Rooms <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredRooms.map(room => (
            <RoomCard key={room.id} room={room} /> // Passing user={null} implicitly
          ))}
        </div>

        <div className="mt-12 text-center md:hidden">
          <Link to="/rooms">
            <Button variant="outline">View All Rooms</Button>
          </Link>
        </div>
      </Section>
    </main>
  );
}
