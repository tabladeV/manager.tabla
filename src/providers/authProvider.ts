import { AuthProvider } from "@refinedev/core";
import { httpClient } from "../services/httpClient";
import { AUTH_STATE_EVENT, RESTAURANT_STATE_EVENT, dispatchAppEvent } from "../utils/appEvents";

/**
 * Extended AuthProvider with custom refresh method
 */
interface ExtendedAuthProvider extends AuthProvider {
    refresh?: () => Promise<{ success: boolean }>;
}

/**
 * Login credentials interface
 */
interface LoginCredentials {
    email: string;
    password: string;
}

/**
 * Auth response interface
 */
interface AuthResponse {
    access: string;
    refresh: string;
    user: {
        is_manager: boolean;
    };
}

// Flag to prevent multiple concurrent refresh attempts
let isRefreshing = false;
// Token refresh promise that can be reused by multiple requests
let refreshPromise: Promise<{ success: boolean }> | null = null;

// Refresh token if it's close to expiring (10 minutes)
const TOKEN_REFRESH_THRESHOLD = 10 * 60 * 1000; // 10 minutes in milliseconds
let refreshInterval: ReturnType<typeof setInterval> | null = null;

const clearAuthData = () => {
    localStorage.removeItem("isLogedIn");
    localStorage.removeItem("refresh");
    localStorage.removeItem("access");
    localStorage.removeItem("restaurant_id");
    localStorage.removeItem("permissions");
    localStorage.removeItem("is_manager");
    dispatchAppEvent(AUTH_STATE_EVENT);
    dispatchAppEvent(RESTAURANT_STATE_EVENT);
    
    if (refreshInterval) {
        clearInterval(refreshInterval);
        refreshInterval = null;
    }
};

const startRefreshTimer = (authProvider: ExtendedAuthProvider) => {
    if (refreshInterval) {
        clearInterval(refreshInterval);
    }
    // Check every 5 minutes if token needs refreshing
    refreshInterval = setInterval(async () => {
        const isLoggedIn = localStorage.getItem("isLogedIn") === "true";
        const refreshToken = localStorage.getItem("refresh");
        if (isLoggedIn && refreshToken) {
            try {
                await authProvider.refresh?.();
            } catch (error) {
                console.error("Token refresh failed", error);
            }
        }
    }, 5 * 60 * 1000); // Check every 5 minutes
};

const authProvider: ExtendedAuthProvider = {
    onError: async (error) => {
        console.error("AuthProvider error:", error);
        return Promise.reject(error);
    },

    login: async ({ email, password }: LoginCredentials) => {
        try {
            const response = await httpClient.post("/api/v1/bo/managers/login/", { email, password });
            const data = response.data;
            
            if (data.access && data.refresh) {
                localStorage.setItem("isLogedIn", "true");
                localStorage.setItem("refresh", data.refresh);
                localStorage.setItem("access", data.access); // Store access token correctly

                if (data.user?.is_manager) {
                    localStorage.setItem("is_manager", "true");
                }
                dispatchAppEvent(AUTH_STATE_EVENT);

                // Start the refresh timer after a successful login
                startRefreshTimer(authProvider);
                return Promise.resolve({ success: true });
            } else {
                return Promise.reject({ success: false, message: "Invalid response format" });
            }
        } catch (error) {
            return Promise.reject(error);
        }
    },

    logout: async () => {
        try {
            // Try to call logout API, but proceed even if it fails
            try {
                await httpClient.post("/api/v1/auth/logout/");
            } catch (error) {
                console.warn("Error during logout API call:", error);
            }
            
            // Always clear auth data and redirect
            clearAuthData();
            window.location.href = "/sign-in";
            return Promise.resolve({ success: true });
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
                redirectTo: "/sign-in",
            });
    },

    getPermissions: async () => {
        const stored = localStorage.getItem("permissions");
        return stored ? Promise.resolve(JSON.parse(stored)) : Promise.resolve([]);
    },

    getIdentity: async () => {
        const token = localStorage.getItem("access");
        if (!token) return Promise.reject({ message: "No access token available" });
        try {
            const response = await httpClient.get("/api/v1/bo/restaurants/users/me/");

            if (response.data.permissions) {
                localStorage.setItem("permissions", JSON.stringify(response.data.permissions));
            }

            if (response.data.is_manager) {
                localStorage.setItem("is_manager", "true");
            }

            return Promise.resolve(response.data);
        } catch (error) {
            return Promise.reject(error);
        }
    },

    // Shared refresh method with synchronization
    refresh: async () => {
        // If a refresh is already in progress, return that promise
        if (isRefreshing && refreshPromise) {
            return refreshPromise;
        }
        
        isRefreshing = true;
        refreshPromise = (async () => {
            try {
                const refreshToken = localStorage.getItem("refresh");
                if (!refreshToken) {
                    throw new Error("No refresh token available");
                }
                
                const response = await httpClient.post("/api/v1/auth/token/refresh/", { refresh: refreshToken });
                const data = response.data;
                
                if (data.access && data.refresh) {
                    localStorage.setItem("access", data.access);
                    localStorage.setItem("refresh", data.refresh);
                    return { success: true };
                } else {
                    throw new Error("Invalid response from refresh endpoint");
                }
            } catch (error) {
                console.error("Token refresh failed, logging out:", error);
                clearAuthData();
                window.location.href = "/sign-in";
                throw error;
            } finally {
                isRefreshing = false;
                refreshPromise = null;
            }
        })();
        
        return refreshPromise;
    },
};

// Export method to handle unauthorized responses in HTTP clients
export const handleUnauthorizedResponse = async (status: number): Promise<boolean> => {
    // If status is unauthorized/forbidden, try to refresh token first
    if (status === 401 || status === 403 || status === 411) {
        try {
            await authProvider.refresh?.();
            return true; // Token refreshed successfully
        } catch (error) {
            // Refresh failed, clearing auth data is handled in refresh method
            return false;
        }
    }
    return false;
};

export default authProvider;
