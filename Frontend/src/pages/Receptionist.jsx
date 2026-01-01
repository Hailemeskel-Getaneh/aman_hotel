import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Admin.css';
import { roomService, roomTypeService, bookingService, contactService, eventService, authService, adminService } from '../services/api';
import {
    Hotel, BookOpen, Calendar, LogOut,
    Users, Edit, Trash2, Plus, Check, X, UserPlus
} from 'lucide-react';

export default function Receptionist() {
    const [activeTab, setActiveTab] = useState('bookings');
    const [authorized, setAuthorized] = useState(false);
    const [pendingBookingsCount, setPendingBookingsCount] = useState(0);
    const navigate = useNavigate();

    const [userRole, setUserRole] = useState('receptionist');

    useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (!userStr) {
            navigate('/signin');
            return;
        }

        try {
            const user = JSON.parse(userStr);
            if (user.role !== 'receptionist' && user.role !== 'admin') {
                alert("Access Denied: Receptionist Only");
                navigate('/');
            } else {
                setUserRole(user.role);
                setAuthorized(true);
            }

        } catch (e) {
            navigate('/signin');
        }
    }, [navigate]);

    // Fetch pending bookings count
    useEffect(() => {
        const fetchPendingCount = async () => {
            try {
                const roomData = await bookingService.getAll();
                const roomPendingCount = roomData.data ? roomData.data.filter(b => b.status === 'pending').length : 0;

                const eventData = await eventService.getAllForAdmin();
                const eventPendingCount = eventData.data ? eventData.data.filter(b => b.status === 'pending').length : 0;

                setPendingBookingsCount(roomPendingCount + eventPendingCount);
            } catch (err) {
                console.error('Error fetching bookings:', err);
            }
        };

        if (authorized) {
            fetchPendingCount();
            const interval = setInterval(fetchPendingCount, 30000);
            return () => clearInterval(interval);
        }
    }, [authorized]);

    if (!authorized) return null;

    const handleLogout = () => {
        localStorage.removeItem('user');
        navigate('/signin');
    };

    return (
        <div className="admin-container">
            {/* Sidebar */}
            <aside className="admin-sidebar" style={{ backgroundColor: '#2c5282' }}>
                <div className="sidebar-brand">
                    <Hotel size={24} />
                    <h2>Reception Desk</h2>
                </div>
                <ul className="sidebar-menu">
                    <li className={activeTab === 'bookings' ? 'active' : ''} onClick={() => setActiveTab('bookings')}>
                        <BookOpen size={20} />
                        <span>Bookings</span>
                        {pendingBookingsCount > 0 && (
                            <span className="notification-badge">{pendingBookingsCount}</span>
                        )}
                    </li>
                    <li className={activeTab === 'rooms' ? 'active' : ''} onClick={() => setActiveTab('rooms')}>
                        <Hotel size={20} />
                        <span>Rooms</span>
                    </li>
                    <li className={activeTab === 'events' ? 'active' : ''} onClick={() => setActiveTab('events')}>
                        <Calendar size={20} />
                        <span>Events</span>
                    </li>
                </ul>
            </aside>

            {/* Main Content */}
            <main className="admin-content">
                <header className="admin-header">
                    <h1 className="admin-title">
                        {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
                    </h1>
                    <div className="flex gap-4 items-center">
                        <span className="text-sm font-semibold text-gray-600">Receptionist View</span>
                        <button className="logout-btn" onClick={handleLogout}>
                            <LogOut size={18} />
                            Logout
                        </button>
                    </div>
                </header>

                <div className="content-body">
                    {activeTab === 'rooms' && <AdminRooms userRole="receptionist" />}
                    {activeTab === 'bookings' && <AdminBookings userRole="receptionist" />}
                    {activeTab === 'events' && <AdminEvents userRole="receptionist" />}
                </div>
            </main>
        </div>
    );
}

// Reuse Admin Components (Cleaned up for Receptionist Context if needed, but reusing logic is fine)

// 2. Manage Rooms
function AdminRooms({ userRole }) {
    const [rooms, setRooms] = useState([]);
    const [roomTypes, setRoomTypes] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [filterType, setFilterType] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        room_id: null, room_number: '', room_type_id: '', status: 'available'
    });

    const [showBookingModal, setShowBookingModal] = useState(false);
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [userSearch, setUserSearch] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [bookingFormData, setBookingFormData] = useState({ check_in: '', check_out: '' });
    const [showRegistration, setShowRegistration] = useState(false);
    const [newGuest, setNewGuest] = useState({ name: '', email: '', phone: '', password: 'password123' });

    useEffect(() => {
        loadRooms();
        loadRoomTypes();
    }, []);

    const handleRegisterGuest = async () => {
        try {
            const res = await authService.register(newGuest);
            if (res.message === 'User Created') {
                const searchRes = await authService.searchUsers(newGuest.email);
                if (searchRes.data && searchRes.data.length > 0) {
                    setSelectedUser(searchRes.data[0]);
                    setUserSearch(newGuest.email);
                    alert('Guest registered and selected!');
                    setShowRegistration(false);
                    setNewGuest({ name: '', email: '', phone: '', password: 'password123' });
                } else {
                    setSelectedUser({ id: null, name: newGuest.name, email: newGuest.email });
                    setUserSearch(newGuest.email);
                    alert('Guest registered! Note: Could not auto-find user, please lookup again.');
                    setShowRegistration(false);
                    setNewGuest({ name: '', email: '', phone: '', password: 'password123' });
                }
            } else {
                alert(res.message || 'Registration failed');
            }
        } catch (e) {
            console.error(e);
            alert('Error creating guest account');
        }
    };

    const loadRooms = async () => {
        try {
            const data = await roomService.getAll();
            if (data.data) setRooms(data.data);
        } catch (err) { console.error(err); }
    };

    const loadRoomTypes = async () => {
        try {
            const data = await roomTypeService.getAll();
            if (data.data) setRoomTypes(data.data);
        } catch (err) { console.error(err); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this room?")) return;
        await roomService.delete(id);
        loadRooms();
    };

    const handleEdit = (room) => {
        setFormData(room);
        setIsEditing(true);
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isEditing) {
            await roomService.update(formData);
        } else {
            await roomService.create(formData);
        }
        setShowModal(false);
        loadRooms();
    };

    const handleClearFilters = () => {
        setFilterType('');
        setFilterStatus('');
    };

    const handleCreateManualBooking = (room) => {
        setSelectedRoom(room);
        setBookingFormData({
            user_id: '',
            check_in: '',
            check_out: '',
        });
        setUserSearch('');
        setSearchResults([]);
        setSelectedUser(null);
        setShowBookingModal(true);
    };

    const handleUserSearch = async (searchTerm) => {
        setUserSearch(searchTerm);
        if (searchTerm.length >= 2) {
            try {
                const data = await authService.searchUsers(searchTerm);
                if (data.data) {
                    setSearchResults(data.data);
                } else {
                    setSearchResults([]);
                }
            } catch (err) {
                console.error('Error searching users:', err);
                setSearchResults([]);
            }
        } else {
            setSearchResults([]);
        }
    };

    const handleSelectUser = (user) => {
        setSelectedUser(user);
        setBookingFormData({ ...bookingFormData, user_id: user.id });
        setUserSearch(user.name + ' (' + user.email + ')');
        setSearchResults([]);
    };

    const handleBookingSubmit = async (e) => {
        e.preventDefault();
        if (!selectedUser) {
            alert('Please select a user for this booking');
            return;
        }
        try {
            const bookingData = {
                user_id: selectedUser.id,
                room_id: selectedRoom.room_id,
                check_in: bookingFormData.check_in,
                check_out: bookingFormData.check_out,
                is_manual: true
            };
            const result = await bookingService.create(bookingData);
            if (result.message === 'Booking Created') {
                if (result.booking_id) {
                    await bookingService.updateStatus(result.booking_id, 'confirmed');
                }
                alert(`Manual booking created and confirmed for ${selectedUser.name}!`);
                setShowBookingModal(false);
                setSelectedUser(null);
                setUserSearch('');
                loadRooms();
            } else {
                alert('Booking failed: ' + (result.message || 'Unknown error'));
            }
        } catch (err) {
            console.error(err);
            alert('Error creating booking');
        }
    };

    const filteredRooms = rooms.filter(room => {
        const typeMatch = !filterType || room.room_type_id == filterType;
        const statusMatch = !filterStatus || room.status === filterStatus;
        return typeMatch && statusMatch;
    });

    return (
        <div>
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <label style={{ fontWeight: '500' }}>Filter by Type:</label>
                    <select value={filterType} onChange={(e) => setFilterType(e.target.value)} style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd' }}>
                        <option value="">All Types</option>
                        {roomTypes.map(type => (
                            <option key={type.type_id} value={type.type_id}>{type.type_name}</option>
                        ))}
                    </select>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <label style={{ fontWeight: '500' }}>Filter by Status:</label>
                    <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd' }}>
                        <option value="">All Statuses</option>
                        <option value="available">Available</option>
                        <option value="booked">Booked</option>
                        <option value="maintenance">Maintenance</option>
                    </select>
                </div>
                {(filterType || filterStatus) && (
                    <button onClick={handleClearFilters} style={{ padding: '0.5rem 1rem', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Clear Filters</button>
                )}
                <div style={{ marginLeft: 'auto', fontWeight: '500', color: '#555' }}>
                    Showing {filteredRooms.length} of {rooms.length} rooms
                </div>
            </div>

            <div className="table-container">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Room #</th>
                            <th>Type</th>
                            <th>Price</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredRooms.map(room => (
                            <tr key={room.room_id}>
                                <td>{room.room_number}</td>
                                <td>{room.room_type}</td>
                                <td>ETB {room.price_per_night}</td>
                                <td>
                                    <span className={`status-badge status-${room.status} `}>
                                        {room.status}
                                    </span>
                                </td>
                                <td>
                                    {room.status === 'available' && (
                                        <button className="action-btn btn-primary" onClick={() => handleCreateManualBooking(room)} style={{ backgroundColor: '#28a745' }}>
                                            <UserPlus size={16} />
                                            Book
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                        {filteredRooms.length === 0 && <tr><td colSpan="5">No rooms found matching filters.</td></tr>}
                    </tbody>
                </table>
            </div>

            {/* Manual Booking Modal */}
            {showBookingModal && selectedRoom && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>Create Manual Booking</h3>
                        <div style={{ backgroundColor: '#f0f9ff', padding: '1rem', borderRadius: '8px', marginBottom: '1rem', border: '1px solid #bae6fd' }}>
                            <div style={{ fontWeight: '600', fontSize: '1.1rem' }}>
                                Room {selectedRoom.room_number} - {selectedRoom.room_type}
                            </div>
                            <div style={{ color: '#0369a1', fontWeight: '700', fontSize: '1.25rem', marginTop: '0.25rem' }}>
                                ETB {selectedRoom.price_per_night} / night
                            </div>
                        </div>

                        <form onSubmit={handleBookingSubmit}>
                            {!showRegistration && !selectedUser && (
                                <div className="form-group" style={{ position: 'relative' }}>
                                    <label>Guest Email</label>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <input
                                            type="text"
                                            value={userSearch}
                                            onChange={async (e) => {
                                                const val = e.target.value;
                                                setUserSearch(val);
                                                if (val.length >= 2) {
                                                    try {
                                                        const data = await authService.searchUsers(val);
                                                        setSearchResults(data.data || []);
                                                    } catch (err) { setSearchResults([]); }
                                                } else { setSearchResults([]); }
                                            }}
                                            placeholder="Type name or email to search..."
                                            style={{ flex: 1 }}
                                        />
                                    </div>
                                    {searchResults.length > 0 && (
                                        <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, maxHeight: '200px', overflowY: 'auto', backgroundColor: 'white', border: '1px solid #ddd', zIndex: 1000 }}>
                                            {searchResults.map(u => (
                                                <div key={u.id} onClick={() => { setSelectedUser(u); setUserSearch(''); setSearchResults([]); }} style={{ padding: '0.75rem', cursor: 'pointer', borderBottom: '1px solid #eee' }}>
                                                    <div style={{ fontWeight: '500' }}>{u.name}</div>
                                                    <div style={{ fontSize: '0.85rem', color: '#666' }}>{u.email}</div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    <div style={{ marginTop: '0.5rem', textAlign: 'center' }}>
                                        <button type="button" onClick={() => setShowRegistration(true)} className="btn-primary" style={{ backgroundColor: '#28a745' }}>+ Register New Guest</button>
                                    </div>
                                </div>
                            )}

                            {selectedUser && !showRegistration && (
                                <div style={{ marginBottom: '1rem', padding: '0.75rem', backgroundColor: '#e8f5e9', borderRadius: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div><strong>✓ Guest:</strong> {selectedUser.name} ({selectedUser.email})</div>
                                    <button type="button" onClick={() => { setSelectedUser(null); setUserSearch(''); }} style={{ background: 'none', border: 'none', color: '#d32f2f', cursor: 'pointer' }}>Change</button>
                                </div>
                            )}

                            {showRegistration && (
                                <div style={{ marginBottom: '1rem', padding: '1rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                                    <h4 style={{ marginTop: 0, marginBottom: '1rem', color: '#1e40af' }}>Register New Guest</h4>
                                    <div className="form-group">
                                        <input placeholder="Full Name *" required value={newGuest.name} onChange={e => setNewGuest({ ...newGuest, name: e.target.value })} style={{ marginBottom: '0.5rem', width: '100%' }} />
                                        <input placeholder="Email *" type="email" required value={newGuest.email} onChange={e => setNewGuest({ ...newGuest, email: e.target.value })} style={{ marginBottom: '0.5rem', width: '100%' }} />
                                        <input placeholder="Phone *" required value={newGuest.phone} onChange={e => setNewGuest({ ...newGuest, phone: e.target.value })} style={{ marginBottom: '0.5rem', width: '100%' }} />
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem' }}>
                                        <button type="button" onClick={() => setShowRegistration(false)}>← Back</button>
                                        <button type="button" className="btn-primary" onClick={handleRegisterGuest} style={{ backgroundColor: '#28a745' }}>Register & Continue</button>
                                    </div>
                                </div>
                            )}

                            {selectedUser && !showRegistration && (
                                <>
                                    <div className="form-group">
                                        <label>Check-in Date</label>
                                        <input type="date" required value={bookingFormData.check_in} onChange={e => setBookingFormData({ ...bookingFormData, check_in: e.target.value })} min={new Date().toISOString().split('T')[0]} />
                                    </div>
                                    <div className="form-group">
                                        <label>Check-out Date</label>
                                        <input type="date" required value={bookingFormData.check_out} onChange={e => setBookingFormData({ ...bookingFormData, check_out: e.target.value })} min={bookingFormData.check_in || new Date().toISOString().split('T')[0]} />
                                    </div>
                                    {bookingFormData.check_in && bookingFormData.check_out && (
                                        <div style={{ backgroundColor: '#fef3c7', padding: '0.75rem', borderRadius: '4px', marginBottom: '1rem', border: '1px solid #f59e0b' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.1rem', marginTop: '0.25rem' }}>
                                                <span>Total:</span>
                                                <strong style={{ color: '#b45309' }}>
                                                    ETB {(Math.ceil((new Date(bookingFormData.check_out) - new Date(bookingFormData.check_in)) / (1000 * 60 * 60 * 24)) * selectedRoom.price_per_night).toFixed(2)}
                                                </strong>
                                            </div>
                                        </div>
                                    )}
                                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                                        <button type="button" onClick={() => setShowBookingModal(false)}>Cancel</button>
                                        <button type="submit" className="btn-primary">Create Booking</button>
                                    </div>
                                </>
                            )}
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

function AdminBookings() {
    const [activeSubTab, setActiveSubTab] = useState('rooms');
    const [roomBookings, setRoomBookings] = useState([]);
    const [eventBookings, setEventBookings] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => { loadBookings(); }, []);

    const loadBookings = async () => {
        try {
            const roomData = await bookingService.getAll();
            if (roomData.data) setRoomBookings(roomData.data);
            const eventData = await eventService.getAllForAdmin();
            if (eventData.data) setEventBookings(eventData.data);
        } catch (err) { console.error('Error loading bookings:', err); }
    };

    const handleRoomStatus = async (id, status) => {
        if (!window.confirm(`Mark room booking as ${status}?`)) return;
        await bookingService.updateStatus(id, status);
        loadBookings();
    };

    const handleEventStatus = async (bookingId, status) => {
        if (!window.confirm(`Mark event booking as ${status}?`)) return;
        try {
            const response = await fetch('http://localhost/aman_hotel/Backend/api/events/update_booking_status.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ booking_id: bookingId, status })
            });
            const result = await response.json();
            if (result.message === 'Booking status updated') loadBookings();
            else alert('Failed to update status');
        } catch (err) { alert('Error updating status'); }
    };

    return (
        <div>
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', borderBottom: '2px solid #e5e7eb' }}>
                <button onClick={() => setActiveSubTab('rooms')} style={{ padding: '0.75rem 1.5rem', border: 'none', background: 'none', fontSize: '1rem', fontWeight: '500', cursor: 'pointer', borderBottom: activeSubTab === 'rooms' ? '3px solid #3182ce' : '3px solid transparent', color: activeSubTab === 'rooms' ? '#3182ce' : '#6b7280' }}>
                    Room Bookings ({roomBookings.length})
                </button>
                <button onClick={() => setActiveSubTab('tickets')} style={{ padding: '0.75rem 1.5rem', border: 'none', background: 'none', fontSize: '1rem', fontWeight: '500', cursor: 'pointer', borderBottom: activeSubTab === 'tickets' ? '3px solid #3182ce' : '3px solid transparent', color: activeSubTab === 'tickets' ? '#3182ce' : '#6b7280' }}>
                    Event Tickets ({eventBookings.length})
                </button>
            </div>

            <div className="search-bar" style={{ marginBottom: '1rem', display: 'flex', gap: '0.5rem' }}>
                <input type="text" placeholder="Search by User Email..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd', flex: 1, maxWidth: '300px' }} />
            </div>

            {activeSubTab === 'rooms' && (
                <div className="table-container">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>User</th>
                                <th>Room</th>
                                <th>Check-in/out</th>
                                <th>Status</th>
                                <th>Refund</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {roomBookings.filter(b => b.user_email.toLowerCase().includes(searchTerm.toLowerCase())).map(book => (
                                <tr key={book.id}>
                                    <td>#{book.id}</td>
                                    <td>{book.user_name}<br /><small>{book.user_email}</small></td>
                                    <td>{book.room_number} ({book.room_type})</td>
                                    <td>{book.check_in} <br /> to {book.check_out}</td>
                                    <td><span className={`status-badge status-${book.status}`}>{book.status}</span></td>
                                    <td>{book.refund_status && <span className={`status-badge status-${book.refund_status === 'completed' ? 'confirmed' : 'pending'}`}>{book.refund_status === 'completed' ? 'PAID' : 'PENDING'}</span>}</td>
                                    <td>
                                        {book.status === 'pending' && (
                                            <>
                                                <button className="action-btn btn-approve" onClick={() => handleRoomStatus(book.id, 'confirmed')}><Check size={16} /> Approve</button>
                                                <button className="action-btn btn-delete" onClick={() => handleRoomStatus(book.id, 'cancelled')}><X size={16} /> Reject</button>
                                            </>
                                        )}
                                        {book.status === 'confirmed' && (
                                            <button className="action-btn btn-primary" onClick={() => handleRoomStatus(book.id, 'completed')}><Check size={16} /> Complete</button>
                                        )}
                                        {book.status === 'cancelled' && book.refund_status === 'pending' && (
                                            <button className="action-btn btn-primary" style={{ backgroundColor: '#ecc94b', color: '#744210' }} onClick={async () => {
                                                if (window.confirm('Mark manual cash refund as COMPLETED?')) {
                                                    await bookingService.processRefund(book.id);
                                                    loadBookings();
                                                }
                                            }}><Check size={16} /> Refund</button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {activeSubTab === 'tickets' && (
                <div className="table-container">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>User</th>
                                <th>Event</th>
                                <th>Ticket</th>
                                <th>Total</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {eventBookings.filter(b => b.user_email.toLowerCase().includes(searchTerm.toLowerCase())).map(book => (
                                <tr key={book.booking_id}>
                                    <td>#{book.booking_id}</td>
                                    <td>{book.user_name}<br /><small>{book.user_email}</small></td>
                                    <td>{book.event_title}<br /><small>{new Date(book.event_date).toLocaleDateString()}</small></td>
                                    <td>{book.ticket_type.toUpperCase()} ({book.quantity})</td>
                                    <td>ETB {parseFloat(book.total_price).toFixed(2)}</td>
                                    <td><span className={`status-badge status-${book.status}`}>{book.status}</span></td>
                                    <td>
                                        {book.status === 'pending' && (
                                            <>
                                                <button className="action-btn btn-approve" onClick={() => handleEventStatus(book.booking_id, 'confirmed')}><Check size={16} /> Approve</button>
                                                <button className="action-btn btn-delete" onClick={() => handleEventStatus(book.booking_id, 'cancelled')}><X size={16} /> Reject</button>
                                            </>
                                        )}
                                        {book.status === 'cancelled' && book.refund_status === 'pending' && (
                                            <button className="action-btn btn-primary" style={{ backgroundColor: '#ecc94b', color: '#744210' }} onClick={async () => {
                                                if (window.confirm('Mark manual cash refund as COMPLETED?')) {
                                                    await eventService.processEventRefund(book.booking_id);
                                                    loadBookings();
                                                }
                                            }}><Check size={16} /> Refund</button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

function AdminEvents() {
    const [events, setEvents] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [showBookingModal, setShowBookingModal] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [userSearch, setUserSearch] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [bookingFormData, setBookingFormData] = useState({ ticket_type: 'regular' });
    const [showRegistration, setShowRegistration] = useState(false);
    const [newGuest, setNewGuest] = useState({ name: '', email: '', phone: '', password: 'password123' });

    useEffect(() => { loadEvents(); }, []);

    const loadEvents = async () => {
        try {
            const data = await eventService.getAll();
            if (data.data) setEvents(data.data);
        } catch (err) { console.error(err); }
    };

    const handleRegisterGuest = async () => {
        try {
            const res = await authService.register(newGuest);
            if (res.message === 'User Created') {
                const searchRes = await authService.searchUsers(newGuest.email);
                if (searchRes.data && searchRes.data.length > 0) {
                    setSelectedUser(searchRes.data[0]);
                    alert('Guest registered and selected!');
                    setShowRegistration(false);
                    setNewGuest({ name: '', email: '', phone: '', password: 'password123' });
                }
            } else { alert(res.message || 'Registration failed'); }
        } catch (e) { alert('Error creating guest account'); }
    };

    const handleUserSearch = async (searchTerm) => {
        setUserSearch(searchTerm);
        if (searchTerm.length >= 2) {
            try {
                const data = await authService.searchUsers(searchTerm);
                if (data.data) setSearchResults(data.data);
                else setSearchResults([]);
            } catch (err) { setSearchResults([]); }
        } else { setSearchResults([]); }
    };

    const handleManualBooking = (event) => {
        setSelectedEvent(event);
        setUserSearch('');
        setSearchResults([]);
        setSelectedUser(null);
        setBookingFormData({ ticket_type: 'regular' });
        setShowBookingModal(true);
    };

    const handleBookingSubmit = async (e) => {
        e.preventDefault();
        if (!selectedUser) return alert('Select a user');
        try {
            await eventService.bookTicket(selectedEvent.event_id, bookingFormData.ticket_type, selectedUser.id);
            alert('Ticket booked!');
            setShowBookingModal(false);
            loadEvents();
        } catch (err) { alert('Booking failed'); }
    };

    return (
        <div>
            <div className="search-bar" style={{ marginBottom: '1rem' }}>
                <input type="text" placeholder="Search events by title..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ padding: '0.6rem', borderRadius: '6px', border: '1px solid #cbd5e0', width: '100%', maxWidth: '400px' }} />
            </div>
            <div className="table-container">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Title</th>
                            <th>Date</th>
                            <th>Tickets</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {events.filter(ev => ev.title.toLowerCase().includes(searchTerm.toLowerCase())).map(ev => (
                            <tr key={ev.event_id}>
                                <td>{ev.title}</td>
                                <td>{new Date(ev.start_time).toLocaleDateString()}</td>
                                <td>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                        <small>Reg: <strong>{ev.regular_available ?? ev.regular_capacity}</strong> left (${ev.regular_price || 0})</small>
                                        <small>VIP: <strong>{ev.vip_available ?? ev.vip_capacity}</strong> left (${ev.vip_price || 0})</small>
                                    </div>
                                </td>
                                <td>
                                    <button className="action-btn btn-primary" onClick={() => handleManualBooking(ev)} style={{ backgroundColor: '#28a745' }}>
                                        <UserPlus size={16} /> Book
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {showBookingModal && selectedEvent && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>Book Event Ticket</h3>
                        <form onSubmit={handleBookingSubmit}>
                            <div className="form-group" style={{ position: 'relative' }}>
                                <label>Search User</label>
                                <input type="text" value={userSearch} onChange={e => handleUserSearch(e.target.value)} placeholder="Search..." />
                                {searchResults.length > 0 && (
                                    <div style={{ position: 'absolute', top: '100%', background: 'white', border: '1px solid #ddd', width: '100%', zIndex: 10 }}>
                                        {searchResults.map(u => (
                                            <div key={u.id} onClick={() => { setSelectedUser(u); setUserSearch(''); setSearchResults([]); }} style={{ padding: '0.5rem', cursor: 'pointer' }}>{u.name} ({u.email})</div>
                                        ))}
                                    </div>
                                )}
                                <div style={{ textAlign: 'right', marginTop: '0.5rem' }}>
                                    <button type="button" onClick={() => setShowRegistration(true)} style={{ color: '#3182ce', background: 'none', border: 'none', cursor: 'pointer' }}>+ Register New Guest</button>
                                </div>
                            </div>

                            {selectedUser && (
                                <div style={{ padding: '0.5rem', background: '#e8f5e9', marginBottom: '1rem' }}>Selected: {selectedUser.name}</div>
                            )}

                            {showRegistration && (
                                <div style={{ border: '1px solid #ddd', padding: '1rem', marginBottom: '1rem' }}>
                                    <input placeholder="Name" value={newGuest.name} onChange={e => setNewGuest({ ...newGuest, name: e.target.value })} style={{ display: 'block', width: '100%', marginBottom: '0.5rem' }} />
                                    <input placeholder="Email" value={newGuest.email} onChange={e => setNewGuest({ ...newGuest, email: e.target.value })} style={{ display: 'block', width: '100%', marginBottom: '0.5rem' }} />
                                    <input placeholder="Phone" value={newGuest.phone} onChange={e => setNewGuest({ ...newGuest, phone: e.target.value })} style={{ display: 'block', width: '100%', marginBottom: '0.5rem' }} />
                                    <button type="button" onClick={handleRegisterGuest}>Register</button>
                                </div>
                            )}

                            <div className="form-group">
                                <label>Ticket Type</label>
                                <select value={bookingFormData.ticket_type} onChange={e => setBookingFormData({ ...bookingFormData, ticket_type: e.target.value })}>
                                    <option value="regular">Regular ({selectedEvent.regular_price} ETB)</option>
                                    <option value="vip">VIP ({selectedEvent.vip_price} ETB)</option>
                                </select>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                                <button type="button" onClick={() => setShowBookingModal(false)}>Cancel</button>
                                <button type="submit" className="btn-primary" disabled={!selectedUser}>Confirm</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
