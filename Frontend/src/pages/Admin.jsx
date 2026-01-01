import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Admin.css';
import { roomService, roomTypeService, bookingService, contactService, eventService, authService, adminService } from '../services/api';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell, LineChart, Line, AreaChart, Area
} from 'recharts';
import {
    LayoutDashboard, BedDouble, Hotel, BookOpen, MessageSquare, Calendar, LogOut,
    TrendingUp, Users, DollarSign, Briefcase, Edit, Trash2, Plus, Check, X, UserPlus
} from 'lucide-react';

export default function Admin() {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [authorized, setAuthorized] = useState(false);
    const [pendingBookingsCount, setPendingBookingsCount] = useState(0);
    const navigate = useNavigate();

    const [userRole, setUserRole] = useState('');

    useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (!userStr) {
            navigate('/signin');
            return;
        }


        try {
            const user = JSON.parse(userStr);
            // Allow admin AND receptionist
            if (user.role !== 'admin' && user.role !== 'receptionist') {
                alert("Access Denied: Staff Only");
                navigate('/');
            } else {
                setUserRole(user.role);
                // Receptionists don't see dashboard (stats/revenue), default to bookings
                if (user.role === 'receptionist' && activeTab === 'dashboard') {
                    setActiveTab('bookings');
                }
                setAuthorized(true); // Allow rendering only if Check Passed
            }

        } catch (e) {
            navigate('/signin');
        }
    }, [navigate]);

    // Fetch pending bookings count (both rooms and events)
    useEffect(() => {
        const fetchPendingCount = async () => {
            try {
                // Fetch room bookings
                const roomData = await bookingService.getAll();
                const roomPendingCount = roomData.data ? roomData.data.filter(b => b.status === 'pending').length : 0;

                // Fetch event bookings
                const eventData = await eventService.getAllForAdmin();
                const eventPendingCount = eventData.data ? eventData.data.filter(b => b.status === 'pending').length : 0;

                // Total pending count
                const totalPending = roomPendingCount + eventPendingCount;
                setPendingBookingsCount(totalPending);
            } catch (err) {
                console.error('Error fetching bookings:', err);
            }
        };

        if (authorized) {
            fetchPendingCount();
            // Refresh count every 30 seconds
            const interval = setInterval(fetchPendingCount, 30000);
            return () => clearInterval(interval);
        }
    }, [authorized]);

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
                <div className="sidebar-brand">
                    <Hotel size={24} />
                    <h2>Aman Hotel</h2>
                </div>
                <ul className="sidebar-menu">
                    {userRole === 'admin' && (
                        <li className={activeTab === 'dashboard' ? 'active' : ''} onClick={() => setActiveTab('dashboard')}>
                            <LayoutDashboard size={20} />
                            <span>Dashboard</span>
                        </li>
                    )}
                    {/* Admin Only Tabs */}
                    {userRole === 'admin' && (
                        <>
                            <li className={activeTab === 'users' ? 'active' : ''} onClick={() => setActiveTab('users')}>
                                <Users size={20} />
                                <span>Users</span>
                            </li>
                            <li className={activeTab === 'room-types' ? 'active' : ''} onClick={() => setActiveTab('room-types')}>
                                <BedDouble size={20} />
                                <span style={{ fontSize: '0.9em' }}>Room Types</span>
                            </li>
                        </>
                    )}

                    <li className={activeTab === 'rooms' ? 'active' : ''} onClick={() => setActiveTab('rooms')}>
                        <Hotel size={20} />
                        <span>Rooms</span>
                    </li>
                    <li className={activeTab === 'bookings' ? 'active' : ''} onClick={() => setActiveTab('bookings')}>
                        <BookOpen size={20} />
                        <span>Bookings</span>
                        {pendingBookingsCount > 0 && (
                            <span className="notification-badge">{pendingBookingsCount}</span>
                        )}
                    </li>
                    {userRole === 'admin' && (
                        <li className={activeTab === 'messages' ? 'active' : ''} onClick={() => setActiveTab('messages')}>
                            <MessageSquare size={20} />
                            <span>Messages</span>
                        </li>
                    )}
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
                        {activeTab === 'room-types' ? 'Room Types' : activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
                    </h1>
                    <button className="logout-btn" onClick={handleLogout}>
                        <LogOut size={18} />
                        Logout
                    </button>
                </header>

                <div className="content-body">
                    {activeTab === 'dashboard' && <AdminDashboard />}
                    {activeTab === 'users' && userRole === 'admin' && <AdminUsers />}
                    {activeTab === 'room-types' && userRole === 'admin' && <AdminRoomTypes />}
                    {activeTab === 'rooms' && <AdminRooms userRole={userRole} />}
                    {activeTab === 'bookings' && <AdminBookings userRole={userRole} />}
                    {activeTab === 'messages' && userRole === 'admin' && <AdminMessages />}
                    {activeTab === 'events' && <AdminEvents userRole={userRole} />}
                </div>
            </main>
        </div>
    );
}

// --- Sub Components ---

// 0. Dashboard
function AdminDashboard() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const result = await adminService.getStats();
                if (result.status === 'success') {
                    setStats(result.data);
                }
            } catch (err) {
                console.error("Failed to fetch stats:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) return <div className="loading">Loading stats...</div>;
    if (!stats) return <div className="error">Failed to load statistics.</div>;

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

    return (
        <div className="dashboard-view">
            {/* Stats Cards */}
            <div className="stats-grid">
                <div className="stats-card">
                    <div className="stats-icon bg-blue"><BookOpen size={24} /></div>
                    <div className="stats-info">
                        <span className="stats-label">Total Bookings</span>
                        <h3 className="stats-value">{stats.total_bookings}</h3>
                    </div>
                    <div className="stats-trend pos"><TrendingUp size={16} /> 12%</div>
                </div>
                <div className="stats-card">
                    <div className="stats-icon bg-green"><DollarSign size={24} /></div>
                    <div className="stats-info">
                        <span className="stats-label">Total Revenue</span>
                        <h3 className="stats-value">${parseFloat(stats.total_revenue).toLocaleString()}</h3>
                    </div>
                    <div className="stats-trend pos"><TrendingUp size={16} /> 8%</div>
                </div>
                <div className="stats-card">
                    <div className="stats-icon bg-yellow"><Hotel size={24} /></div>
                    <div className="stats-info">
                        <span className="stats-label">Total Rooms</span>
                        <h3 className="stats-value">{stats.total_rooms}</h3>
                    </div>
                </div>
                <div className="stats-card">
                    <div className="stats-icon bg-purple"><Calendar size={24} /></div>
                    <div className="stats-info">
                        <span className="stats-label">Total Events</span>
                        <h3 className="stats-value">{stats.total_events}</h3>
                    </div>
                </div>
            </div>

            {/* Charts Section */}
            <div className="charts-grid">
                <div className="chart-container main-chart">
                    <h3>Booking Revenue Trend</h3>
                    <div style={{ width: '100%', height: 300 }}>
                        <ResponsiveContainer>
                            <AreaChart data={stats.monthly_data}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3182ce" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#3182ce" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="month" />
                                <YAxis />
                                <Tooltip />
                                <Area type="monotone" dataKey="revenue" stroke="#3182ce" fillOpacity={1} fill="url(#colorRevenue)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="chart-container">
                    <h3>Room Distribution</h3>
                    <div style={{ width: '100%', height: 300 }}>
                        <ResponsiveContainer>
                            <PieChart>
                                <Pie
                                    data={stats.room_type_dist}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {stats.room_type_dist.map((entry, index) => (
                                        <Cell key={`cell - ${index} `} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend verticalAlign="bottom" height={36} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="chart-container">
                    <h3>Booking Status</h3>
                    <div style={{ width: '100%', height: 300 }}>
                        <ResponsiveContainer>
                            <BarChart data={stats.booking_status_dist}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="value" fill="#4fd1c5" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="chart-container">
                    <h3>Monthly Bookings</h3>
                    <div style={{ width: '100%', height: 300 }}>
                        <ResponsiveContainer>
                            <LineChart data={stats.monthly_data}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="month" />
                                <YAxis />
                                <Tooltip />
                                <Line type="monotone" dataKey="count" stroke="#f6ad55" strokeWidth={2} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
}


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
                <Plus size={18} />
                Add New Room Type
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
                                    <button className="action-btn btn-edit" onClick={() => handleEdit(type)}>
                                        <Edit size={16} />
                                        Edit
                                    </button>
                                    <button className="action-btn btn-delete" onClick={() => handleDelete(type.type_id)}>
                                        <Trash2 size={16} />
                                        Delete
                                    </button>
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

    // New Guest Registration State
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
                // Auto-search and select
                const searchRes = await authService.searchUsers(newGuest.email);
                if (searchRes.data && searchRes.data.length > 0) {
                    setSelectedUser(searchRes.data[0]);
                    setUserSearch(newGuest.email); // Update the email field to show the registered email
                    alert('Guest registered and selected!');
                    setShowRegistration(false);
                    setNewGuest({ name: '', email: '', phone: '', password: 'password123' });
                } else {
                    // If search returns nothing, still try to select with a basic object
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
                user_id: selectedUser.id,
                room_id: selectedRoom.room_id,
                check_in: bookingFormData.check_in,
                check_out: bookingFormData.check_out,
                is_manual: true  // Flag for manual/cash booking
            };

            const result = await bookingService.create(bookingData);

            if (result.message === 'Booking Created') {
                // Auto-confirm manual bookings
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

            {userRole === 'admin' && (
                <button className="btn-primary" style={{ marginBottom: '1rem' }} onClick={handleAdd}>
                    <Plus size={18} />
                    Add New Room
                </button>
            )}

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
                                    <span className={`status - badge status - ${room.status} `}>
                                        {room.status}
                                    </span>
                                </td>
                                <td>
                                    {userRole === 'admin' && (
                                        <>
                                            <button className="action-btn btn-edit" onClick={() => handleEdit(room)}>
                                                <Edit size={16} />
                                                Edit
                                            </button>
                                            <button className="action-btn btn-delete" onClick={() => handleDelete(room.room_id)}>
                                                <Trash2 size={16} />
                                                Delete
                                            </button>
                                        </>
                                    )}
                                    {room.status === 'available' && (
                                        <button
                                            className="action-btn btn-primary"
                                            onClick={() => handleCreateManualBooking(room)}
                                            style={{ backgroundColor: '#28a745' }}
                                        >
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
                        <div style={{
                            backgroundColor: '#f0f9ff',
                            padding: '1rem',
                            borderRadius: '8px',
                            marginBottom: '1rem',
                            border: '1px solid #bae6fd'
                        }}>
                            <div style={{ fontWeight: '600', fontSize: '1.1rem' }}>
                                Room {selectedRoom.room_number} - {selectedRoom.room_type}
                            </div>
                            <div style={{ color: '#0369a1', fontWeight: '700', fontSize: '1.25rem', marginTop: '0.25rem' }}>
                                ${selectedRoom.price_per_night} / night
                            </div>
                        </div>

                        <form onSubmit={handleBookingSubmit}>
                            {/* Show lookup ONLY when NOT in registration mode AND no user selected */}
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
                                                    } catch (err) {
                                                        setSearchResults([]);
                                                    }
                                                } else {
                                                    setSearchResults([]);
                                                }
                                            }}
                                            placeholder="Type name or email to search..."
                                            style={{ flex: 1 }}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => {
                                                if (searchResults.length > 0) {
                                                    setSelectedUser(searchResults[0]);
                                                    setSearchResults([]);
                                                }
                                            }}
                                            className="btn-primary"
                                            style={{ padding: '0.5rem 1rem' }}
                                            disabled={searchResults.length === 0}
                                        >
                                            Select
                                        </button>
                                    </div>

                                    {/* Autocomplete Dropdown */}
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
                                            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                                            zIndex: 1000,
                                            marginTop: '2px'
                                        }}>
                                            {searchResults.map(user => (
                                                <div
                                                    key={user.id}
                                                    onClick={() => {
                                                        setSelectedUser(user);
                                                        setUserSearch('');
                                                        setSearchResults([]);
                                                    }}
                                                    style={{
                                                        padding: '0.75rem',
                                                        cursor: 'pointer',
                                                        borderBottom: '1px solid #eee',
                                                        transition: 'background-color 0.2s'
                                                    }}
                                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f0f9ff'}
                                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                                                >
                                                    <div style={{ fontWeight: '500' }}>{user.name}</div>
                                                    <div style={{ fontSize: '0.85rem', color: '#666' }}>{user.email}</div>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {userSearch.length >= 2 && searchResults.length === 0 && (
                                        <div style={{ marginTop: '0.5rem', color: '#666', fontSize: '0.9rem' }}>
                                            No users found matching "{userSearch}"
                                        </div>
                                    )}

                                    <div style={{ marginTop: '0.75rem', textAlign: 'center' }}>
                                        <span style={{ color: '#666' }}>— or —</span>
                                    </div>
                                    <div style={{ marginTop: '0.5rem', textAlign: 'center' }}>
                                        <button
                                            type="button"
                                            onClick={() => setShowRegistration(true)}
                                            className="btn-primary"
                                            style={{ backgroundColor: '#28a745' }}
                                        >
                                            + Register New Guest
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Selected User Display */}
                            {selectedUser && !showRegistration && (
                                <div style={{
                                    marginBottom: '1rem',
                                    padding: '0.75rem',
                                    backgroundColor: '#e8f5e9',
                                    borderRadius: '4px',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}>
                                    <div>
                                        <strong>✓ Guest:</strong> {selectedUser.name} ({selectedUser.email})
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => { setSelectedUser(null); setUserSearch(''); }}
                                        style={{ background: 'none', border: 'none', color: '#d32f2f', cursor: 'pointer', fontSize: '0.85rem' }}
                                    >
                                        Change
                                    </button>
                                </div>
                            )}

                            {/* Registration Form - Full Screen when active */}
                            {showRegistration && (
                                <div style={{ marginBottom: '1rem', padding: '1rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                                    <h4 style={{ marginTop: 0, marginBottom: '1rem', color: '#1e40af' }}>Register New Guest</h4>
                                    <div className="form-group">
                                        <input placeholder="Full Name *" required value={newGuest.name} onChange={e => setNewGuest({ ...newGuest, name: e.target.value })} style={{ marginBottom: '0.5rem', width: '100%' }} />
                                        <input placeholder="Email *" type="email" required value={newGuest.email} onChange={e => setNewGuest({ ...newGuest, email: e.target.value })} style={{ marginBottom: '0.5rem', width: '100%' }} />
                                        <input placeholder="Phone *" required value={newGuest.phone} onChange={e => setNewGuest({ ...newGuest, phone: e.target.value })} style={{ marginBottom: '0.5rem', width: '100%' }} />
                                        <input placeholder="Password (default: password123)" type="password" value={newGuest.password} onChange={e => setNewGuest({ ...newGuest, password: e.target.value })} style={{ width: '100%' }} />
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem' }}>
                                        <button type="button" onClick={() => setShowRegistration(false)} style={{ fontSize: '0.9rem' }}>← Back to Lookup</button>
                                        <button type="button" className="btn-primary" onClick={handleRegisterGuest} style={{ backgroundColor: '#28a745' }}>Register & Continue</button>
                                    </div>
                                </div>
                            )}

                            {/* Booking Details - Show only when user selected */}
                            {selectedUser && !showRegistration && (
                                <>
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

                                    {/* Price Calculation */}
                                    {bookingFormData.check_in && bookingFormData.check_out && (
                                        <div style={{
                                            backgroundColor: '#fef3c7',
                                            padding: '0.75rem',
                                            borderRadius: '4px',
                                            marginBottom: '1rem',
                                            border: '1px solid #f59e0b'
                                        }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <span>Nights:</span>
                                                <strong>{Math.ceil((new Date(bookingFormData.check_out) - new Date(bookingFormData.check_in)) / (1000 * 60 * 60 * 24))}</strong>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.1rem', marginTop: '0.25rem' }}>
                                                <span>Total:</span>
                                                <strong style={{ color: '#b45309' }}>
                                                    ${(Math.ceil((new Date(bookingFormData.check_out) - new Date(bookingFormData.check_in)) / (1000 * 60 * 60 * 24)) * selectedRoom.price_per_night).toFixed(2)}
                                                </strong>
                                            </div>
                                        </div>
                                    )}

                                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                                        <button type="button" onClick={() => setShowBookingModal(false)}>Cancel</button>
                                        <button type="submit" className="btn-primary">
                                            Create Booking
                                        </button>
                                    </div>
                                </>
                            )}

                            {/* Cancel button when no user selected */}
                            {!selectedUser && !showRegistration && (
                                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                                    <button type="button" onClick={() => setShowBookingModal(false)}>Cancel</button>
                                </div>
                            )}
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

// 3. Manage Bookings
function AdminBookings({ userRole }) {
    const [activeSubTab, setActiveSubTab] = useState('rooms');
    const [roomBookings, setRoomBookings] = useState([]);
    const [eventBookings, setEventBookings] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        loadBookings();
    }, []);

    const loadBookings = async () => {
        try {
            // Load room bookings
            const roomData = await bookingService.getAll();
            if (roomData.data) setRoomBookings(roomData.data);

            // Load event bookings
            const eventData = await eventService.getAllForAdmin();
            if (eventData.data) setEventBookings(eventData.data);
        } catch (err) {
            console.error('Error loading bookings:', err);
        }
    };

    const handleRoomStatus = async (id, status) => {
        if (!window.confirm(`Mark room booking as ${status}?`)) return;
        await bookingService.updateStatus(id, status);
        loadBookings();
    };

    const handleEventStatus = async (bookingId, status) => {
        if (!window.confirm(`Mark event booking as ${status}?`)) return;
        try {
            // Update event booking status
            const response = await fetch('http://localhost/aman_hotel/Backend/api/events/update_booking_status.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ booking_id: bookingId, status })
            });
            const result = await response.json();
            if (result.message === 'Booking status updated') {
                loadBookings();
            } else {
                alert('Failed to update status: ' + (result.message || 'Unknown error'));
            }
        } catch (err) {
            console.error('Error updating event booking status:', err);
            alert('Error updating status');
        }
    };

    return (
        <div>
            {/* Subtabs */}
            <div style={{
                display: 'flex',
                gap: '1rem',
                marginBottom: '1.5rem',
                borderBottom: '2px solid #e5e7eb'
            }}>
                <button
                    onClick={() => setActiveSubTab('rooms')}
                    style={{
                        padding: '0.75rem 1.5rem',
                        border: 'none',
                        background: 'none',
                        fontSize: '1rem',
                        fontWeight: '500',
                        cursor: 'pointer',
                        borderBottom: activeSubTab === 'rooms' ? '3px solid #3182ce' : '3px solid transparent',
                        color: activeSubTab === 'rooms' ? '#3182ce' : '#6b7280',
                        transition: 'all 0.2s'
                    }}
                >
                    Room Bookings ({roomBookings.length})
                </button>
                <button
                    onClick={() => setActiveSubTab('tickets')}
                    style={{
                        padding: '0.75rem 1.5rem',
                        border: 'none',
                        background: 'none',
                        fontSize: '1rem',
                        fontWeight: '500',
                        cursor: 'pointer',
                        borderBottom: activeSubTab === 'tickets' ? '3px solid #3182ce' : '3px solid transparent',
                        color: activeSubTab === 'tickets' ? '#3182ce' : '#6b7280',
                        transition: 'all 0.2s'
                    }}
                >
                    Event Tickets ({eventBookings.length})
                </button>
            </div>

            {/* Search Bar */}
            <div className="search-bar" style={{ marginBottom: '1rem', display: 'flex', gap: '0.5rem' }}>
                <input
                    type="text"
                    placeholder="Search by User Email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd', flex: 1, maxWidth: '300px' }}
                />
            </div>

            {/* Room Bookings Tab */}
            {
                activeSubTab === 'rooms' && (
                    <div className="table-container">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>User</th>
                                    <th>Room</th>
                                    <th>Check-in/out</th>
                                    <th>Payment Ref</th>
                                    <th>Status</th>
                                    <th>Refund Status</th>
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
                                        <td><small>{book.payment_ref || 'N/A'}</small></td>
                                        <td>
                                            <span className={`status-badge status-${book.status}`}>
                                                {book.status}
                                            </span>
                                        </td>
                                        <td>
                                            {book.refund_status && (
                                                <span className={`status-badge status-${book.refund_status === 'completed' ? 'confirmed' : 'pending'}`}>
                                                    {book.refund_status === 'completed' ? 'REFUND PAID' : book.refund_status.toUpperCase()}
                                                </span>
                                            )}
                                        </td>
                                        <td>
                                            {book.status === 'pending' && (
                                                <>
                                                    <button className="action-btn btn-approve" onClick={() => handleRoomStatus(book.id, 'confirmed')}>
                                                        <Check size={16} />
                                                        Approve
                                                    </button>
                                                    <button className="action-btn btn-delete" onClick={() => handleRoomStatus(book.id, 'cancelled')}>
                                                        <X size={16} />
                                                        Reject
                                                    </button>
                                                </>
                                            )}
                                            {book.status === 'confirmed' && (
                                                <button className="action-btn btn-primary" onClick={() => handleRoomStatus(book.id, 'completed')}>
                                                    <Check size={16} />
                                                    Complete
                                                </button>
                                            )}
                                            {book.status === 'cancelled' && book.refund_status === 'pending' && (
                                                <button
                                                    className="action-btn btn-primary"
                                                    style={{ backgroundColor: '#ecc94b', color: '#744210' }}
                                                    onClick={async () => {
                                                        if (window.confirm('Mark manual cash refund as COMPLETED?')) {
                                                            await bookingService.processRefund(book.id);
                                                            loadBookings();
                                                        }
                                                    }}
                                                >
                                                    <Check size={16} />
                                                    Refund
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                {roomBookings.length === 0 && <tr><td colSpan="7">No paid room bookings found.</td></tr>}
                            </tbody>
                        </table>
                    </div>
                )
            }

            {/* Event Tickets Tab */}
            {
                activeSubTab === 'tickets' && (
                    <div className="table-container">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>User</th>
                                    <th>Event</th>
                                    <th>Ticket Type</th>
                                    <th>Quantity</th>
                                    <th>Total Price</th>
                                    <th>Payment Ref</th>
                                    <th>Status</th>
                                    <th>Refund Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {eventBookings.filter(b => b.user_email.toLowerCase().includes(searchTerm.toLowerCase())).map(book => (
                                    <tr key={book.booking_id}>
                                        <td>#{book.booking_id}</td>
                                        <td>{book.user_name}<br /><small>{book.user_email}</small></td>
                                        <td>
                                            {book.event_title}<br />
                                            <small>{new Date(book.event_date).toLocaleDateString()}</small><br />
                                            <small>{book.location}</small>
                                        </td>
                                        <td>
                                            <span className={`status-badge ${book.ticket_type === 'vip' ? 'status-confirmed' : 'status-pending'}`}>
                                                {book.ticket_type.toUpperCase()}
                                            </span>
                                        </td>
                                        <td>{book.quantity}</td>
                                        <td>{parseFloat(book.total_price).toFixed(2)} Birr</td>
                                        <td><small>{book.payment_ref || 'N/A'}</small></td>
                                        <td>
                                            <span className={`status-badge status-${book.status}`}>
                                                {book.status}
                                            </span>
                                        </td>
                                        <td>
                                            {book.refund_status && (
                                                <span className={`status-badge status-${book.refund_status === 'completed' ? 'confirmed' : 'pending'}`}>
                                                    {book.refund_status === 'completed' ? 'REFUND PAID' : book.refund_status.toUpperCase()}
                                                </span>
                                            )}
                                        </td>
                                        <td>
                                            {book.status === 'pending' && (
                                                <>
                                                    <button className="action-btn btn-approve" onClick={() => handleEventStatus(book.booking_id, 'confirmed')}>
                                                        <Check size={16} />
                                                        Approve
                                                    </button>
                                                    <button className="action-btn btn-delete" onClick={() => handleEventStatus(book.booking_id, 'cancelled')}>
                                                        <X size={16} />
                                                        Reject
                                                    </button>
                                                </>
                                            )}
                                            {book.status === 'cancelled' && book.refund_status === 'pending' && (
                                                <button
                                                    className="action-btn btn-primary"
                                                    style={{ backgroundColor: '#ecc94b', color: '#744210' }}
                                                    onClick={async () => {
                                                        if (window.confirm('Mark manual cash refund as COMPLETED?')) {
                                                            await eventService.processEventRefund(book.booking_id);
                                                            loadBookings();
                                                        }
                                                    }}
                                                >
                                                    <Check size={16} />
                                                    Refund
                                                </button>
                                            )}
                                            {book.status === 'confirmed' && (
                                                <span style={{ color: '#10b981', fontWeight: '500' }}>✓ Approved</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                {eventBookings.length === 0 && <tr><td colSpan="9">No paid event bookings found.</td></tr>}
                            </tbody>
                        </table>
                    </div >
                )
            }
        </div >
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
function AdminEvents({ userRole }) {
    const [events, setEvents] = useState([]);
    const [searchTerm, setSearchTerm] = useState(''); // Added Search State
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

    // Booking State
    const [showBookingModal, setShowBookingModal] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [userSearch, setUserSearch] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [bookingFormData, setBookingFormData] = useState({ ticket_type: 'regular' });
    const [showRegistration, setShowRegistration] = useState(false);
    const [newGuest, setNewGuest] = useState({ name: '', email: '', phone: '', password: 'password123' });

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
        loadEvents();
    };

    // --- Booking Logic ---
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
            } else {
                alert(res.message || 'Registration failed');
            }
        } catch (e) {
            console.error(e);
            alert('Error creating guest account');
        }
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

    const handleSelectUser = (user) => {
        setSelectedUser(user);
        setUserSearch(user.name + ' (' + user.email + ')');
        setSearchResults([]);
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
        } catch (err) {
            console.error(err);
            alert('Booking failed');
        }
    };

    return (
        <div>
            {userRole === 'admin' && (
                <button className="btn-primary" style={{ marginBottom: '1rem' }} onClick={handleAdd}>
                    <Plus size={18} />
                    Add New Event
                </button>
            )}

            <div className="search-bar" style={{ marginBottom: '1rem' }}>
                <input
                    type="text"
                    placeholder="Search events by title..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ padding: '0.6rem', borderRadius: '6px', border: '1px solid #cbd5e0', width: '100%', maxWidth: '400px' }}
                />
            </div>
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
                        {events.filter(ev => ev.title.toLowerCase().includes(searchTerm.toLowerCase())).map(ev => (
                            <tr key={ev.event_id}>
                                <td>{ev.title}</td>
                                <td>{new Date(ev.start_time).toLocaleDateString()}</td>
                                <td>{ev.location}</td>
                                <td>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                        <small style={{ color: ev.regular_capacity - (ev.regular_available ?? 0) >= ev.regular_capacity ? 'red' : 'inherit' }}>
                                            Reg: <strong>{ev.regular_available ?? ev.regular_capacity}</strong> left / {ev.regular_capacity} total
                                            <span style={{ marginLeft: '5px', color: '#666' }}>(${ev.regular_price || 0})</span>
                                        </small>
                                        <small style={{ color: ev.vip_capacity - (ev.vip_available ?? 0) >= ev.vip_capacity ? 'red' : 'inherit' }}>
                                            VIP: <strong>{ev.vip_available ?? ev.vip_capacity}</strong> left / {ev.vip_capacity} total
                                            <span style={{ marginLeft: '5px', color: '#666' }}>(${ev.vip_price || 0})</span>
                                        </small>
                                    </div>
                                </td>
                                <td>
                                    {userRole === 'admin' && (
                                        <>
                                            <button className="action-btn btn-edit" onClick={() => handleEdit(ev)}>
                                                <Edit size={16} />
                                                Edit
                                            </button>
                                            <button className="action-btn btn-delete" onClick={() => handleDelete(ev.event_id)}>
                                                <Trash2 size={16} />
                                                Delete
                                            </button>
                                        </>
                                    )}
                                    <button className="action-btn btn-primary" onClick={() => handleManualBooking(ev)} style={{ backgroundColor: '#28a745' }}>
                                        <UserPlus size={16} />
                                        Book Ticket
                                    </button>
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
            {/* Manual Event Booking Modal */}
            {showBookingModal && selectedEvent && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>Book Event Ticket</h3>
                        <p>{selectedEvent.title} ({new Date(selectedEvent.start_time).toLocaleDateString()})</p>

                        <form onSubmit={handleBookingSubmit}>
                            {/* User Search */}
                            <div className="form-group" style={{ position: 'relative' }}>
                                <label>Search User</label>
                                <input
                                    type="text"
                                    value={userSearch}
                                    onChange={e => handleUserSearch(e.target.value)}
                                    placeholder="Search details..."
                                    required={!selectedUser}
                                />
                                {searchResults.length > 0 && (
                                    <div style={{
                                        position: 'absolute', top: '100%', left: 0, right: 0,
                                        maxHeight: '200px', overflowY: 'auto', background: 'white',
                                        border: '1px solid #ddd', zIndex: 1000
                                    }}>
                                        {searchResults.map(u => (
                                            <div key={u.id} onClick={() => handleSelectUser(u)} style={{ padding: '0.5rem', cursor: 'pointer', borderBottom: '1px solid #eee' }}>
                                                {u.name} ({u.email})
                                            </div>
                                        ))}
                                    </div>
                                )}
                                {selectedUser && <div style={{ background: '#e8f5e9', padding: '0.5rem', marginTop: '0.5rem' }}>Selected: {selectedUser.name}</div>}

                                <div style={{ textAlign: 'right', marginTop: '0.5rem' }}>
                                    <button type="button" onClick={() => setShowRegistration(true)} style={{ color: '#3182ce', background: 'none', border: 'none', cursor: 'pointer' }}>+ Add New Guest</button>
                                </div>
                            </div>

                            {showRegistration && (
                                <div style={{ marginBottom: '1rem', padding: '1rem', background: '#f8fafc', borderRadius: '4px', border: '1px solid #e2e8f0' }}>
                                    <h4 style={{ marginTop: 0 }}>New Guest</h4>
                                    <div className="form-group">
                                        <input placeholder="Name" value={newGuest.name} onChange={e => setNewGuest({ ...newGuest, name: e.target.value })} style={{ marginBottom: '0.5rem', width: '100%' }} />
                                        <input placeholder="Email" value={newGuest.email} onChange={e => setNewGuest({ ...newGuest, email: e.target.value })} style={{ marginBottom: '0.5rem', width: '100%' }} />
                                        <input placeholder="Phone" value={newGuest.phone} onChange={e => setNewGuest({ ...newGuest, phone: e.target.value })} style={{ marginBottom: '0.5rem', width: '100%' }} />
                                        <button type="button" onClick={handleRegisterGuest} className="btn-primary">Register & Select</button>
                                    </div>
                                </div>
                            )}

                            <div className="form-group">
                                <label>Ticket Type</label>
                                <select value={bookingFormData.ticket_type} onChange={e => setBookingFormData({ ...bookingFormData, ticket_type: e.target.value })}>
                                    <option value="regular">Regular (${selectedEvent.regular_price})</option>
                                    <option value="vip">VIP (${selectedEvent.vip_price})</option>
                                </select>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                                <button type="button" onClick={() => setShowBookingModal(false)}>Cancel</button>
                                <button type="submit" className="btn-primary" disabled={!selectedUser}>Confirm Booking</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

// 6. Manage Users (Admin Only)
function AdminUsers() {
    const [users, setUsers] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        name: '', email: '', password: '', role: 'receptionist', phone: ''
    });

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            const result = await adminService.getUsers();
            if (result.data && result.data.data) {
                setUsers(result.data.data);
            }
        } catch (err) {
            console.error("Failed to load users:", err);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this user?")) return;
        try {
            await adminService.deleteUser(id);
            loadUsers();
        } catch (err) {
            console.error(err);
            alert("Failed to delete user");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const result = await adminService.createUser(formData);
            if (result.data.message === 'User Created') {
                alert("User created successfully");
                setShowModal(false);
                setFormData({ name: '', email: '', password: '', role: 'receptionist', phone: '' });
                loadUsers();
            } else {
                alert(result.data.message);
            }
        } catch (err) {
            console.error(err);
            alert("Failed to create user");
        }
    };

    return (
        <div>
            <button className="btn-primary" style={{ marginBottom: '1rem' }} onClick={() => setShowModal(true)}>
                <UserPlus size={18} />
                Add New Staff
            </button>

            <div className="table-container">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(user => (
                            <tr key={user.id}>
                                <td>{user.name}</td>
                                <td>{user.email}</td>
                                <td>
                                    <span style={{
                                        padding: '4px 8px',
                                        borderRadius: '4px',
                                        backgroundColor: user.role === 'admin' ? '#e2e8f0' : '#c6f6d5',
                                        color: user.role === 'admin' ? '#2d3748' : '#22543d',
                                        fontWeight: '500',
                                        textTransform: 'capitalize'
                                    }}>
                                        {user.role}
                                    </span>
                                </td>
                                <td>
                                    {user.role !== 'admin' && (
                                        <button className="action-btn btn-delete" onClick={() => handleDelete(user.id)}>
                                            <Trash2 size={16} />
                                            Delete
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>Add New Staff Member</h3>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Name</label>
                                <input required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label>Email</label>
                                <input type="email" required value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label>Password</label>
                                <input type="password" required value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label>Role</label>
                                <select value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })}>
                                    <option value="receptionist">Receptionist</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                                <button type="button" onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className="btn-primary">Create User</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
