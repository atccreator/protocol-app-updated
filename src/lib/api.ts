import { UserRole } from '@/types/auth.types';
import axios, { AxiosError, AxiosResponse } from 'axios';
import { includes } from 'zod';
import { RequestFormData } from '@/schemas/request.schema';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001/api/v1';

// Create axios instance
export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  withCredentials: true, // Important for httpOnly cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add CSRF token if available
    const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
    if (csrfToken) {
      config.headers['X-CSRF-Token'] = csrfToken;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor with proper error handling
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as any;

    // Handle 401 errors (token expired)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Refresh token (httpOnly cookie will be updated by backend)
        await api.post('/auth/refresh');
        
        // Retry the original request
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed, redirect to login
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Auth API endpoints
export const authApi = {
  login: (credentials: { email: string; password: string }) =>
    api.post('/auth/login', credentials),

  register: (userData: {
    username: string;
    email: string;
    password: string;
    user_type?: UserRole | undefined;
  }) => api.post('/auth/register', userData),

  refreshToken: () => api.post('/auth/refresh'),

  getCurrentUser: () => api.get('/auth/me'),

  changePassword: (data: {
    oldPassword: string;
    newPassword: string;
  }) => api.post('/auth/change-password', data),

  logout: () => api.post('/auth/logout'), // Backend should clear httpOnly cookies
};


// create request API endpoint
export const createRequestApi = {
  createRequest: (requestData: RequestFormData) => api.post('/create-request', requestData),
}

export const getUserRequestStatusApi = {
  getRequestStatus: () => api.get('/my-requests'),
}

// Protocol In-charge API endpoints
export const protocolInchargeApi = {
  // Fetch all requests with status=pending
  getPendingRequests: (page: number = 1, limit: number = 10) =>
    api.get('/requests', { params: { reqStatus: 'pending', page, limit } }),

  // Assign protocol officer to a request
  assignOfficer: (payload: {
    requestId: number;
    officerId: number;
    priority: 'high' | 'medium' | 'low';
    remarks?: string;
  }) => api.post('/protocol/assign', payload),

  // Add service requests to an existing request
  addVehicleRequest: (
    requestId: number,
    payload: {
      vehicle_type?: string | null;
      vehicle_number?: string | null;
      driver_name?: string | null;
      driver_contact_no?: string | null;
    }
  ) => api.post(`/requests/${requestId}/vehicle-requests`, payload),

  addGuesthouseRequest: (
    requestId: number,
    payload: {
      guesthouse_location?: string | null;
    }
  ) => api.post(`/requests/${requestId}/guesthouse-requests`, payload),

  addOtherRequest: (requestId: number, payload: { purpose: string }) =>
    api.post(`/requests/${requestId}/other-requests`, payload),
}

export const usersApi = {
  listProtocolOfficers: (search?: string) => api.get('/users', { params: { search } }),
}



// Generic API error handler
export const handleApiError = (error: unknown): string => {
  if (error instanceof AxiosError) {
    // Handle specific error cases
    if (error.code === 'ECONNREFUSED') {
      return 'Unable to connect to server. Please try again later.';
    }
    
    if (error.response?.status === 429) {
      return 'Too many requests. Please wait and try again.';
    }
    
    if (error.response?.data?.error) {
      return error.response.data.error;
    }
    
    if (error.response?.data?.message) {
      return error.response.data.message;
    }
    
    if (error.message) {
      return error.message;
    }
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  return 'An unexpected error occurred. Please try again.';
};

export default api;