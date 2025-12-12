import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { paymentService } from '../services/api';
import '../styles/Booking.css'; // Reusing booking styles for consistency

const PaymentSuccess = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState('verifying'); // verifying, success, error
    const [message, setMessage] = useState('Verifying your payment...');
    const [receipt, setReceipt] = useState(null);

    useEffect(() => {
        const verifyPayment = async () => {
            const txRef = searchParams.get('tx_ref');

            if (!txRef) {
                setStatus('error');
                setMessage('No transaction reference found.');
                return;
            }

            try {
                const response = await paymentService.verify(txRef);
                if (response.message === 'Payment Verified and Booking Confirmed') {
                    setStatus('success');
                    setMessage('Payment successful! Your booking is confirmed.');
                    setReceipt(response.receipt);
                } else {
                    setStatus('error');
                    setMessage(response.message || 'Payment verification failed.');
                }
            } catch (error) {
                console.error("Verification error", error);
                setStatus('error');
                setMessage('An error occurred while verifying payment.');
            }
        };

        verifyPayment();
    }, [searchParams]);

    const handlePrint = () => {
        window.print();
    };

    if (status === 'verifying') {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="text-xl font-semibold text-gray-600 animate-pulse">
                    ⏳ Verifying Payment...
                </div>
            </div>
        );
    }

    if (status === 'error') {
        return (
            <div className="flex flex-col items-center justify-center h-[calc(100vh-80px)] mt-20">
                <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md w-full">
                    <div className="text-red-500 text-6xl mb-4">❌</div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Payment Failed</h2>
                    <p className="text-gray-600 mb-6">{message}</p>
                    <div className="flex gap-4 justify-center">
                        <button
                            className="bg-gray-200 text-gray-800 px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                            onClick={() => navigate('/')}
                        >
                            Go Home
                        </button>
                        <button
                            className="bg-gray-800 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                            onClick={() => navigate('/contact')}
                        >
                            Support
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 mt-16 print:mt-0 print:p-0 print:bg-white">
            <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-2xl overflow-hidden print:shadow-none print:max-w-none">
                {/* Receipt Header */}
                <div className="bg-gray-900 text-white p-8 text-center print:bg-gray-900 print:text-white print-color-adjust-exact">
                    <h1 className="text-3xl font-serif font-bold tracking-widest uppercase mb-2">Aman Hotel</h1>
                    <p className="text-gray-400 text-sm tracking-wide">OFFICIAL RECEIPT</p>
                </div>

                {/* Success Banner (Screen Only) */}
                <div className="bg-green-50 border-b border-green-100 p-4 text-center print:hidden">
                    <p className="text-green-800 font-medium flex items-center justify-center gap-2">
                        ✅ Payment Verified & Booking Confirmed
                    </p>
                </div>

                {/* Receipt Body */}
                <div className="p-8 space-y-8">
                    {/* Transaction Details */}
                    <div className="flex justify-between items-start border-b border-gray-100 pb-8">
                        <div>
                            <p className="text-gray-500 text-sm mb-1">Transaction Ref</p>
                            <p className="font-mono text-gray-800 font-medium">{searchParams.get('tx_ref')}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-gray-500 text-sm mb-1">Date</p>
                            <p className="text-gray-800 font-medium">
                                {new Date().toLocaleDateString('en-US', {
                                    year: 'numeric', month: 'long', day: 'numeric'
                                })}
                            </p>
                        </div>
                    </div>

                    {/* Booking Details Grid */}
                    <div className="grid grid-cols-2 gap-8">
                        <div>
                            <p className="text-gray-500 text-sm mb-1">Guest Name</p>
                            <p className="text-lg font-semibold text-gray-900">
                                {receipt?.user_name || 'Guest'}
                            </p>
                            <p className="text-gray-500 text-sm">{receipt?.user_email}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-gray-500 text-sm mb-1">Room Number</p>
                            <p className="text-2xl font-bold text-gray-900">
                                #{receipt?.room_number || 'N/A'}
                            </p>
                            <p className="text-gray-600 text-sm font-medium">
                                {receipt?.room_type || 'Standard Room'}
                            </p>
                        </div>
                    </div>

                    {/* Stay Details */}
                    <div className="bg-gray-50 p-6 rounded-lg border border-gray-100 print:border-gray-200">
                        <div className="flex justify-between items-center mb-4">
                            <div>
                                <p className="text-gray-500 text-xs uppercase tracking-wide">Check-In</p>
                                <p className="text-gray-900 font-medium">
                                    {receipt?.check_in ? new Date(receipt.check_in).toDateString() : '-'}
                                </p>
                            </div>
                            <div className="text-gray-300">→</div>
                            <div className="text-right">
                                <p className="text-gray-500 text-xs uppercase tracking-wide">Check-Out</p>
                                <p className="text-gray-900 font-medium">
                                    {receipt?.check_out ? new Date(receipt.check_out).toDateString() : '-'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Total */}
                    <div className="flex justify-between items-center pt-4 border-t-2 border-gray-900">
                        <p className="text-xl font-bold text-gray-800">Total Paid</p>
                        <p className="text-3xl font-bold text-gray-900">
                            {Number(receipt?.final_price).toLocaleString()} <span className="text-lg text-gray-500 font-normal">ETB</span>
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className="bg-gray-50 p-8 text-center text-sm text-gray-500 print:mt-12">
                    <p className="font-medium text-gray-900 mb-2">Thank you for staying with Aman Hotel</p>
                    <p>contact@amanhotel.com | +251 912 345 678</p>
                    <p className="mt-4 text-xs text-gray-400">This is a computer-generated receipt.</p>
                </div>
            </div>

            {/* Action Buttons (Screen Only) */}
            <div className="max-w-3xl mx-auto mt-8 flex flex-col sm:flex-row gap-4 justify-center print:hidden">
                <button
                    onClick={handlePrint}
                    className="flex items-center justify-center gap-2 bg-gray-900 text-white px-8 py-3 rounded-xl hover:bg-gray-800 transition-all shadow-lg hover:shadow-xl"
                >
                    <span>🖨️ Download / Print Receipt</span>
                </button>
                <button
                    onClick={() => navigate('/my-bookings')}
                    className="flex items-center justify-center gap-2 bg-white text-gray-900 border-2 border-gray-200 px-8 py-3 rounded-xl hover:bg-gray-50 transition-all"
                >
                    <span>View My Bookings</span>
                </button>
            </div>

            {/* Print Styles */}
            <style>{`
                @media print {
                    @page { margin: 0; }
                    body { margin: 0; padding: 0; background: white; }
                    .print\\:hidden { display: none !important; }
                    .print\\:shadow-none { shadow: none !important; box-shadow: none !important; }
                    .print\\:mt-0 { margin-top: 0 !important; }
                    .print\\:bg-white { background: white !important; }
                    .print\\:text-white { color: white !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                    .print\\:bg-gray-900 { background-color: #111827 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                }
            `}</style>
        </div>
    );
};

export default PaymentSuccess;
