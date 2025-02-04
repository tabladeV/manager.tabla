import { dataProvider as refineDataProvider } from "@refinedev/simple-rest";

const API_URL = "https://api.dev.tabla.ma";

// Function to get the token from localStorage
const getToken = async () => {
  let token = localStorage.getItem("token");

  // Check if token is expired
  const isExpired = (token: string) => {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.exp * 1000 < Date.now();
  };

  if (token && isExpired(token)) {
    const refreshToken = localStorage.getItem("refresh_token");

    if (!refreshToken) {
      return null;
    }

    // Refresh the token
    const refreshResponse = await fetch(`${API_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    if (!refreshResponse.ok) {
      return null;
    }

    const newData = await refreshResponse.json();
    localStorage.setItem("token", newData.access_token);
    localStorage.setItem("refresh_token", newData.refresh_token);
    token = newData.access_token;
  }

  return token;
};

// Custom dataProvider that adds Authorization header
const customDataProvider = async (resource: string, params: any) => {
  const baseProvider = refineDataProvider(API_URL);
  const token = await getToken();

  if (!token) {
    throw new Error("Unauthorized");
  }

  return baseProvider(resource, {
    ...params,
    headers: {
      ...params.headers,
      Authorization: `Bearer ${token}`,
    },
  });
};

export default customDataProvider;
