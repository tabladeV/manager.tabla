import axios from "axios";
import { getSubdomain } from "../utils/getSubdomain";
import { Capacitor } from '@capacitor/core';
import { handleUnauthorizedResponse } from "./authProvider";

/**
 * Formats Django API errors into a readable message
 */
const formatDjangoErrorMessage = (error: { response: { data: any; status: any; statusText: any; }; message: any; }) => {
  if (!error.response || !error.response.data) {
    return error.message || 'A network error occurred';
  } else if (error.response?.status >= 500) {
    return error.message || 'Internal Server Error';
  }

  const djangoError = error.response.data;
  const messages = [];

  // Add non_field_errors
  if (djangoError.non_field_errors) {
    const nonFieldErrors = Array.isArray(djangoError.non_field_errors)
      ? djangoError.non_field_errors
      : [djangoError.non_field_errors];
    messages.push(...nonFieldErrors);
  }

  // Add detail field (common in DRF for 400, 403, etc.)
  if (djangoError.detail && !djangoError.non_field_errors) {
    messages.push(djangoError.detail);
  }

  const errorData = { ...djangoError };

  // Handle 'message': only process if it's a string or array of strings
  if (errorData.message) {
    if (typeof errorData.message === 'string') {
      messages.push(errorData.message);
      delete errorData.message;
    } else if (Array.isArray(errorData.message) && errorData.message.every((item: any) => typeof item === 'string')) {
      messages.push(...errorData.message);
      delete errorData.message;
    }
    // If 'message' is an object (like a field error dict), it'll be caught in Step 3
  }
  
  // Handle 'error_code': only process if it's a string or array of strings
  if (errorData.error_code) {
    let errorCodes: string[] = [];
    
    if (typeof errorData.error_code === 'string') {
      errorCodes = [errorData.error_code];
    } else if (Array.isArray(errorData.error_code) && errorData.error_code.every((item: any) => typeof item === 'string')) {
      errorCodes = errorData.error_code;
    }
    
    if (errorCodes.length > 0) {
        messages.push(`Error Code(s): ${errorCodes.join(', ')}`);
        delete errorData.error_code;
    }
  }

  // Add field-specific errors
  // comment for now
  // Object.entries(djangoError).forEach(([key, value]) => {
  //   if (key !== 'non_field_errors' && key !== 'detail') {
  //     // Convert field name to readable format
  //     const readableField = key
  //       .split('_')
  //       .map(word => word.charAt(0).toUpperCase() + word.slice(1))
  //       .join(' ');

  //     const fieldErrors = Array.isArray(value) ? value : [value];
  //     messages.push(`${readableField}: ${fieldErrors.join(', ')}`);
  //   }
  // });

  // If no specific errors were found, use a generic message
  if (messages.length === 0) {
    messages.push(`Error ${error.response.status}: ${error.response.statusText || 'Unknown error'}`);

    // Try to add the raw error data if it exists and isn't empty
    try {
      if (Object.keys(djangoError).length > 0) {
        messages.push(JSON.stringify(djangoError));
      }
    } catch {
      messages.push('An unknown error occurred');
    }
  }

  return messages.join('\n');
};

// Check if running on iOS platform
const isIOS = Capacitor.getPlatform() === 'ios';

// On iOS, withCredentials can cause CORS issues
const useCredentials = !isIOS;

if (useCredentials) {
  axios.defaults.withCredentials = true;
}

const API_HOST = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL : "https://api.dev.tabla.ma";
const axiosInstance = axios.create({
  baseURL: API_HOST,
  withCredentials: useCredentials,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Request interceptor to add the restaurant header from localStorage.
axiosInstance.interceptors.request.use(
  (config) => {
    const restaurantId = localStorage.getItem("restaurant_id");
    if (restaurantId) {
      config.headers["X-Restaurant-ID"] = Number(restaurantId);
    }
    
    // Add this block to set Authorization header
    const token = localStorage.getItem("access");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle unauthorized responses and format errors
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error.response?.status;

    // Handle authentication errors
    if (status === 401 || status === 403 || status === 411) {
      try {
        // Try to refresh token
        const refreshed = await handleUnauthorizedResponse(status);
        if (refreshed) {
          // Token refreshed, retry the original request with new token
          const originalRequest = error.config;
          // Make sure to use the new access token
          originalRequest.headers["Authorization"] = `Bearer ${localStorage.getItem("access")}`;
          return axios(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, will redirect to login
        return Promise.reject(error);
      }
    }

    // Add formatted error message
    error.formattedMessage = formatDjangoErrorMessage(error);

    return Promise.reject(error);
  }
);

export default axiosInstance;