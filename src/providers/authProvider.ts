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

    login: async ({ email, password }) => {
        try {
            const response = await axiosInstance.post("/api/v1/bo/managers/login/", { email, password });
            if (response.data.token) {
                localStorage.setItem("isLogedIn", "true");
                localStorage.setItem("refresh", response.data.refresh);
                localStorage.setItem("token", response.data.refresh);

                if (response?.data.user.is_manager) {
                    localStorage.setItem("is_manager", "true");
                }

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
        try {
            const response = await axiosInstance.post("/api/v1/auth/logout/");
            if (response.status === 204 || response.status === 200) {
                localStorage.removeItem("isLogedIn");
                localStorage.removeItem("refresh");
                localStorage.removeItem("token");
                localStorage.removeItem("restaurant_id");
                localStorage.removeItem("permissions");
                localStorage.removeItem("is_manager");

                if (refreshInterval) {
                    clearInterval(refreshInterval);
                    refreshInterval = null;
                }
                window.location.href = "/sign-in";
                return Promise.resolve({ success: true });
            } else {
                return Promise.reject({ success: false });
            }
        } catch (error) {
            return Promise.reject(error);
        }
    },

    check: async () => {
        return localStorage.getItem("isLogedIn") === "true"
            ? Promise.resolve({ authenticated: true })
            : Promise.reject({
                authenticated: false,
                error: { message: "Not authenticated", name: "Unauthorized" },
                logout: true,
                redirectTo: "/login",
            });
    },

    getPermissions: async () => {
        const stored = localStorage.getItem("permissions");
        return stored ? Promise.resolve(JSON.parse(stored)) : Promise.resolve([]);
    },

    getIdentity: async () => {
        const token = localStorage.getItem("token");
        if (!token) return Promise.reject({ message: "No token available" });
        try {
            const response = await axiosInstance.get("/api/v1/bo/restaurants/users/me/");

            if (response.data.permissions) {
                localStorage.setItem("permissions", JSON.stringify(response.data.permissions));
            }

            if (response?.data.is_manager) {
                localStorage.setItem("is_manager", "true");
            }

            return Promise.resolve(response.data);
        } catch (error) {
            console.log("getIdentity error", error);
            return Promise.reject(error);
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
