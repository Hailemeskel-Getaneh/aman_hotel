import React, { useState } from "react";
import Section from "../components/ui/Section";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Textarea from "../components/ui/Textarea";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Send } from "lucide-react";
import { contactService } from "../services/api";

export default function Contact() {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        subject: "", // Added subject
        message: "",
    });

    const [status, setStatus] = useState(""); // success/error message

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus("Sending...");

        try {
            const data = await contactService.sendMessage(formData);
            if (data.message === "Message Sent") {
                setStatus("Your message has been sent successfully!");
                setFormData({ name: "", email: "", phone: "", subject: "", message: "" });
            } else {
                setStatus("Failed to send message: " + data.message);
            }
        } catch (err) {
            console.error(err);
            setStatus("Server error. Please try again later.");
        }
    };

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
                        Contact Us
                    </motion.h1>
                    <p className="text-secondary text-lg font-medium">We'd love to hear from you</p>
                </div>
            </div>

            <Section>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Contact Info */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="space-y-8"
                    >
                        <h2 className="text-3xl font-serif font-bold text-primary-900">Get in Touch</h2>
                        <p className="text-gray-600 leading-relaxed">
                            Have questions about our rooms, services, or events? Reach out to us and our team will get back to you shortly.
                        </p>

                        <div className="space-y-6">
                            <div className="flex items-start gap-4">
                                <div className="bg-primary-50 p-3 rounded-full">
                                    <MapPin className="h-6 w-6 text-primary-900" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-primary-900">Visit Us</h3>
                                    <p className="text-gray-600">123 Luxury Street, Debre Berhan, Ethiopia</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="bg-primary-50 p-3 rounded-full">
                                    <Phone className="h-6 w-6 text-primary-900" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-primary-900">Call Us</h3>
                                    <p className="text-gray-600">+251 912 345 678</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="bg-primary-50 p-3 rounded-full">
                                    <Mail className="h-6 w-6 text-primary-900" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-primary-900">Email Us</h3>
                                    <p className="text-gray-600">info@amanhotel.com</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Contact Form */}
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="bg-white p-8 rounded-xl shadow-lg border border-gray-100"
                    >
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {status && <p className={`text-center ${status.includes("Success") ? "text-green-600" : "text-blue-600"}`}>{status}</p>}

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Full Name</label>
                                <Input
                                    type="text"
                                    name="name"
                                    placeholder="John Doe"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Email Address</label>
                                <Input
                                    type="email"
                                    name="email"
                                    placeholder="john@example.com"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Phone Number (Optional)</label>
                                <Input
                                    type="text"
                                    name="phone"
                                    placeholder="+251 ..."
                                    value={formData.phone}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Subject</label>
                                <Input
                                    type="text"
                                    name="subject"
                                    placeholder="Inquiry about..."
                                    value={formData.subject}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Message</label>
                                <Textarea
                                    name="message"
                                    placeholder="How can we help you?"
                                    value={formData.message}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <Button type="submit" className="w-full h-12 text-lg">
                                <Send className="mr-2 h-4 w-4" /> Send Message
                            </Button>
                        </form>
                    </motion.div>
                </div>
            </Section>
        </main>
    );
}

