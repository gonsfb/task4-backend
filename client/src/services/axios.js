import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000', // Update this to the correct back-end URL
});

// Attach token to each request if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`; // Corrected spelling here
  }
  return config;
});

export default api;

