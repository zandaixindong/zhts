import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
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

// Auth
export const authApi = {
  login: async (email: string, password: string) => {
    const res = await api.post('/auth/login', { email, password });
    return res.data;
  },
};

// Analytics
export const analyticsApi = {
  getOverview: async () => {
    const res = await api.get('/analytics/overview');
    return res.data;
  },
  getRealtime: async () => {
    const res = await api.get('/analytics/realtime');
    return res.data;
  },
  getBorrowTrend: async (days = 30) => {
    const res = await api.get(`/analytics/borrow-trend?days=${days}`);
    return res.data;
  },
  getSeatUsage: async () => {
    const res = await api.get('/analytics/seat-usage');
    return res.data;
  },
  getPopularBooks: async (limit = 10) => {
    const res = await api.get(`/analytics/popular-books?limit=${limit}`);
    return res.data;
  },
  getAtmosphereTrend: async (days = 7) => {
    const res = await api.get(`/analytics/atmosphere-trend?days=${days}`);
    return res.data;
  },
  getEventParticipation: async () => {
    const res = await api.get('/analytics/event-participation');
    return res.data;
  },
  getTimeUsage: async (date?: string) => {
    const url = date ? `/analytics/time-usage?date=${date}` : '/analytics/time-usage';
    const res = await api.get(url);
    return res.data;
  },
  getCategoryDistribution: async () => {
    const res = await api.get('/analytics/category-distribution');
    return res.data;
  },
  getAnomalies: async () => {
    const res = await api.get('/analytics/anomalies');
    return res.data;
  },
  getOpsCenter: async () => {
    const res = await api.get('/analytics/ops-center');
    return res.data;
  },
  getLibraryStrategy: async () => {
    const res = await api.get('/analytics/library-strategy');
    return res.data;
  },
  getDailyBrief: async (templateType?: string) => {
    const url = templateType ? `/analytics/daily-brief?templateType=${templateType}` : '/analytics/daily-brief';
    const res = await api.get(url);
    return res.data;
  },
  exportOverviewReport: async () => {
    const res = await api.get('/analytics/export/overview', { responseType: 'blob' });
    return res.data;
  },
  exportSeatUsageReport: async () => {
    const res = await api.get('/analytics/export/seat-usage', { responseType: 'blob' });
    return res.data;
  },
};

// Admin CRUD
export const adminApi = {
  getStats: async () => {
    const response = await api.get('/admin/stats');
    return response.data;
  },
  getProcurementSuggestions: async () => {
    const response = await api.get('/analytics/procurement-suggestions');
    return response.data;
  },
  getBooks: async () => {
    const res = await api.get('/admin/books');
    return res.data;
  },
  createBook: async (data: any) => {
    const res = await api.post('/admin/books', data);
    return res.data;
  },
  updateBook: async (id: string, data: any) => {
    const res = await api.put(`/admin/books/${id}`, data);
    return res.data;
  },
  deleteBook: async (id: string) => {
    const res = await api.delete(`/admin/books/${id}`);
    return res.data;
  },
  getFloors: async () => {
    const res = await api.get('/admin/floors');
    return res.data;
  },
  createFloor: async (data: any) => {
    const res = await api.post('/admin/floors', data);
    return res.data;
  },
  updateFloor: async (id: string, data: any) => {
    const res = await api.put(`/admin/floors/${id}`, data);
    return res.data;
  },
  deleteFloor: async (id: string) => {
    const res = await api.delete(`/admin/floors/${id}`);
    return res.data;
  },
  getSeats: async (floorId: string) => {
    const res = await api.get(`/admin/seats/${floorId}`);
    return res.data;
  },
  createSeat: async (data: any) => {
    const res = await api.post('/admin/seats', data);
    return res.data;
  },
  updateSeat: async (id: string, data: any) => {
    const res = await api.put(`/admin/seats/${id}`, data);
    return res.data;
  },
  deleteSeat: async (id: string) => {
    const res = await api.delete(`/admin/seats/${id}`);
    return res.data;
  },
  getEvents: async () => {
    const res = await api.get('/admin/events');
    return res.data;
  },
  createEvent: async (data: any) => {
    const res = await api.post('/admin/events', data);
    return res.data;
  },
  updateEvent: async (id: string, data: any) => {
    const res = await api.put(`/admin/events/${id}`, data);
    return res.data;
  },
  deleteEvent: async (id: string) => {
    const res = await api.delete(`/admin/events/${id}`);
    return res.data;
  },
  getUsers: async () => {
    const res = await api.get('/admin/users');
    return res.data;
  },
};

export default api;
