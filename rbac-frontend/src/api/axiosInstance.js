import axios from "axios";

/* =====================================================
   CENTRALIZED AXIOS INSTANCE
   withCredentials: true — refresh-token httpOnly cookie
   automatically bhejne/receive karne ke liye zaroori hai
===================================================== */
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error),
);

/* Multiple requests ek saath 401 de sakti hain (Access Token expire
   hone par) — sabko ek hi refresh-call se serve karte hain, taaki
   parallel multiple refresh-attempts na ho jaayein */
let isRefreshing = false;
let refreshSubscribers = [];

const subscribeTokenRefresh = (cb) => refreshSubscribers.push(cb);
const onRefreshed = (newToken) => {
  refreshSubscribers.forEach((cb) => cb(newToken));
  refreshSubscribers = [];
};

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;
    const code = error.response?.data?.code;
    const isRefreshCall = originalRequest?.url?.includes("/auth/refresh");

    /* ========== ACCESS TOKEN EXPIRED — refresh karke retry karo ========== */
    if (status === 401 && code === "ACCESS_TOKEN_EXPIRED" && !originalRequest._retry && !isRefreshCall) {
      if (isRefreshing) {
        return new Promise((resolve) => {
          subscribeTokenRefresh((newToken) => {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            resolve(axiosInstance(originalRequest));
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const res = await axiosInstance.post("/auth/refresh");
        const newToken = res.data.token;
        localStorage.setItem("token", newToken);
        isRefreshing = false;
        onRefreshed(newToken);

        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        isRefreshing = false;
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.dispatchEvent(new Event("force-logout"));
        return Promise.reject(refreshError);
      }
    }

    /* ========== Baaki sab 401 (invalid token, tokenVersion mismatch,
       ya refresh khud fail ho gaya) — seedha logout ========== */
    if (status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.dispatchEvent(new Event("force-logout"));
    }

    return Promise.reject(error);
  },
);

export default axiosInstance;