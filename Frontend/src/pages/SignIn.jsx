import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/Signin.css";
import { authService } from "../services/api";

export default function SignIn() {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        try {
            const data = await authService.login(email, password);
            if (data.user) {
                // Success
                localStorage.setItem("user", JSON.stringify(data.user));

                // Check if there's a saved redirect URL
                const redirectUrl = localStorage.getItem('redirectAfterLogin');

                if (redirectUrl) {
                    // Clear the saved URL and redirect to it
                    localStorage.removeItem('redirectAfterLogin');
                    navigate(redirectUrl);
                } else {
                    // Default redirect based on role
                    if (data.user.role === 'admin') {
                        navigate('/admin');
                    } else {
                        navigate('/');
                    }
                }
            } else {
                setError(data.message || "Login failed");
            }
        } catch (err) {
            console.error(err);
            setError("Server error. Please try again.");
        }
    };

    return (
        <div className="signin-container">
            <h2>Sign In</h2>
            {error && <p className="error-message" style={{ color: 'red' }}>{error}</p>}

            <form className="signin-form" onSubmit={handleSubmit}>
                <input
                    type="email"
                    placeholder="Email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <input
                    type="password"
                    placeholder="Password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <button className="bg-blue-900 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded" type="submit">Sign In</button>
            </form>

            <p>
                Don’t have an account?{" "}
                <Link to="/register">Create Account</Link>
            </p>
        </div>
    );
}

