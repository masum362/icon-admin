// utils/axios.js
import axios from "axios";
import Cookies from "js-cookie";

const axiosInstance = axios.create({
  baseURL: "https://sandbox.iconadmissionaid.com/api/v1", // Replace with your backend URL
  headers: {
    "Content-Type": "application/json",
  },
});

let isRefreshing = false;
let failedQueue: any = [];

// Add failed requests to a queue and process them once a new token is available
const processQueue = (error: any, token = null) => {
  failedQueue.forEach((promise: any) => {
    if (token) {
      promise.resolve(token);
    } else {
      promise.reject(error);
    }
  });
  failedQueue = [];
};

// Add a request interceptor to include the Authorization header
axiosInstance.interceptors.request.use(
  (config) => {
    const token = Cookies.get("token"); // Get the token from cookies
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle 401 errors
axiosInstance.interceptors.response.use(
  (response) => response, // Pass through successful responses
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // Handle token refresh logic
      if (!isRefreshing) {
        isRefreshing = true;
        try {
          const oldToken = Cookies.get("token");

          // Call the refresh token API
          const response = await axios.get(
            "https://sandbox.iconadmissionaid.com/api/v1/auth/refresh-token",
            {
              headers: {
                Authorization: `Bearer ${oldToken}`,
              },
            }
          );

          const newToken = response.data.accessToken;

          // Save the new token to cookies
          Cookies.set("token", newToken);

          // Process queued requests with the new token
          processQueue(null, newToken);

          isRefreshing = false;

          // Retry the original request with the new token
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return axiosInstance(originalRequest);
        } catch (refreshError) {
          // Delete the old token on refresh error
          Cookies.remove("token");
          console.error(
            "Token refresh failed. Old token deleted:",
            refreshError
          );

          isRefreshing = false;
          processQueue(refreshError, null);

          // Refresh the page to force a re-login
          window.location.reload();

          return Promise.reject(refreshError);
        }
      }

      // Queue the failed requests while the token is being refreshed
      return new Promise((resolve, reject) => {
        failedQueue.push({
          resolve: (token: any) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(axiosInstance(originalRequest));
          },
          reject: (err: any) => reject(err),
        });
      });
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
