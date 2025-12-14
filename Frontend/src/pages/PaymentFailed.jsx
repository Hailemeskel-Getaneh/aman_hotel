import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { bookingService } from '../services/api';
import '../styles/Booking.css';

const PaymentFailed = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const bookingId = searchParams.get('booking_id');
    const [status, setStatus] = useState('Processing...');

    useEffect(() => {
        const cancelBooking = async () => {
            if (bookingId) {
                try {
                    setStatus('Cancelling reservation to free up room...');
                    await bookingService.cancel(bookingId);
                    setStatus('Reservation cancelled successfully.');
                } catch (error) {
                    console.error("Failed to auto-cancel:", error);
                    setStatus('Could not cancel reservation automatically. Please check My Bookings.');
                }
            } else {
                setStatus('');
            }
        };

        cancelBooking();
    }, [bookingId]);

    return (
        <div className="booking-container" style={{ textAlign: 'center', marginTop: '50px' }}>
            <h2 style={{ color: 'red' }}>❌ Payment Cancelled/Failed</h2>
            <p>The payment process was not completed.</p>

            {bookingId && (
                <p style={{ color: '#666', margin: '1rem 0', fontStyle: 'italic' }}>
                    {status}
                </p>
            )}

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '2rem' }}>
                <button className="book-btn" onClick={() => navigate('/my-bookings')}>
                    My Bookings
                </button>
                <button className="book-btn" style={{ backgroundColor: '#666' }} onClick={() => navigate('/')}>
                    Back to Home
                </button>
            </div>
        </div>
    );
};

export default PaymentFailed;
