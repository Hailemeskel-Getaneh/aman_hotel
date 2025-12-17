import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Admin.css';
import { roomService, roomTypeService, bookingService, contactService, eventService, authService } from '../services/api';

export default function Admin() {
    const [activeTab, setActiveTab] = useState('rooms');
    const [authorized, setAuthorized] = useState(false); // New state to block rendering
    const navigate = useNavigate();

    useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (!userStr) {
            navigate('/signin');
            return;
        }


        try {
            const user = JSON.parse(userStr);
            if (user.role !== 'admin') {
                alert("Access Denied: Admins Only");
                navigate('/');
            } else {
                setAuthorized(true); // Allow rendering only if Check Passed
            }

        } catch (e) {
            navigate('/signin');
        }
    }, [navigate]);

    if (!authorized) return null; // Don't render anything while checking or if failed

    // Basic logout
    const handleLogout = () => {
        // Clear user session if any
        localStorage.removeItem('user');
        navigate('/signin');
    };

    return (
        <div className="admin-container">
            {/* Sidebar */}
            <aside className="admin-sidebar">
                <h2>Admin Panel</h2>
                <ul className="sidebar-menu">
                    <li className={activeTab === 'room-types' ? 'active' : ''} onClick={() => setActiveTab('room-types')}>
                        Room Types
                    </li>
                    <li className={activeTab === 'rooms' ? 'active' : ''} onClick={() => setActiveTab('rooms')}>
                        Manage Rooms
                    </li>
                    <li className={activeTab === 'bookings' ? 'active' : ''} onClick={() => setActiveTab('bookings')}>
                        Bookings
                    </li>
                    <li className={activeTab === 'messages' ? 'active' : ''} onClick={() => setActiveTab('messages')}>
                        Messages
                    </li>
                    <li className={activeTab === 'events' ? 'active' : ''} onClick={() => setActiveTab('events')}>
                        Events
                    </li>
                </ul>
            </aside>

            {/* Main Content */}
            <main className="admin-content">
                <header className="admin-header">
                    <h1 className="admin-title">
                        {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
                    </h1>
                    <button className="logout-btn" onClick={handleLogout}>Logout</button>
                </header>

                <div className="content-body">
                    {activeTab === 'room-types' && <AdminRoomTypes />}
                    {activeTab === 'rooms' && <AdminRooms />}
                    {activeTab === 'bookings' && <AdminBookings />}
                    {activeTab === 'messages' && <AdminMessages />}
                    {activeTab === 'events' && <AdminEvents />}
                </div>
            </main>
        </div>
    );
}

// --- Sub Components ---

// 1. Manage Room Types
function AdminRoomTypes() {
    const [roomTypes, setRoomTypes] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        type_id: null, type_name: '', description: '', price_per_night: '',
        image_url: '', amenities: '', max_occupancy: 2
    });

    useEffect(() => {
        loadRoomTypes();
    }, []);

    const loadRoomTypes = async () => {
        try {
            const data = await roomTypeService.getAll();
            if (data.data) setRoomTypes(data.data);
        } catch (err) { console.error(err); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this room type?")) return;
        try {
            const result = await roomTypeService.delete(id);
            if (result.error) {
                alert(result.message);
            } else {
                loadRoomTypes();
            }
        } catch (err) {
            alert("Error deleting room type");
        }
    };

    const handleEdit = (type) => {
        setFormData(type);
        setIsEditing(true);
        setShowModal(true);
    };

    const handleAdd = () => {
        setFormData({
            type_id: null, type_name: '', description: '', price_per_night: '',
            image_url: '', amenities: '', max_occupancy: 2
        });
        setIsEditing(false);
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isEditing) {
            await roomTypeService.update(formData);
        } else {
            await roomTypeService.create(formData);
        }
        setShowModal(false);
        loadRoomTypes();
    };

    return (
        <div>
            <button className="btn-primary" style={{ marginBottom: '1rem' }} onClick={handleAdd}>
                + Add New Room Type
            </button>
            <div className="table-container">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Type Name</th>
                            <th>Price/Night</th>
                            <th>Max Occupancy</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {roomTypes.map(type => (
                            <tr key={type.type_id}>
                                <td>{type.type_name}</td>
                                <td>${type.price_per_night}</td>
                                <td>{type.max_occupancy} guests</td>
                                <td>
                                    <button className="action-btn btn-edit" onClick={() => handleEdit(type)}>Edit</button>
                                    <button className="action-btn btn-delete" onClick={() => handleDelete(type.type_id)}>Delete</button>
                                </td>
                            </tr>
                        ))}
                        {roomTypes.length === 0 && <tr><td colSpan="4">No room types found.</td></tr>}
                    </tbody>
                </table>
            </div>

            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>{isEditing ? 'Edit Room Type' : 'Add New Room Type'}</h3>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Type Name</label>
                                <input required value={formData.type_name} onChange={e => setFormData({ ...formData, type_name: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label>Price per Night</label>
                                <input type="number" step="0.01" required value={formData.price_per_night} onChange={e => setFormData({ ...formData, price_per_night: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label>Max Occupancy</label>
                                <input type="number" required value={formData.max_occupancy} onChange={e => setFormData({ ...formData, max_occupancy: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label>Image URL (optional)</label>
                                <input value={formData.image_url || ''} onChange={e => setFormData({ ...formData, image_url: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label>Amenities (optional)</label>
                                <textarea value={formData.amenities || ''} onChange={e => setFormData({ ...formData, amenities: e.target.value })}></textarea>
                            </div>
                            <div className="form-group">
                                <label>Description</label>
                                <textarea value={formData.description || ''} onChange={e => setFormData({ ...formData, description: e.target.value })}></textarea>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                                <button type="button" onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className="btn-primary">{isEditing ? 'Update' : 'Save'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

// 2. Manage Rooms
function AdminRooms() {
    const [rooms, setRooms] = useState([]);
    const [roomTypes, setRoomTypes] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [showBookingModal, setShowBookingModal] = useState(false);
    const [selectedRoom, setSelectedRoom] = useState(null);

    // Filter states
    const [filterType, setFilterType] = useState('');
    const [filterStatus, setFilterStatus] = useState('');

    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        room_id: null, room_number: '', room_type_id: '', status: 'available'
    });

    const [bookingFormData, setBookingFormData] = useState({
        user_id: '',
        check_in: '',
        check_out: '',
    });

    const [userSearch, setUserSearch] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);


    useEffect(() => {
        loadRooms();
        loadRoomTypes();
    }, []);

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

    const handleAdd = () => {
        setFormData({ room_id: null, room_number: '', room_type_id: '', status: 'available' });
        setIsEditing(false);
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
                user_id: selectedUser.id, // Use selected user's ID
                room_id: selectedRoom.room_id,
                check_in: bookingFormData.check_in,
                check_out: bookingFormData.check_out,
            };

            const result = await bookingService.create(bookingData);

            if (result.message === 'Booking Created') {
                alert(`Manual booking created successfully for ${selectedUser.name}!`);
                setShowBookingModal(false);
                loadRooms(); // Refresh to show updated status
            } else {
                alert('Booking failed: ' + (result.message || 'Unknown error'));
            }
        } catch (err) {
            console.error(err);
            alert('Error creating booking');
        }
    };

    // Filter rooms based on selected filters
    const filteredRooms = rooms.filter(room => {
        const typeMatch = !filterType || room.room_type_id == filterType;
        const statusMatch = !filterStatus || room.status === filterStatus;
        return typeMatch && statusMatch;
    });

    return (
        <div>
            {/* Filter Controls */}
            <div style={{
                display: 'flex',
                gap: '1rem',
                marginBottom: '1rem',
                alignItems: 'center',
                flexWrap: 'wrap'
            }}>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <label style={{ fontWeight: '500' }}>Filter by Type:</label>
                    <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                        style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd' }}
                    >
                        <option value="">All Types</option>
                        {roomTypes.map(type => (
                            <option key={type.type_id} value={type.type_id}>
                                {type.type_name}
                            </option>
                        ))}
                    </select>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <label style={{ fontWeight: '500' }}>Filter by Status:</label>
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd' }}
                    >
                        <option value="">All Statuses</option>
                        <option value="available">Available</option>
                        <option value="booked">Booked</option>
                        <option value="maintenance">Maintenance</option>
                    </select>
                </div>

                {(filterType || filterStatus) && (
                    <button
                        onClick={handleClearFilters}
                        style={{
                            padding: '0.5rem 1rem',
                            backgroundColor: '#6c757d',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                        }}
                    >
                        Clear Filters
                    </button>
                )}

                <div style={{ marginLeft: 'auto', fontWeight: '500', color: '#555' }}>
                    Showing {filteredRooms.length} of {rooms.length} rooms
                </div>
            </div>

            <button className="btn-primary" style={{ marginBottom: '1rem' }} onClick={handleAdd}>
                + Add New Room
            </button>

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
                                <td>${room.price_per_night}</td>
                                <td>
                                    <span className={`status-badge status-${room.status}`}>
                                        {room.status}
                                    </span>
                                </td>
                                <td>
                                    <button className="action-btn btn-edit" onClick={() => handleEdit(room)}>Edit</button>
                                    <button className="action-btn btn-delete" onClick={() => handleDelete(room.room_id)}>Delete</button>
                                    {room.status === 'available' && (
                                        <button
                                            className="action-btn btn-primary"
                                            onClick={() => handleCreateManualBooking(room)}
                                            style={{ backgroundColor: '#28a745' }}
                                        >
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

            {/* Room Edit/Add Modal */}
            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>{isEditing ? 'Edit Room' : 'Add New Room'}</h3>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Room Number</label>
                                <input required value={formData.room_number} onChange={e => setFormData({ ...formData, room_number: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label>Room Type</label>
                                <select required value={formData.room_type_id} onChange={e => setFormData({ ...formData, room_type_id: e.target.value })}>
                                    <option value="">Select a room type</option>
                                    {roomTypes.map(type => (
                                        <option key={type.type_id} value={type.type_id}>{type.type_name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Status</label>
                                <select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })}>
                                    <option value="available">Available</option>
                                    <option value="maintenance">Maintenance</option>
                                    {/* Removed "booked" option - bookings should be created through the booking system */}
                                </select>
                                <small style={{ color: '#666', fontSize: '0.85rem' }}>
                                    Note: To mark a room as booked, create a booking instead.
                                </small>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                                <button type="button" onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className="btn-primary">{isEditing ? 'Update' : 'Save'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Manual Booking Modal */}
            {showBookingModal && selectedRoom && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>Create Manual Booking</h3>
                        <p style={{ color: '#666', marginBottom: '1rem' }}>
                            Room {selectedRoom.room_number} - {selectedRoom.room_type}
                        </p>
                        <form onSubmit={handleBookingSubmit}>
                            <div className="form-group" style={{ position: 'relative' }}>
                                <label>Search User (by name or email)</label>
                                <input
                                    type="text"
                                    value={userSearch}
                                    onChange={e => handleUserSearch(e.target.value)}
                                    placeholder="Type to search registered users..."
                                    required={!selectedUser}
                                />
                                {searchResults.length > 0 && (
                                    <div style={{
                                        position: 'absolute',
                                        top: '100%',
                                        left: 0,
                                        right: 0,
                                        maxHeight: '200px',
                                        overflowY: 'auto',
                                        backgroundColor: 'white',
                                        border: '1px solid #ddd',
                                        borderRadius: '4px',
                                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                                        zIndex: 1000
                                    }}>
                                        {searchResults.map(user => (
                                            <div
                                                key={user.id}
                                                onClick={() => handleSelectUser(user)}
                                                style={{
                                                    padding: '0.75rem',
                                                    cursor: 'pointer',
                                                    borderBottom: '1px solid #eee',
                                                    transition: 'background-color 0.2s'
                                                }}
                                                onMouseEnter={(e) => e.target.style.backgroundColor = '#f5f5f5'}
                                                onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
                                            >
                                                <div style={{ fontWeight: '500' }}>{user.name}</div>
                                                <div style={{ fontSize: '0.85rem', color: '#666' }}>{user.email}</div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                {selectedUser && (
                                    <div style={{
                                        marginTop: '0.5rem',
                                        padding: '0.5rem',
                                        backgroundColor: '#e8f5e9',
                                        borderRadius: '4px',
                                        fontSize: '0.9rem'
                                    }}>
                                        ✓ Selected: <strong>{selectedUser.name}</strong> ({selectedUser.email})
                                    </div>
                                )}
                                <small style={{ color: '#666', fontSize: '0.85rem', display: 'block', marginTop: '0.25rem' }}>
                                    Type at least 2 characters to search
                                </small>
                            </div>
                            <div className="form-group">
                                <label>Check-in Date</label>
                                <input
                                    type="date"
                                    required
                                    value={bookingFormData.check_in}
                                    onChange={e => setBookingFormData({ ...bookingFormData, check_in: e.target.value })}
                                    min={new Date().toISOString().split('T')[0]}
                                />
                            </div>
                            <div className="form-group">
                                <label>Check-out Date</label>
                                <input
                                    type="date"
                                    required
                                    value={bookingFormData.check_out}
                                    onChange={e => setBookingFormData({ ...bookingFormData, check_out: e.target.value })}
                                    min={bookingFormData.check_in || new Date().toISOString().split('T')[0]}
                                />
                            </div>
                            <div style={{
                                backgroundColor: '#e3f2fd',
                                padding: '0.75rem',
                                borderRadius: '4px',
                                marginBottom: '1rem',
                                fontSize: '0.9rem'
                            }}>
                                <strong>Note:</strong> This booking will be created for the selected registered user.
                                The room status will automatically change to "booked".
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                                <button type="button" onClick={() => setShowBookingModal(false)}>Cancel</button>
                                <button type="submit" className="btn-primary" disabled={!selectedUser}>
                                    Create Booking
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

// 3. Manage Bookings
function AdminBookings() {
    const [bookings, setBookings] = useState([]);

    useEffect(() => {
        loadBookings();
    }, []);

    const loadBookings = async () => {
        try {
            const data = await bookingService.getAll();
            if (data.data) setBookings(data.data);
        } catch (err) { console.error(err); }
    };

    const handleStatus = async (id, status) => {
        if (!window.confirm(`Mark booking as ${status}?`)) return;
        await bookingService.updateStatus(id, status);
        loadBookings();
    };

    return (
        <div className="table-container">
            <table className="admin-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>User</th>
                        <th>Room</th>
                        <th>Check-in/out</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {bookings.map(book => (
                        <tr key={book.id}>
                            <td>#{book.id}</td>
                            <td>{book.user_name}<br /><small>{book.user_email}</small></td>
                            <td>{book.room_number} ({book.room_type})</td>
                            <td>{book.check_in} <br /> to {book.check_out}</td>
                            <td>
                                <span className={`status-badge status-${book.status}`}>
                                    {book.status}
                                </span>
                            </td>
                            <td>
                                {book.status === 'pending' && (
                                    <>
                                        <button className="action-btn btn-approve" onClick={() => handleStatus(book.id, 'confirmed')}>Approve</button>
                                        <button className="action-btn btn-delete" onClick={() => handleStatus(book.id, 'cancelled')}>Reject</button>
                                    </>
                                )}
                                {book.status === 'confirmed' && (
                                    <button className="action-btn btn-primary" onClick={() => handleStatus(book.id, 'completed')}>Complete</button>
                                )}
                            </td>
                        </tr>
                    ))}
                    {bookings.length === 0 && <tr><td colSpan="6">No bookings found.</td></tr>}
                </tbody>
            </table>
        </div>
    );
}

// 3. View Messages
function AdminMessages() {
    const [messages, setMessages] = useState([]);

    useEffect(() => {
        contactService.getAll().then(data => {
            if (data.data) setMessages(data.data);
        }).catch(console.error);
    }, []);

    return (
        <div className="table-container">
            <table className="admin-table">
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Name</th>
                        <th>Subject</th>
                        <th>Message</th>
                    </tr>
                </thead>
                <tbody>
                    {messages.map(msg => (
                        <tr key={msg.id}>
                            <td>{new Date(msg.created_at).toLocaleDateString()}</td>
                            <td>{msg.name}<br /><small>{msg.email}</small></td>
                            <td>{msg.subject}</td>
                            <td>{msg.message}</td>
                        </tr>
                    ))}
                    {messages.length === 0 && <tr><td colSpan="4">No messages found.</td></tr>}
                </tbody>
            </table>
        </div>
    );
}

// 4. Manage Events
function AdminEvents() {
    const [events, setEvents] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        event_id: null,
        title: '',
        description: '',
        location: '',
        start_time: '',
        end_time: '',
        organizer_id: 1, // Default admin
        vip_capacity: 0,
        regular_capacity: 0,
        vip_price: 0,
        regular_price: 0
    });

    useEffect(() => {
        loadEvents();
    }, []);

    const loadEvents = async () => {
        try {
            const data = await eventService.getAll();
            if (data.data) setEvents(data.data);
        } catch (err) { console.error(err); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete event?")) return;
        await eventService.delete(id);
        loadEvents();
    };

    const handleEdit = (event) => {
        setFormData(event);
        setIsEditing(true);
        setShowModal(true);
    };

    const handleAdd = () => {
        setFormData({
            event_id: null,
            title: '',
            description: '',
            location: '',
            start_time: '',
            end_time: '',
            organizer_id: 1,
            vip_capacity: 0,
            regular_capacity: 0,
            vip_price: 0,
            regular_price: 0
        });
        setIsEditing(false);
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isEditing) {
            await eventService.update(formData);
        } else {
            await eventService.create(formData);
        }
        setShowModal(false);
        loadEvents();
    };

    return (
        <div>
            <button className="btn-primary" style={{ marginBottom: '1rem' }} onClick={handleAdd}>
                + Add New Event
            </button>
            <div className="table-container">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Title</th>
                            <th>Date</th>
                            <th>Location</th>
                            <th>Tickets</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {events.map(ev => (
                            <tr key={ev.event_id}>
                                <td>{ev.title}</td>
                                <td>{new Date(ev.start_time).toLocaleDateString()}</td>
                                <td>{ev.location}</td>
                                <td>
                                    <small>Reg: {ev.regular_capacity || 0} (${ev.regular_price || 0})</small><br />
                                    <small>VIP: {ev.vip_capacity || 0} (${ev.vip_price || 0})</small>
                                </td>
                                <td>
                                    <button className="action-btn btn-edit" onClick={() => handleEdit(ev)}>Edit</button>
                                    <button className="action-btn btn-delete" onClick={() => handleDelete(ev.event_id)}>Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{ maxWidth: '600px' }}>
                        <h3>{isEditing ? 'Edit Event' : 'Add Event'}</h3>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Title</label>
                                <input required value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} />
                            </div>

                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <div className="form-group" style={{ flex: 1 }}>
                                    <label>Start Time</label>
                                    <input type="datetime-local" required value={formData.start_time} onChange={e => setFormData({ ...formData, start_time: e.target.value })} />
                                </div>
                                <div className="form-group" style={{ flex: 1 }}>
                                    <label>End Time</label>
                                    <input type="datetime-local" value={formData.end_time || ''} onChange={e => setFormData({ ...formData, end_time: e.target.value })} />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Location</label>
                                <input required value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', background: '#f8f9fa', padding: '1rem', borderRadius: '4px', marginBottom: '1rem' }}>
                                <div className="form-group">
                                    <label>Regular Capacity</label>
                                    <input type="number" value={formData.regular_capacity} onChange={e => setFormData({ ...formData, regular_capacity: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label>Regular Price ($)</label>
                                    <input type="number" step="0.01" value={formData.regular_price} onChange={e => setFormData({ ...formData, regular_price: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label>VIP Capacity</label>
                                    <input type="number" value={formData.vip_capacity} onChange={e => setFormData({ ...formData, vip_capacity: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label>VIP Price ($)</label>
                                    <input type="number" step="0.01" value={formData.vip_price} onChange={e => setFormData({ ...formData, vip_price: e.target.value })} />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Description</label>
                                <textarea style={{ height: '100px' }} value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })}></textarea>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                                <button type="button" onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className="btn-primary">{isEditing ? 'Update' : 'Create'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
