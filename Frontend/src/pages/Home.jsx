import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Star, Wifi, Coffee, MapPin } from "lucide-react";
import Button from "../components/ui/Button";
import Section from "../components/ui/Section";
import RoomCard from "../components/RoomCard";
import Testimonials from "../components/Testimonials";
import { roomService } from "../services/api";

// Import slider images
import slider1 from "../assets/images/slider-1.jpg";
import slider2 from "../assets/images/slider-2.jpg";
import slider3 from "../assets/images/slider-3.jpg";

// Import room images for mapping
import deluxeImg from '../assets/images/deluxe.jpg';
import singleImg from '../assets/images/single.jpg';
import familyImg from '../assets/images/family.jpg';
import kingImg from '../assets/images/kingsize.jpg';
import doubleImg from '../assets/images/double.jpg';
import vipImg from '../assets/images/vip.jpg';

const heroImages = [slider1, slider2, slider3];

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

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [dateFilterActive, setDateFilterActive] = useState(false);
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async (useFilters = false) => {
    setLoading(true);
    try {
      let data;
      if (useFilters && checkIn && checkOut) {
        // Fetch with date filters
        data = await roomService.checkAvailability(checkIn, checkOut);
        setDateFilterActive(true);
      } else {
        // Fetch all rooms
        data = await roomService.getAll();
        setDateFilterActive(false);
      }

      if (data.data) {
        if (useFilters) {
          // Group by room_type_id
          const groups = {};
          data.data.forEach(r => {
            if (!groups[r.room_type_id]) {
              groups[r.room_type_id] = {
                id: r.room_type_id,
                name: r.room_type,
                price: r.price_per_night,
                image: getImageForRoomType(r.room_type),
                short_description: r.description,
                available_rooms: 0,
                total_count: 0
              };
            }
            groups[r.room_type_id].total_count++;
            if (r.available_for_dates) {
              groups[r.room_type_id].available_rooms++;
            }
          });

          const mappedRooms = Object.values(groups).map(g => ({
            ...g,
            status: g.available_rooms > 0 ? 'available' : 'booked'
          }));
          setRooms(mappedRooms);

        } else {
          // Default: Show top 3 distinct room types (or just top 3 rooms but mapped to type)
          // We map to type_id to ensure booking link works
          const mappedRooms = data.data.slice(0, 3).map(r => ({
            id: r.room_type_id,
            name: r.room_type,
            price: r.price_per_night,
            image: getImageForRoomType(r.room_type),
            short_description: r.description,
            status: r.status || 'available'
          }));
          setRooms(mappedRooms);
        }
      }
    } catch (err) {
      console.error("Error fetching rooms:", err);
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
      fetchRooms(true);
    } else {
      alert('Please select both check-in and check-out dates');
    }
  };
  const dateFilterRef = React.useRef(null);
  const checkInInputRef = React.useRef(null);

  const handleDateRequired = () => {
    if (dateFilterRef.current) {
      dateFilterRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      // Cleanest way to focus: wait slightly for scroll
      setTimeout(() => {
        if (checkInInputRef.current) {
          checkInInputRef.current.focus();
          checkInInputRef.current.click(); // Open picker if supported
        }
      }, 500);
      alert('Please select your check-in and check-out dates first to see availability.');
    }
  };

  const handleClearDates = () => {
    setCheckIn('');
    setCheckOut('');
    setDateFilterActive(false);
    fetchRooms(false);
  };



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

      {/* Date Filter Section */}
      <Section className="bg-primary-900 text-white" id="date-filter">
        <div ref={dateFilterRef} className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4 text-white">Available</h2>
            <p className="text-gray-300">Select your dates to see available rooms</p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 md:p-8">
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
                <Button
                  onClick={handleSearchAvailability}
                  className="flex-1 bg-secondary text-primary-900 hover:bg-secondary-light py-3 font-semibold"
                  disabled={!checkIn || !checkOut}
                >
                  Search Rooms
                </Button>
                {dateFilterActive && (
                  <Button
                    onClick={handleClearDates}
                    variant="outline"
                    className="bg-white/20 text-white border-white hover:bg-white/30 py-3 font-semibold"
                  >
                    Clear
                  </Button>
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
      </Section>

      {/* Featured Rooms */}
      <Section className="bg-gray-50">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-primary-900 mb-4">
              {dateFilterActive ? "Available Rooms" : "Featured Rooms"}
            </h2>
            <p className="text-gray-600">Discover our most popular accommodations</p>
          </div>
          <Link to="/rooms" className="hidden md:flex items-center text-secondary font-medium hover:text-primary-700 transition-colors">
            View All Rooms <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>

        {loading ? (
          <p className="text-center">Loading rooms...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {rooms.map(room => (
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

        <div className="mt-12 text-center md:hidden">
          <Link to="/rooms">
            <Button variant="outline">View All Rooms</Button>
          </Link>
        </div>
      </Section>

      {/* Testimonials Section */}
      <Testimonials />
    </main>
  );
}
