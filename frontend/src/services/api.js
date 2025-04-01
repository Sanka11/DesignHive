// src/services/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:9090/api', // Update if different port
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
