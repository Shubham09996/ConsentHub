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
  },
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
};


export const ownerAPI = {
  getProfile: () => api.get('/owner/profile'),
  getRequests: () => api.get('/owner/requests'), // Pending requests [cite: 23]
  getActiveConnections: () => api.get('/owner/connections'), // Active Connections
  respondToRequest: (id, status) => api.put(`/owner/request/${id}`, { status }), // Approve/Reject [cite: 24]
  revokeAccess: (connectionId) => api.post('/owner/revoke', { connectionId }), // Revoke [cite: 25]
  getLogs: () => api.get('/owner/logs'), // Audit logs [cite: 26]
  createDataOffering: (data) => api.post('/owner/data-offerings', data),
  getDataOfferings: () => api.get('/owner/data-offerings'),
  updateDataOffering: (id, data) => api.put(`/owner/data-offerings/${id}`, data),
  deleteDataOffering: (id) => api.delete(`/owner/data-offerings/${id}`),
  createDataRecord: (data) => api.post('/owner/data-records', data),
  updateDataRecord: (id, data) => api.put(`/owner/data-records/${id}`, data),
  getDataRecordByOfferingId: (dataOfferingId) => api.get(`/owner/data-records/${dataOfferingId}`),
};

export const consumerAPI = {
  searchOwner: async (query) => {
    console.log('Attempting to search owner with query:', query);
    try {
      const response = await api.get(`/consumer/search?email=${query}`);
      return response;
    } catch (error) {
      console.error('Error during consumerAPI.searchOwner:', error);
      throw error; // Re-throw to be caught by the component
    }
  }, // Search [cite: 29]
  requestAccess: (ownerId, purpose, dataOfferingId) => {
    console.log('consumerAPI.requestAccess - Sending dataOfferingId:', dataOfferingId);
    return api.post('/consumer/request', { ownerId, purpose, dataOfferingId });
  }, // Request [cite: 30]
  getAccessList: () => api.get('/consumer/access-list'),
  getData: (ownerId, dataOfferingId) => api.get(`/consumer/data/${ownerId}?dataOfferingId=${dataOfferingId}`), // View Data [cite: 31]
    getDashboardStats: () => api.get('/consumer/dashboard-stats'),
    getApiKey: () => api.get('/consumer/api-key'),
    getDataOfferingsByOwner: (ownerId) => api.get(`/consumer/data-offerings/${ownerId}`),
    getAllOwners: () => api.get('/consumer/owners'), // New endpoint to get all owners
    revokeAccess: (accessId) => api.put(`/consumer/revoke/${accessId}`),
};

export const userAPI = {
  getProfile: () => api.get('/user/profile'),
  updateProfile: (data) => api.put('/user/profile', data),
  changePassword: (data) => api.put('/user/change-password', data),
};

export default api;