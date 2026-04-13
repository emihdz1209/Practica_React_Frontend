import axios from 'axios';

const apiClient = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token from localStorage on every request (real backend only)
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers['Authorization'] = 'Bearer ' + token;
  }
  return config;
});

// When REACT_APP_MOCK=true (set in .env.local) swap in the in-memory mock client
// so the frontend runs standalone without the Spring Boot backend.
let client = apiClient;
if (process.env.REACT_APP_MOCK === 'true') {
  // Dynamic require keeps the mock bundle out of production builds
  const { default: mockApiClient } = require('../../mocks/mockApiClient');
  client = mockApiClient;
}

export default client;
