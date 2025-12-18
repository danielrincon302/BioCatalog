import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
const BACKEND_URL = API_URL.replace('/api', '');

// Helper function to get full image URL
export const getImageUrl = (fileUrl: string | undefined | null): string => {
  if (!fileUrl) return '';
  if (fileUrl.startsWith('http://') || fileUrl.startsWith('https://')) {
    return fileUrl;
  }
  if (fileUrl.startsWith('/storage')) {
    return `${BACKEND_URL}${fileUrl}`;
  }
  return fileUrl;
};

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Interceptor to add authentication token
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/auth/me'),
};

// Password Reset API
export const passwordApi = {
  forgotPassword: (email: string) =>
    api.post('/password/forgot', { email }),
  resetPassword: (email: string, token: string, password: string, password_confirmation: string) =>
    api.post('/password/reset', { email, token, password, password_confirmation }),
};

// Profile API
export const profileApi = {
  get: () => api.get('/profile'),
  update: (data: { name?: string; mobile?: string; whatsapp?: string; avatar_url?: string }) =>
    api.put('/profile', data),
  updatePassword: (data: { current_password: string; password: string; password_confirmation: string }) =>
    api.put('/profile/password', data),
};

// Companies API
export const companiesApi = {
  list: () => api.get('/companies'),
  get: (id: number) => api.get(`/companies/${id}`),
  create: (data: any) => api.post('/companies', data),
  update: (id: number, data: any) => api.put(`/companies/${id}`, data),
  delete: (id: number) => api.delete(`/companies/${id}`),
};

// Users API
export const usersApi = {
  list: () => api.get('/users'),
  get: (id: number) => api.get(`/users/${id}`),
  create: (data: any) => api.post('/users', data),
  update: (id: number, data: any) => api.put(`/users/${id}`, data),
  delete: (id: number) => api.delete(`/users/${id}`),
};

// Roles API
export const rolesApi = {
  list: () => api.get('/roles'),
};

// Items API
export const itemsApi = {
  list: (params?: any) => api.get('/items', { params }),
  get: (id: number) => api.get(`/items/${id}`),
  create: (data: any) => api.post('/items', data),
  update: (id: number, data: any) => api.put(`/items/${id}`, data),
  delete: (id: number) => api.delete(`/items/${id}`),
  addImages: (id: number, files: File[]) => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('images[]', file);
    });
    return api.post(`/items/${id}/images`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  deleteImage: (itemId: number, imageId: number) =>
    api.delete(`/items/${itemId}/images/${imageId}`),
};

// Collections API
export const collectionsApi = {
  list: () => api.get('/collections'),
  get: (id: number) => api.get(`/collections/${id}`),
};

// Public Catalog API
export const catalogApi = {
  list: (params?: any) => api.get('/catalog', { params }),
  get: (slug: string) => api.get(`/catalog/${slug}`),
  collections: () => api.get('/catalog/collections'),
  companies: () => api.get('/catalog/companies'),
};

export default api;
