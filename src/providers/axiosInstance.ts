import axios from "axios";

/**
 * Formats Django API errors into a readable message
 */
const formatDjangoErrorMessage = (error: { response: { data: any; status: any; statusText: any; }; message: any; }) => {
  if (!error.response || !error.response.data) {
    return error.message || 'A network error occurred';
  } else if (error.response?.status>=500){
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
  
  // Add field-specific errors
  Object.entries(djangoError).forEach(([key, value]) => {
    if (key !== 'non_field_errors' && key !== 'detail') {
      // Convert field name to readable format
      const readableField = key
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      
      const fieldErrors = Array.isArray(value) ? value : [value];
      messages.push(`${readableField}: ${fieldErrors.join(', ')}`);
    }
  });
  
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

axios.defaults.withCredentials = true;
const API_HOST = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL : "https://api.dev.tabla.ma";
const axiosInstance = axios.create({
  baseURL: API_HOST,
  withCredentials: true
});

// Request interceptor to add the restaurant header from localStorage.
axiosInstance.interceptors.request.use(
  (config) => {
    const restaurantId = localStorage.getItem("restaurant_id");
    if (restaurantId) {
      config.headers["X-Restaurant-ID"] = Number(restaurantId);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle unauthorized responses and format errors
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    
    // Handle authentication errors
    if (status === 401 || status === 411 || status === 403) {
      localStorage.removeItem("isLogedIn");
      localStorage.removeItem("restaurant_id");
      localStorage.removeItem("refresh");
      localStorage.removeItem("permissions");
      localStorage.removeItem("is_manager");

      window.location.href = "/sign-in";
      
      // Return a cleaner error for auth issues
      const authError = new Error('Authentication required');
      return Promise.reject(authError);
    }
    
    // Add formatted error message
    error.formattedMessage = formatDjangoErrorMessage(error);
    
    return Promise.reject(error);
  }
);

export default axiosInstance;