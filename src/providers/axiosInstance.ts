// src/providers/axiosInstance.ts
import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "https://api.dev.tabla.ma", // Your API base URL
});

// Request interceptor to add the restaurant header from localStorage.
axiosInstance.interceptors.request.use(
  (config) => {
    const restaurantId = localStorage.getItem("restaurant_id");
    if (restaurantId) {
      config.headers["X-Restaurant-ID"] = restaurantId;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle unauthorized responses.
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    if (status === 401 || status === 411 || status === 403) {
      // Remove auth flag if the response indicates an unauthorized status.
      localStorage.removeItem("isLogedIn");
      localStorage.removeItem("restaurant_id");
      localStorage.removeItem("refresh");
      // Optionally, redirect the user to the login page.
      window.location.href = "/sign-in";
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
