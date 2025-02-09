// src/authProvider.ts
import { AuthProvider } from "@refinedev/core";
import axiosInstance from "./axiosInstance";

// We extend AuthProvider with our custom refresh method.
type ExtendedAuthProvider = AuthProvider & {
    refresh?: () => Promise<any>;
};

let refreshInterval: ReturnType<typeof setInterval> | null = null;

const startRefreshTimer = (authProvider: ExtendedAuthProvider) => {
    if (refreshInterval) {
        clearInterval(refreshInterval);
    }
    // Set an interval of 50 minutes (50 * 60 * 1000 ms)
    refreshInterval = setInterval(async () => {
        const isLoggedIn = localStorage.getItem("isLogedIn") === "true";
        const refreshToken = localStorage.getItem("refresh");
        if (isLoggedIn && refreshToken) {
            try {
                await authProvider.refresh?.();
                console.log("Token refreshed successfully");
            } catch (error) {
                console.error("Token refresh failed", error);
            }
        }
    }, 50 * 60 * 1000);
};

const authProvider: ExtendedAuthProvider = {
    onError: async (error) => {
        console.error("AuthProvider error:", error);
        return Promise.reject(error);
    },

    login: async ({ username, password }) => {
        try {
            const response = await axiosInstance.post("/auth/login", { username, password });
            if (response.data.token) {
                localStorage.setItem("isLogedIn", "true");
                localStorage.setItem("refresh", response.data.refresh);
                // Start the refresh timer after a successful login.
                startRefreshTimer(authProvider);
                return Promise.resolve({ success: true });
            } else {
                return Promise.reject({ success: false });
            }
        } catch (error) {
            return Promise.reject(error);
        }
    },

    logout: async () => {
        localStorage.removeItem("isLogedIn");
        localStorage.removeItem("refresh");
        localStorage.removeItem("restaurant_id");
        if (refreshInterval) {
            clearInterval(refreshInterval);
            refreshInterval = null;
        }
        return Promise.resolve({ success: true });
    },

    check: async () => {
        return localStorage.getItem("isLogedIn")
            ? Promise.resolve({ authenticated: true })
            : Promise.reject({ authenticated: false });
    },

    getPermissions: async () => Promise.resolve(),

    getIdentity: async () => {
        const token = localStorage.getItem("token");
        if (!token) return Promise.reject();
        try {
            const response = await axiosInstance.get("/auth/me");
            return Promise.resolve(response.data);
        } catch (error) {
            return Promise.reject();
        }
    },

    // Custom refresh method to update the refresh token.
    refresh: async () => {
        try {
            const refreshToken = localStorage.getItem("refresh");
            if (!refreshToken) {
                return Promise.reject("No refresh token available");
            }
            const response = await axiosInstance.post("/api/v1/auth/token/refresh/", { refresh: refreshToken });
            if (response.data.refresh) {
                localStorage.setItem("refresh", response.data.refresh);
                return Promise.resolve({ success: true });
            } else {
                return Promise.reject({ success: false });
            }
        } catch (error) {
            return Promise.reject(error);
        }
    },
};

export default authProvider;
