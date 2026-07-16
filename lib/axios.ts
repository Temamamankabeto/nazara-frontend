import axios from "axios";
import { toast } from "sonner";

const api = axios.create({
  baseURL:
    process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api",
  timeout: Number(process.env.NEXT_PUBLIC_API_TIMEOUT || 15000),
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("authToken");

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,

  (error) => {
    if (!error.response) {
      toast.error(
        "Network error. Please check your internet connection or backend server."
      );
      return Promise.reject(error);
    }

    const status = error.response.status;
    const message =
      error.response.data?.message ||
      error.response.data?.error ||
      `Request failed with status ${status}`;

    switch (status) {
      case 401:
        if (typeof window !== "undefined") {
          localStorage.removeItem("authToken");
          localStorage.removeItem("user");

          if (!window.location.pathname.startsWith("/auth/login")) {
            window.location.href = "/auth/login";
          }
        }
        break;

      case 403:
        toast.error(message || "Access denied.");
        break;

      case 404:
        toast.error(message || "Requested resource not found.");
        break;

      case 500:
        toast.error(message || "Internal server error.");
        break;

      default:
        if (status !== 422) {
          toast.error(message);
        }
    }

    return Promise.reject(error);
  }
);

export default api;