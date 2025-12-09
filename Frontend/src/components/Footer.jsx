import React from "react";
import { Link } from "react-router-dom";
import { Facebook, Instagram, Twitter, Linkedin, Hotel } from "lucide-react";
import { cn } from "../lib/utils";

export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-primary-900 text-white pt-16 pb-8">
            <div className="container mx-auto px-4 md:px-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">

                    {/* Brand & Contact */}
                    <div>
                        <div className="flex items-center gap-2 mb-6">
                            <Hotel className="h-8 w-8 text-secondary" />
                            <span className="text-2xl font-serif font-bold">Aman Hotel</span>
                        </div>
                        <div className="space-y-4 text-gray-300">
                            <p>123 Luxury Street,<br />Debre Berhan, Ethiopia</p>
                            <p className="hover:text-secondary transition-colors">
                                <a href="tel:+251912345678">+251 912 345 678</a>
                            </p>
                            <p className="hover:text-secondary transition-colors">
                                <a href="mailto:info@amanhotel.com">info@amanhotel.com</a>
                            </p>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-xl font-serif font-bold mb-6 text-secondary">Quick Links</h3>
                        <ul className="space-y-3">
                            {[
                                { name: "Home", path: "/" },
                                { name: "Rooms", path: "/rooms" },
                                { name: "Events", path: "/events" },
                                { name: "About Us", path: "/about" },
                                { name: "Contact", path: "/contact" },
                            ].map((link) => (
                                <li key={link.path}>
                                    <Link
                                        to={link.path}
                                        className="text-gray-300 hover:text-secondary transition-colors inline-block"
                                    >
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Social Media */}
                    <div>
                        <h3 className="text-xl font-serif font-bold mb-6 text-secondary">Follow Us</h3>
                        <p className="text-gray-300 mb-6">Stay connected with us for updates and exclusive offers.</p>
                        <div className="flex gap-4">
                            {[
                                { icon: Facebook, href: "https://facebook.com" },
                                { icon: Instagram, href: "https://instagram.com" },
                                { icon: Twitter, href: "https://twitter.com" },
                                { icon: Linkedin, href: "https://linkedin.com" },
                            ].map((social, idx) => (
                                <a
                                    key={idx}
                                    href={social.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="bg-primary-800 p-3 rounded-full hover:bg-secondary hover:text-primary-900 transition-all duration-300"
                                >
                                    <social.icon className="h-5 w-5" />
                                </a>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="border-t border-primary-800 pt-8 text-center text-gray-400 text-sm">
                    <p>© {currentYear} Aman Hotel. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
}
