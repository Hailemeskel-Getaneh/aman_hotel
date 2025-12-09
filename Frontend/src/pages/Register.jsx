import React, { useState } from "react";
import "../styles/Register.css";
import { useNavigate } from "react-router-dom";
import { authService } from "../services/api";

export default function Register() {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        fullname: "",
        email: "",
        phone: "",
        password: "", // Added password field
        // These fields are not in the current DB schema but kept for UI
        nationality: "",
        gender: "",
        address: "",
        idType: "",
        idNumber: "",
    });

    const [error, setError] = useState("");

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        try {
            // Map frontend fields to backend expected fields
            const userData = {
                name: form.fullname,
                email: form.email,
                phone: form.phone,
                password: form.password
            };

            const data = await authService.register(userData);

            if (data.message === "User Created") {
                alert("Registration Successful! Please login.");
                navigate("/signin");
            } else {
                setError(data.message || "Registration failed");
            }

        } catch (err) {
            console.error(err);
            setError("Server error. Please try again.");
        }
    };

    return (
        <div className="register-container">
            <h2>Create Account / Guest Registration</h2>
            {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}

            <form className="register-form" onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Full Name</label>
                    <input
                        type="text"
                        name="fullname"
                        required
                        value={form.fullname}
                        onChange={handleChange}
                        placeholder="Enter your full name"
                    />
                </div>

                <div className="form-group">
                    <label>Email Address</label>
                    <input
                        type="email"
                        name="email"
                        required
                        value={form.email}
                        onChange={handleChange}
                        placeholder="you@example.com"
                    />
                </div>

                <div className="form-group">
                    <label>Password</label>
                    <input
                        type="password"
                        name="password"
                        required
                        value={form.password}
                        onChange={handleChange}
                        placeholder="Create a strong password"
                    />
                </div>

                <div className="form-group">
                    <label>Phone Number</label>
                    <input
                        type="tel"
                        name="phone"
                        required
                        value={form.phone}
                        onChange={handleChange}
                        placeholder="+251 900 000 000"
                    />
                </div>

                {/* Additional fields kept for UI, though not saved to DB currently */}
                <div className="form-group">
                    <label>Nationality</label>
                    <input
                        type="text"
                        name="nationality"
                        value={form.nationality}
                        onChange={handleChange}
                        placeholder="e.g. Ethiopian"
                    />
                </div>

                <div className="form-group">
                    <label>Gender</label>
                    <select
                        name="gender"
                        value={form.gender}
                        onChange={handleChange}
                    >
                        <option value="">Select gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                    </select>
                </div>

                <div className="form-group">
                    <label>Address</label>
                    <input
                        type="text"
                        name="address"
                        value={form.address}
                        onChange={handleChange}
                        placeholder="City, Country"
                    />
                </div>

                <div className="form-group">
                    <label>ID Type</label>
                    <select
                        name="idType"
                        value={form.idType}
                        onChange={handleChange}
                    >
                        <option value="">Select ID Type</option>
                        <option value="passport">Passport</option>
                        <option value="national">National ID</option>
                        <option value="driver">Driver License</option>
                    </select>
                </div>

                <div className="form-group">
                    <label>ID Number</label>
                    <input
                        type="text"
                        name="idNumber"
                        value={form.idNumber}
                        onChange={handleChange}
                        placeholder="Enter ID number"
                    />
                </div>

                <button type="submit" className="register-btn">
                    Register
                </button>
            </form>
        </div>
    );
}

