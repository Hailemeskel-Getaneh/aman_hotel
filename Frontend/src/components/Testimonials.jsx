import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Quote, ChevronLeft, ChevronRight } from 'lucide-react';
import Section from './ui/Section';

const testimonials = [
  {
    id: 1,
    name: "Sarah Jenkins",
    role: "Luxury Traveler",
    content: "The attention to detail at Aman Hotel is simply unmatched. From the moment we arrived, we felt like royalty. The room views were breathtaking.",
    rating: 5,
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
  },
  {
    id: 2,
    name: "Michael Chen",
    role: "Business Executive",
    content: "Perfect for business and leisure. The high-speed WiFi and quiet atmosphere allowed me to work efficiently, while the spa was the perfect way to unwind.",
    rating: 5,
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
  },
  {
    id: 3,
    name: "Emma Thompson",
    role: "Honeymooner",
    content: "We celebrated our honeymoon here and it was magical. The staff surprised us with champagne and chocolates. A memory we will cherish forever.",
    rating: 5,
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
  },
  {
    id: 4,
    name: "David Wilson",
    role: "Frequent Flyer",
    content: "I've stayed in hotels all over the world, and Aman stands out. The concierge service is impeccable and the location is unbeatable.",
    rating: 5,
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
  },
  {
    id: 5,
    name: "Sophia Rodriguez",
    role: "Architecture Enthusiast",
    content: "The design of this hotel is a masterpiece. Every corner is photogenic, and the blend of modern luxury with traditional touches is stunning.",
    rating: 5,
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
  }
];

export default function Testimonials() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  // Auto-scroll effect
  useEffect(() => {
    const timer = setInterval(() => {
      handleNext();
    }, 5000); // Change every 5 seconds
    return () => clearInterval(timer);
  }, [currentIndex]);

  const handleNext = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const handleDotClick = (index) => {
    setDirection(index > currentIndex ? 1 : -1);
    setCurrentIndex(index);
  };

  const variants = {
    enter: (direction) => ({
      x: direction > 0 ? 100 : -100,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction) => ({
      x: direction < 0 ? 100 : -100,
      opacity: 0,
    }),
  };

  return (
    <Section className="bg-gradient-to-br from-gray-900 via-primary-900 to-primary-800 relative overflow-hidden py-24">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-secondary/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 mix-blend-overlay" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-secondary font-medium tracking-[0.2em] uppercase text-sm mb-3 block"
          >
            Guest Stories
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-serif font-bold text-white mb-6 leading-tight"
          >
            Memories Made at Aman
          </motion.h2>
          <div className="h-1 w-24 bg-gradient-to-r from-transparent via-secondary to-transparent mx-auto opacity-70" />
        </div>

        {/* Carousel Container */}
        <div className="relative h-[350px] md:h-[300px] flex items-center justify-center">
          {/* Left Button */}
          <button
            onClick={() => {
              setDirection(-1);
              setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
            }}
            className="absolute left-0 md:-left-12 z-20 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors backdrop-blur-sm"
          >
            <ChevronLeft size={24} />
          </button>

          {/* Right Button */}
          <button
            onClick={() => {
              setDirection(1);
              setCurrentIndex((prev) => (prev + 1) % testimonials.length);
            }}
            className="absolute right-0 md:-right-12 z-20 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors backdrop-blur-sm"
          >
            <ChevronRight size={24} />
          </button>

          <AnimatePresence initial={false} custom={direction}>
            <motion.div
              key={currentIndex}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: "spring", stiffness: 300, damping: 30 },
                opacity: { duration: 0.2 }
              }}
              className="absolute w-full max-w-xl px-4"
            >
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 md:p-8 rounded-2xl shadow-2xl relative">
                {/* Quote Icon */}
                <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-secondary p-2 rounded-full shadow-lg text-primary-900">
                  <Quote size={20} fill="currentColor" />
                </div>

                <div className="text-center mt-4">
                  <p className="text-lg md:text-xl text-gray-200 font-serif leading-relaxed italic mb-6 line-clamp-3">
                    "{testimonials[currentIndex].content}"
                  </p>

                  <div className="flex flex-col items-center justify-center gap-3">
                    <img
                      src={testimonials[currentIndex].image}
                      alt={testimonials[currentIndex].name}
                      className="w-14 h-14 rounded-full object-cover border-2 border-secondary p-0.5"
                    />
                    <div>
                      <h4 className="text-white font-bold text-base">{testimonials[currentIndex].name}</h4>
                      <div className="flex justify-center gap-1 mt-1">
                        {[...Array(testimonials[currentIndex].rating)].map((_, i) => (
                          <Star key={i} className="w-3 h-3 text-secondary fill-secondary" />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation Dots */}
        <div className="flex justify-center items-center gap-2 mt-6">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => handleDotClick(index)}
              className={`h-2 rounded-full transition-all duration-300 ${index === currentIndex
                  ? 'w-8 bg-secondary'
                  : 'w-2 bg-white/20 hover:bg-white/40'
                }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </Section>
  );
}
