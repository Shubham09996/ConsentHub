import axios from 'axios';

const API_URL = 'http://localhost:5000/api'; // Backend URL

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach Token automatically
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle 401 (Unauthorized)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (email, password, role) => api.post('/auth/login', { email, password, role }),
  register: (data) => api.post('/auth/register', data),
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
  }
};

export const ownerAPI = {
  getProfile: () => api.get('/owner/profile'),
  getRequests: () => api.get('/owner/requests'), // Pending requests [cite: 23]
  respondToRequest: (id, status) => api.put(`/owner/requests/${id}`, { status }), // Approve/Reject [cite: 24]
  revokeAccess: (consumerId) => api.post('/owner/revoke', { consumerId }), // Revoke [cite: 25]
  getLogs: () => api.get('/owner/logs'), // Audit logs [cite: 26]
};

export const consumerAPI = {
  searchOwner: (query) => api.get(`/consumer/search?q=${query}`), // Search [cite: 29]
  requestAccess: (ownerId) => api.post('/consumer/request', { ownerId }), // Request [cite: 30]
  getData: (ownerId) => api.get(`/consumer/data/${ownerId}`), // View Data [cite: 31]
};

export default api;