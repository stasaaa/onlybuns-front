// axios/axios.js
import axios from 'axios'

const apiClient = axios.create({
  baseURL: 'http://localhost:8080/',  // Proverite da li je ovo tačan URL
  headers: {
    'Content-Type': 'application/json'
  }
});

// Dodajte interceptor za automatsko dodavanje tokena
apiClient.interceptors.request.use(
  config => {
      const token = sessionStorage.getItem('token');
      if (token) {
          config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
  },
  error => {
      return Promise.reject(error);
  }
);

export default apiClient