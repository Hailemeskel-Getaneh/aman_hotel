import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Booking.css';

const PaymentFailed = () => {
    const navigate = useNavigate();

    return (
        <div className="booking-container" style={{ textAlign: 'center', marginTop: '50px' }}>
            <h2 style={{ color: 'red' }}>❌ Payment Failed</h2>
            <p>We were unable to process your payment. Please try again.</p>

            <button className="book-btn" onClick={() => navigate('/')}>
                Back to Home
            </button>
        </div>
    );
};

export default PaymentFailed;
