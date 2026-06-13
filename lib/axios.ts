import axios from "axios";
import { getAuth } from "firebase/auth";
import app from "./firebase/config";

const auth = getAuth(app);

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

const api = axios.create({
  baseURL: `${basePath}/api`,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  async (config) => {
    const user = auth.currentUser;
    if (user) {
      const token = await user.getIdToken();
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle global errors here (e.g., redirect on 401)
    if (error.response?.status === 401) {
      console.error("Unauthorized access");
      // window.location.href = "/login"; // Optional: Force redirect
    }
    return Promise.reject(error);
  }
);

export default api;
