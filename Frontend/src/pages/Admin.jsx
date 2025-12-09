import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Admin.css';
import { roomService, bookingService, contactService, eventService } from '../services/api';

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

// 1. Manage Rooms
function AdminRooms() {
    const [rooms, setRooms] = useState([]);
    const [showModal, setShowModal] = useState(false);
    
    const [isEditing, setIsEditing] = useState(false); // Track edit mode
    const [formData, setFormData] = useState({
        room_id: null, room_number: '', room_type: '', price_per_night: '', status: 'available', description: ''
    });

    useEffect(() => {
        loadRooms();
    }, []);

    const loadRooms = async () => {
        try {
            const data = await roomService.getAll();
            if (data.data) setRooms(data.data);
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
        setFormData({ room_id: null, room_number: '', room_type: '', price_per_night: '', status: 'available', description: '' });
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

    return (
        <div>
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
                        {rooms.map(room => (
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
                                </td>
                            </tr>
                        ))}
                        {rooms.length === 0 && <tr><td colSpan="5">No rooms found.</td></tr>}
                    </tbody>
                </table>
            </div>

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
                                <label>Type</label>
                                <input required value={formData.room_type} onChange={e => setFormData({ ...formData, room_type: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label>Price</label>
                                <input type="number" required value={formData.price_per_night} onChange={e => setFormData({ ...formData, price_per_night: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label>Status</label>
                                <select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })}>
                                    <option value="available">Available</option>
                                    <option value="booked">Booked</option>
                                    <option value="maintenance">Maintenance</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Description</label>
                                <textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })}></textarea>
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

// 2. Manage Bookings
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
        event_id: null, title: '', description: '', location: '', start_time: '', organizer_id: 1 // Default admin
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
        setFormData({ event_id: null, title: '', description: '', location: '', start_time: '', organizer_id: 1 });
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
                    <div className="modal-content">
                        <h3>{isEditing ? 'Edit Event' : 'Add Event'}</h3>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Title</label>
                                <input required value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label>Date & Time</label>
                                <input type="datetime-local" required value={formData.start_time} onChange={e => setFormData({ ...formData, start_time: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label>Location</label>
                                <input required value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label>Description</label>
                                <textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })}></textarea>
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
