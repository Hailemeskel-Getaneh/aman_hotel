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
<<<<<<< HEAD
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
=======
        <div className="flex flex-col items-center justify-center min-h-[60vh] mt-20 px-4">
            <div className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-md w-full border border-gray-100">
                <div className="text-red-500 text-6xl mb-4">🚫</div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Payment Cancelled</h2>
                <p className="text-gray-600 mb-8">
                    You cancelled the payment process. No charges were made.
                    You can retry payment from your bookings page.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button
                        className="bg-primary-900 text-white px-6 py-3 rounded-xl hover:bg-primary-800 transition-colors font-medium"
                        onClick={() => navigate('/my-bookings')}
                    >
                        Go to My Bookings
                    </button>
                    <button
                        className="bg-gray-100 text-gray-700 px-6 py-3 rounded-xl hover:bg-gray-200 transition-colors font-medium border border-gray-200"
                        onClick={() => navigate('/')}
                    >
                        Return Home
                    </button>
                </div>
>>>>>>> feature/hailemeskel
            </div>
        </div>
    );
};

export default PaymentFailed;
