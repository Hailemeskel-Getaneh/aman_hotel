import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Booking.css';

const PaymentFailed = () => {
    const navigate = useNavigate();

    return (
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
            </div>
        </div>
    );
};

export default PaymentFailed;
