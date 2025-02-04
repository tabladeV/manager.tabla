import jwtDecode from "jwt-decode";

const API_URL = "https://api.dev.tabla.ma"; // Replace with your actual API base URL

const authProvider = {
  login: async ({ email, password }: { email: string; password: string }) => {
    const response = await fetch(`${API_URL}/api/v1/auth/login/`, {
      method: "POST",
      body: JSON.stringify({ email, password }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Login failed");
    }

    const data = await response.json();
    localStorage.setItem("token", data.access_token);
    localStorage.setItem("refresh_token", data.refresh_token);
  },

  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("refresh_token");
    return Promise.resolve();
  },

  checkError: async (error: { status: number }) => {
    const status = error.status;
    if (status === 401) {
      try {
        await authProvider.refreshToken();
        return Promise.resolve();
      } catch (err) {
        return authProvider.logout();
      }
    }

    return Promise.resolve();
  },

  checkAuth: () => {
    const token = localStorage.getItem("token");
    if (!token) {
      return Promise.reject("Token not found");
    }

    const decodedToken: any = jwtDecode(token);
    if (decodedToken.exp * 1000 < Date.now()) {
      return authProvider.refreshToken();
    }

    return Promise.resolve();
  },

  getPermissions: () => Promise.resolve(),

  refreshToken: async () => {
    const refreshToken = localStorage.getItem("refresh_token");
    if (!refreshToken) {
      return Promise.reject("No refresh token");
    }

    const response = await fetch(`${API_URL}/refresh`, {
      method: "POST",
      body: JSON.stringify({ refresh_token: refreshToken }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      authProvider.logout();
      return Promise.reject("Refresh token failed");
    }

    const data = await response.json();
    localStorage.setItem("token", data.access_token);
    return Promise.resolve();
  },
};

export default authProvider;
