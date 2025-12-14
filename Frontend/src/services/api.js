import axios from 'axios';

// Base URL for the PHP Backend
// Adjust if your XAMPP path is different
const API_URL = 'http://localhost/aman_hotel/Backend/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const authService = {
    login: async (email, password) => {
        const response = await api.post('/auth/login.php', { email, password });
        return response.data;
    },
    register: async (userData) => {
        const response = await api.post('/auth/register.php', userData);
        return response.data;
    },
    searchUsers: async (searchTerm = '') => {
        const response = await api.get(`/auth/search_users.php?search=${encodeURIComponent(searchTerm)}`);
        return response.data;
    },
};

export const roomService = {
    getAll: async () => {
        const response = await api.get('/rooms/read.php');
        return response.data;
    },
    getSingle: async (id) => {
        const response = await api.get(`/rooms/read_single.php?id=${id}`);
        return response.data;
    },
    getRoomsByType: async (typeId, status = 'available') => {
        const response = await api.get(`/rooms/read_by_type.php?type_id=${typeId}&status=${status}`);
        return response.data;
    },
    checkAvailability: async (checkIn, checkOut, roomTypeId = '') => {
        let url = `/rooms/check_availability_new.php?check_in=${checkIn}&check_out=${checkOut}`;
        if (roomTypeId) {
            url += `&room_type_id=${roomTypeId}`;
        }
        const response = await api.get(url);
        return response.data;
    },
    // Admin
    create: async (roomData) => {
        const response = await api.post('/rooms/create.php', roomData);
        return response.data;
    },
    update: async (roomData) => {
        const response = await api.put('/rooms/update.php', roomData);
        return response.data;
    },
    delete: async (id) => {
        const response = await api.delete(`/rooms/delete.php?id=${id}`);
        return response.data;
    }
};

export const roomTypeService = {
    getAll: async () => {
        const response = await api.get('/room-types/read.php');
        return response.data;
    },
    getAvailability: async () => {
        const response = await api.get('/room-types/availability.php');
        return response.data;
    },
    getSingle: async (id) => {
        const response = await api.get(`/room-types/read_single.php?id=${id}`);
        return response.data;
    },
    checkAvailability: async (checkIn, checkOut) => {
        const response = await api.get(`/rooms/check_availability_new.php?check_in=${checkIn}&check_out=${checkOut}`);
        return response.data;
    },
    // Admin
    create: async (typeData) => {
        const response = await api.post('/room-types/create.php', typeData);
        return response.data;
    },
    update: async (typeData) => {
        const response = await api.put('/room-types/update.php', typeData);
        return response.data;
    },
    delete: async (id) => {
        const response = await api.delete(`/room-types/delete.php?id=${id}`);
        return response.data;
    }
};

export const bookingService = {
    create: async (bookingData) => {
        const response = await api.post('/bookings/create.php', bookingData);
        return response.data;
    },
    getUserBookings: async (userId) => {
        const response = await api.get(`/bookings/read_user.php?user_id=${userId}`);
        return response.data;
    },
    // Admin
    getAll: async () => {
        const response = await api.get('/bookings/read_all.php');
        return response.data;
    },
    updateStatus: async (id, status) => {
        const response = await api.put('/bookings/update.php', { id, status });
        return response.data;
    },
    getReceipt: async (bookingId) => {
        const response = await api.get(`/bookings/read_receipt.php?booking_id=${bookingId}`);
        return response.data;
    }
};

export const contactService = {
    sendMessage: async (messageData) => {
        const response = await api.post('/contact/create.php', messageData);
        return response.data;
    },
    // Admin
    getAll: async () => {
        const response = await api.get('/contact/read.php');
        return response.data;
    }
};

export const eventService = {
    getAll: async () => {
        const response = await api.get('/events/read.php');
        return response.data;
    },
    // Admin
    create: async (eventData) => {
        const response = await api.post('/events/create.php', eventData);
        return response.data;
    },
    update: async (eventData) => {
        const response = await api.put('/events/update.php', eventData);
        return response.data;
    },
    delete: async (eventId) => {
        const response = await api.post('/events/delete.php', { event_id: eventId });
        return response.data;
    }
};

export const paymentService = {
    initialize: async (bookingId) => {
        const response = await api.post('/payment/initialize.php', { booking_id: bookingId });
        return response.data;
    },
    verify: async (txRef) => {
        const response = await api.post('/payment/verify.php', { tx_ref: txRef });
        return response.data;
    }
};

export default api;
