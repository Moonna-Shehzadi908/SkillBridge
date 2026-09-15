import {
  clearTokens,
  getAccessToken,
  refreshAccessToken,
} from "./auth";

const API_URL = "http://127.0.0.1:8000";

export const apiFetch = async (
  endpoint: string,
  options: RequestInit = {},
): Promise<Response> => {
  let accessToken = getAccessToken();

  const makeRequest = async (token: string | null) => {
    const headers = new Headers(options.headers);

    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    if (
      options.body &&
      !(options.body instanceof FormData) &&
      !headers.has("Content-Type")
    ) {
      headers.set("Content-Type", "application/json");
    }

    return fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });
  };

  // First request
  let response = await makeRequest(accessToken);

  // If access token expired/invalid
  if (response.status === 401) {
    const newAccessToken = await refreshAccessToken();

    if (!newAccessToken) {
      clearTokens();
      window.location.href = "/login";
      return response;
    }

    accessToken = newAccessToken;

    // Retry original request with fresh token
    response = await makeRequest(accessToken);
  }

  return response;
};

export default apiFetch;