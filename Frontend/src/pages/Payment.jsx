import React, { useState } from "react";
import "../styles/Payment.css";
import { useNavigate } from "react-router-dom";

export default function PaymentPage() {
    const navigate = useNavigate();

    const [payment, setPayment] = useState({
        cardName: "",
        cardNumber: "",
        expiry: "",
        cvv: "",
        paymentMethod: "card",
    });

    const handleChange = (e) => {
        setPayment({ ...payment, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Here you can send payment data to your backend
        // If successful → redirect to booking confirmation

        navigate("/confirmation"); // redirect to confirmation page
    };

    return (
        <div className="payment-container">
            <h2>Payment Information</h2>

            <form className="payment-form" onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Cardholder Name</label>
                    <input
                        type="text"
                        name="cardName"
                        placeholder="Name on card"
                        required
                        value={payment.cardName}
                        onChange={handleChange}
                    />
                </div>

                <div className="form-group">
                    <label>Card Number</label>
                    <input
                        type="text"
                        name="cardNumber"
                        placeholder="1234 5678 9012 3456"
                        required
                        maxLength="16"
                        value={payment.cardNumber}
                        onChange={handleChange}
                    />
                </div>

                <div className="form-group">
                    <label>Expiry Date</label>
                    <input
                        type="month"
                        name="expiry"
                        required
                        value={payment.expiry}
                        onChange={handleChange}
                    />
                </div>

                <div className="form-group">
                    <label>CVV</label>
                    <input
                        type="password"
                        name="cvv"
                        placeholder="123"
                        required
                        maxLength="4"
                        value={payment.cvv}
                        onChange={handleChange}
                    />
                </div>

                <div className="form-group">
                    <label>Payment Method</label>
                    <select
                        name="paymentMethod"
                        value={payment.paymentMethod}
                        onChange={handleChange}
                    >
                        <option value="card">Credit/Debit Card</option>
                        <option value="mobile">Mobile Payment</option>
                        <option value="cash">Pay at Hotel</option>
                    </select>
                </div>

                <button type="submit" className="pay-btn">
                    Pay & Confirm Booking
                </button>
            </form>
        </div>
    );
}
