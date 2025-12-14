import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { bookingService } from '../services/api';

const Receipt = () => {
    const { bookingId } = useParams();
    const navigate = useNavigate();
    const [receipt, setReceipt] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchReceipt = async () => {
            try {
                const data = await bookingService.getReceipt(bookingId);
                if (data && data.id) {
                    setReceipt(data);
                } else {
                    setError('Receipt not found.');
                }
            } catch (err) {
                console.error("Error fetching receipt:", err);
                setError('Failed to load receipt.');
            } finally {
                setLoading(false);
            }
        };

        if (bookingId) {
            fetchReceipt();
        }
    }, [bookingId]);

    const handlePrint = () => {
        window.print();
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="text-xl font-semibold text-gray-600 animate-pulse">
                    Loading Receipt...
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-[calc(100vh-80px)] mt-20">
                <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md w-full">
                    <div className="text-red-500 text-6xl mb-4">❌</div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Error</h2>
                    <p className="text-gray-600 mb-6">{error}</p>
                    <button
                        className="bg-gray-200 text-gray-800 px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                        onClick={() => navigate('/my-bookings')}
                    >
                        Back to My Bookings
                    </button>
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

                {/* Receipt Body */}
                <div className="p-8 space-y-8">
                    {/* Transaction Details */}
                    <div className="flex justify-between items-start border-b border-gray-100 pb-8">
                        <div>
                            <p className="text-gray-500 text-sm mb-1">Receipt ID</p>
                            <p className="font-mono text-gray-800 font-medium">#{receipt.id}</p>
                            {/* Assuming tx_ref might not always be saved in DB historically, but ideally it is. 
                                use receipt.id as fallback reference if tx_ref is missing in old records 
                            */}
                            {/* Optional: if (receipt.transaction_ref) ... */}
                        </div>
                        <div className="text-right">
                            <p className="text-gray-500 text-sm mb-1">Date Issued</p>
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
                                {receipt.user_name || 'Guest'}
                            </p>
                            <p className="text-gray-500 text-sm">{receipt.user_email}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-gray-500 text-sm mb-1">Room Number</p>
                            <p className="text-2xl font-bold text-gray-900">
                                #{receipt.room_number || 'N/A'}
                            </p>
                            <p className="text-gray-600 text-sm font-medium">
                                {receipt.room_type || 'Standard Room'}
                            </p>
                        </div>
                    </div>

                    {/* Stay Details */}
                    <div className="bg-gray-50 p-6 rounded-lg border border-gray-100 print:border-gray-200">
                        <div className="flex justify-between items-center mb-4">
                            <div>
                                <p className="text-gray-500 text-xs uppercase tracking-wide">Check-In</p>
                                <p className="text-gray-900 font-medium">
                                    {receipt.check_in ? new Date(receipt.check_in).toDateString() : '-'}
                                </p>
                            </div>
                            <div className="text-gray-300">→</div>
                            <div className="text-right">
                                <p className="text-gray-500 text-xs uppercase tracking-wide">Check-Out</p>
                                <p className="text-gray-900 font-medium">
                                    {receipt.check_out ? new Date(receipt.check_out).toDateString() : '-'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Total */}
                    <div className="flex justify-between items-center pt-4 border-t-2 border-gray-900">
                        <p className="text-xl font-bold text-gray-800">Total Paid</p>
                        <p className="text-3xl font-bold text-gray-900">
                            {Number(receipt.final_price).toLocaleString()} <span className="text-lg text-gray-500 font-normal">ETB</span>
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
                    <span>Back to My Bookings</span>
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

export default Receipt;
