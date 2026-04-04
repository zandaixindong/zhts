import axios from 'axios';
import type {
  AISearchResponse,
  AIRecommendationResponse,
  Floor,
  Seat,
  AISeatResponse,
  ChatMessage,
  Notification,
  Book,
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => {
    // Unwrap the successResponse wrapper from backend
    if (response.data && response.data.success && response.data.data !== undefined) {
      response.data = response.data.data;
    }
    return response;
  },
  (error) => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Book search
export const aiSearchBooks = async (query: string): Promise<AISearchResponse> => {
  const response = await api.post('/books/search', { query, userId: 'demo-user-id' });
  return response.data;
};

export const searchByIsbn = async (isbn: string): Promise<Book | null> => {
  const response = await api.get(`/books/isbn/${isbn}`);
  return response.data;
};

export const subscribeBook = async (bookId: string): Promise<{ success: boolean; message: string }> => {
  const response = await api.post('/books/subscribe', { bookId, userId: 'demo-user-id' });
  return response.data;
};

export const getBookSummary = async (bookId: string): Promise<{ summary: string; insights: string[] }> => {
  const response = await api.post('/recommendations/summary', { bookId });
  return response.data;
};

// Book API namespace
export const booksApi = {
  aiSearch: aiSearchBooks,
  searchByIsbn,
  subscribe: subscribeBook,
  getSummary: getBookSummary,
};

// Recommendations
export const getPersonalizedRecommendations = async (): Promise<AIRecommendationResponse> => {
  const response = await api.get('/recommendations/for-you?userId=demo-user-id');
  return response.data;
};

// Seats
export const getFloors = async (): Promise<Floor[]> => {
  const response = await api.get('/seats/floors');
  return response.data;
};

export const getSeatsByFloor = async (floorId: string): Promise<Seat[]> => {
  const response = await api.get(`/seats/floor/${floorId}`);
  return response.data;
};

export const aiFindSeats = async (query: string, floorId: string): Promise<AISeatResponse> => {
  const response = await api.post('/seats/find', { query, floorId, userId: 'demo-user-id' });
  return response.data;
};

export const reserveSeat = async (seatId: string, duration: number, userId: string, startTime?: Date): Promise<{ success: boolean; message: string }> => {
  const response = await api.post('/seats/reserve', { seatId, duration, userId, startTime });
  return response.data;
};

export const cancelReservation = async (seatId: string, userId: string): Promise<{ success: boolean; message: string }> => {
  const response = await api.post('/seats/cancel', { seatId, userId });
  return response.data;
};

// New seat reservation management APIs
export const getCurrentReservation = async (userId: string) => {
  const response = await api.get(`/seats/my-reservation/current?userId=${userId}`);
  return response.data;
};

export const getReservationHistory = async (userId: string) => {
  const response = await api.get(`/seats/my-reservation/history?userId=${userId}`);
  return response.data;
};

export const checkInReservation = async (reservationId: string, userId: string) => {
  const response = await api.post('/seats/checkin', { reservationId, userId });
  return response.data;
};

export const temporaryLeaveReservation = async (reservationId: string, userId: string) => {
  const response = await api.post('/seats/temporary-leave', { reservationId, userId });
  return response.data;
};

export const unlockReservation = async (reservationId: string, userId: string) => {
  const response = await api.post('/seats/unlock', { reservationId, userId });
  return response.data;
};

export const finishReservation = async (reservationId: string, userId: string) => {
  const response = await api.post('/seats/finish', { reservationId, userId });
  return response.data;
};

export const extendReservation = async (reservationId: string, userId: string, additionalHours: number) => {
  const response = await api.post('/seats/extend', { reservationId, userId, additionalHours });
  return response.data;
};

export const checkViolationStatus = async (userId: string) => {
  const response = await api.get(`/seats/violation-check?userId=${userId}`);
  return response.data;
};

export const seatApi = {
  getAtmosphereHistory: async (floorId: string, days: number) => {
    const response = await api.get(`/seats/atmosphere-history/${floorId}?days=${days}`);
    return response.data;
  },
  recordAtmosphere: async (data: {
    floorId: string;
    noise: number;
    crowding: number;
    brightness: number;
    overall: number;
  }) => {
    const response = await api.post('/seats/atmosphere-record', data);
    return response.data;
  },
};

// Chat
export const sendChatMessage = async (messages: ChatMessage[]): Promise<ReadableStream<Uint8Array> | null> => {
  const response = await fetch(`${API_BASE_URL}/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ messages, userId: 'demo-user-id' }),
  });
  return response.body;
};

export const chatApi = {
  sendMessage: sendChatMessage,
  sendBookChatMessage: async (bookId: string, message: string, history: any[]): Promise<ReadableStream<Uint8Array> | null> => {
    const response = await fetch(`${API_BASE_URL}/chat/book-chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ bookId, message, history, userId: 'demo-user-id' }),
    });
    return response.body;
  }
};

// Notifications
export const getNotifications = async (): Promise<Notification[]> => {
  const response = await api.get('/notifications?userId=demo-user-id');
  return response.data;
};

export const markNotificationRead = async (notificationId: string): Promise<void> => {
  await api.post('/notifications/read', { notificationId });
};

// Admin API
export const adminApi = {
  // Stats
  getStats: async () => {
    const response = await api.get('/admin/stats');
    return response.data;
  },

  // Books
  getBooks: async () => {
    const response = await api.get('/admin/books');
    return response.data;
  },
  createBook: async (data: any) => {
    const response = await api.post('/admin/books', data);
    return response.data;
  },
  updateBook: async (id: string, data: any) => {
    const response = await api.put(`/admin/books/${id}`, data);
    return response.data;
  },
  deleteBook: async (id: string) => {
    const response = await api.delete(`/admin/books/${id}`);
    return response.data;
  },

  // Floors
  getFloors: async () => {
    const response = await api.get('/admin/floors');
    return response.data;
  },
  createFloor: async (data: any) => {
    const response = await api.post('/admin/floors', data);
    return response.data;
  },
  updateFloor: async (id: string, data: any) => {
    const response = await api.put(`/admin/floors/${id}`, data);
    return response.data;
  },
  deleteFloor: async (id: string) => {
    const response = await api.delete(`/admin/floors/${id}`);
    return response.data;
  },

  // Seats
  getSeats: async (floorId: string) => {
    const response = await api.get(`/admin/seats/${floorId}`);
    return response.data;
  },
  createSeat: async (data: any) => {
    const response = await api.post('/admin/seats', data);
    return response.data;
  },
  updateSeat: async (id: string, data: any) => {
    const response = await api.put(`/admin/seats/${id}`, data);
    return response.data;
  },
  deleteSeat: async (id: string) => {
    const response = await api.delete(`/admin/seats/${id}`);
    return response.data;
  },

  // Events
  getEvents: async () => {
    const response = await api.get('/admin/events');
    return response.data;
  },
  createEvent: async (data: any) => {
    const response = await api.post('/admin/events', data);
    return response.data;
  },
  updateEvent: async (id: string, data: any) => {
    const response = await api.put(`/admin/events/${id}`, data);
    return response.data;
  },
  deleteEvent: async (id: string) => {
    const response = await api.delete(`/admin/events/${id}`);
    return response.data;
  },
};

// Auth API
export const authApi = {
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },
  checkOverdue: async (userId: string) => {
    const response = await api.post('/auth/check-overdue', { userId });
    return response.data;
  },
};

// My Activity API
export const myActivityApi = {
  getBorrowings: async (userId: string) => {
    const response = await api.get(`/my-activity/borrowing/${userId}`);
    return response.data;
  },
  getReservations: async (userId: string) => {
    const response = await api.get(`/my-activity/reservations/${userId}`);
    return response.data;
  },
  getPersona: async (userId: string) => {
    const response = await api.get(`/my-activity/persona/${userId}`);
    return response.data;
  },
};

// QR Check-in API
export const qrCheckinApi = {
  verify: async (reservationId: string, userId: string) => {
    const response = await api.post('/qr-checkin/verify', { reservationId, userId });
    return response.data;
  },
};

export default api;
