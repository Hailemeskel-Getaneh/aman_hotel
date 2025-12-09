import React, { useState, useEffect } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Hotel } from "lucide-react";
import Button from "./ui/Button";
import { cn } from "../lib/utils";

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const location = useLocation();

    // Check if user is logged in
    const [user, setUser] = useState(null);

    useEffect(() => {
        // Check localStorage for user on mount and location change
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        } else {
            setUser(null);
        }
    }, [location]);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // Close mobile menu on route change
    useEffect(() => {
        setIsOpen(false);
    }, [location.pathname]);

    const navLinks = [
        { name: "Home", path: "/" },
        { name: "Rooms", path: "/rooms" },
        { name: "Events", path: "/events" },
        { name: "About", path: "/about" },
        { name: "Contact", path: "/contact" },
    ];

    const handleSignOut = () => {
        localStorage.removeItem("user");
        setUser(null);
        window.location.href = "/";
    };

    return (
        <header
            className={cn(
                "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
                scrolled
                    ? "bg-white/80 backdrop-blur-md shadow-md py-4"
                    : "bg-transparent py-6"
            )}
        >
            <div className="container mx-auto px-4 md:px-6 flex items-center justify-between">
                {/* Logo */}
                <Link to="/" className="flex items-center gap-2 group">
                    <Hotel className="h-8 w-8 text-secondary group-hover:text-primary-700 transition-colors" />
                    <span className={cn(
                        "text-2xl font-serif font-bold tracking-tight",
                        scrolled ? "text-primary-900" : "text-primary-900" // Could change color if hero is dark
                    )}>
                        Aman Hotel
                    </span>
                </Link>

                {/* Desktop Navigation */}
                <nav className="hidden md:flex items-center gap-8">
                    {navLinks.map((link) => (
                        <NavLink
                            key={link.path}
                            to={link.path}
                            className={({ isActive }) =>
                                cn(
                                    "text-sm font-medium transition-colors hover:text-secondary",
                                    isActive
                                        ? "text-secondary font-semibold"
                                        : "text-primary-700"
                                )
                            }
                        >
                            {link.name}
                        </NavLink>
                    ))}
                    {user && (
                        <NavLink
                            to="/my-bookings"
                            className={({ isActive }) =>
                                cn(
                                    "text-sm font-medium transition-colors hover:text-secondary",
                                    isActive
                                        ? "text-secondary font-semibold"
                                        : "text-primary-700"
                                )
                            }
                        >
                            My Bookings
                        </NavLink>
                    )}
                    {user ? (
                        <div className="flex items-center gap-3">
                            <span className="text-sm text-primary-700">Hi, {user.name}</span>
                            <Button variant="outline" size="sm" onClick={handleSignOut}>
                                Sign Out
                            </Button>
                        </div>
                    ) : (
                        <Link to="/signin">
                            <Button variant="primary" size="sm">
                                Sign In
                            </Button>
                        </Link>
                    )}
                </nav>

                {/* Mobile Menu Button */}
                <button
                    className="md:hidden text-primary-900 p-2"
                    onClick={() => setIsOpen(!isOpen)}
                    aria-label="Toggle menu"
                >
                    {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </button>
            </div>

            {/* Mobile Navigation Dropdown */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden bg-white border-t border-gray-100 overflow-hidden"
                    >
                        <nav className="flex flex-col p-4 gap-4">
                            {navLinks.map((link) => (
                                <NavLink
                                    key={link.path}
                                    to={link.path}
                                    className={({ isActive }) =>
                                        cn(
                                            "text-base font-medium py-2 px-2 rounded-md transition-colors",
                                            isActive
                                                ? "bg-primary-50 text-primary-900"
                                                : "text-gray-600 hover:bg-gray-50 hover:text-primary-900"
                                        )
                                    }
                                >
                                    {link.name}
                                </NavLink>
                            ))}
                            {user && (
                                <NavLink
                                    to="/my-bookings"
                                    className={({ isActive }) =>
                                        cn(
                                            "text-base font-medium py-2 px-2 rounded-md transition-colors",
                                            isActive
                                                ? "bg-primary-50 text-primary-900"
                                                : "text-gray-600 hover:bg-gray-50 hover:text-primary-900"
                                        )
                                    }
                                >
                                    My Bookings
                                </NavLink>
                            )}
                            <div className="pt-2 border-t border-gray-100">
                                {user ? (
                                    <div className="space-y-2">
                                        <p className="text-sm text-gray-600 px-2">Hi, {user.name}</p>
                                        <Button className="w-full" variant="outline" onClick={handleSignOut}>
                                            Sign Out
                                        </Button>
                                    </div>
                                ) : (
                                    <Link to="/signin" className="w-full">
                                        <Button className="w-full">Sign In</Button>
                                    </Link>
                                )}
                            </div>
                        </nav>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
}
