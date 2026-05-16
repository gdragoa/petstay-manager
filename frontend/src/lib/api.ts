import axios from 'axios';

export const apiBase = import.meta.env.VITE_API_URL ?? '/api';

const api = axios.create({ baseURL: apiBase });

api.interceptors.response.use(
  res => res.data,
  err => Promise.reject(err.response?.data || err)
);

export default api;
