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
                "fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-in-out",
                scrolled ? "pt-2" : "pt-4"
            )}
        >
            <div
                className={cn(
                    "container mx-auto px-4 transition-all duration-500",
                    scrolled ? "max-w-6xl" : "max-w-7xl"
                )}
            >
                <div className={cn(
                    "flex items-center justify-between px-6 py-3 transition-all duration-500 ease-in-out",
                    "bg-white/70 backdrop-blur-xl border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.08)] rounded-2xl",
                    scrolled ? "py-2.5 shadow-[0_4px_20px_rgba(0,0,0,0.06)]" : "py-4"
                )}>
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2.5 group">
                        <div className="relative">
                            <Hotel className="h-8 w-8 text-secondary group-hover:scale-110 transition-transform duration-300" />
                            <div className="absolute -inset-1 bg-secondary/20 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </div>
                        <span className="text-2xl font-serif font-bold tracking-tight text-primary-900 bg-clip-text">
                            Aman Hotel
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center gap-1">
                        {navLinks.map((link) => (
                            <NavLink
                                key={link.path}
                                to={link.path}
                                className={({ isActive }) =>
                                    cn(
                                        "px-4 py-2 text-sm font-medium rounded-xl transition-all duration-300 relative group",
                                        isActive
                                            ? "text-secondary font-semibold"
                                            : "text-primary-700 hover:text-secondary hover:bg-secondary/5"
                                    )
                                }
                            >
                                {link.name}
                                <span className={cn(
                                    "absolute bottom-1 left-4 right-4 h-0.5 bg-secondary rounded-full transition-all duration-300 transform origin-left",
                                    location.pathname === link.path ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                                )} />
                            </NavLink>
                        ))}

                        {user && (
                            <NavLink
                                to="/my-bookings"
                                className={({ isActive }) =>
                                    cn(
                                        "px-4 py-2 text-sm font-medium rounded-xl transition-all duration-300 relative group",
                                        isActive
                                            ? "text-secondary font-semibold"
                                            : "text-primary-700 hover:text-secondary hover:bg-secondary/5"
                                    )
                                }
                            >
                                My Bookings
                                <span className={cn(
                                    "absolute bottom-1 left-4 right-4 h-0.5 bg-secondary rounded-full transition-all duration-300 transform origin-left",
                                    location.pathname === "/my-bookings" ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                                )} />
                            </NavLink>
                        )}

                        <div className="ml-4 h-6 w-[1px] bg-gray-200/50" />

                        <div className="ml-4 flex items-center gap-4">
                            {user ? (
                                <div className="flex items-center gap-4">
                                    <div className="flex flex-col items-end">
                                        <span className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">Welcome</span>
                                        <span className="text-sm font-semibold text-primary-900">{user.name}</span>
                                    </div>
                                    <button
                                        onClick={handleSignOut}
                                        className="p-2 text-primary-600 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all duration-300"
                                        title="Sign Out"
                                    >
                                        <X className="h-5 w-5" />
                                    </button>
                                </div>
                            ) : (
                                <Link to="/signin">
                                    <Button variant="primary" size="sm" className="rounded-xl px-6 shadow-lg shadow-primary-900/10 hover:shadow-primary-900/20 active:scale-95 transition-all">
                                        Sign In
                                    </Button>
                                </Link>
                            )}
                        </div>
                    </nav>

                    {/* Mobile Menu Button */}
                    <button
                        className="md:hidden text-primary-900 p-2 hover:bg-gray-100 rounded-xl transition-colors"
                        onClick={() => setIsOpen(!isOpen)}
                        aria-label="Toggle menu"
                    >
                        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                    </button>
                </div>
            </div>

            {/* Mobile Navigation Dropdown */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="md:hidden container mx-auto px-4 mt-2"
                    >
                        <div className="bg-white/90 backdrop-blur-xl border border-white/20 shadow-xl rounded-2xl overflow-hidden">
                            <nav className="flex flex-col p-3 gap-1">
                                {navLinks.map((link) => (
                                    <NavLink
                                        key={link.path}
                                        to={link.path}
                                        className={({ isActive }) =>
                                            cn(
                                                "text-base font-medium py-3 px-4 rounded-xl transition-all",
                                                isActive
                                                    ? "bg-secondary/10 text-secondary"
                                                    : "text-gray-600 hover:bg-gray-50 hover:text-secondary"
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
                                                "text-base font-medium py-3 px-4 rounded-xl transition-all",
                                                isActive
                                                    ? "bg-secondary/10 text-secondary"
                                                    : "text-gray-600 hover:bg-gray-50 hover:text-secondary"
                                            )
                                        }
                                    >
                                        My Bookings
                                    </NavLink>
                                )}
                                <div className="mt-2 pt-2 border-t border-gray-100">
                                    {user ? (
                                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">Logged in as</span>
                                                <span className="text-sm font-semibold text-primary-900">{user.name}</span>
                                            </div>
                                            <Button variant="outline" size="sm" onClick={handleSignOut} className="rounded-lg text-red-500 border-red-100 hover:bg-red-50">
                                                Sign Out
                                            </Button>
                                        </div>
                                    ) : (
                                        <Link to="/signin" className="w-full">
                                            <Button className="w-full py-4 rounded-xl shadow-lg shadow-primary-900/10">Sign In</Button>
                                        </Link>
                                    )}
                                </div>
                            </nav>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
}
