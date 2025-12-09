// src/lib/axios.ts
import axios from 'axios';

const api = axios.create({
    // Pastikan URL ini sama dengan port Laravel kamu (default 8000)
    baseURL: 'http://127.0.0.1:8000/api', 
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});

// Interceptor buat nambahin Token otomatis kalo user udah login
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;