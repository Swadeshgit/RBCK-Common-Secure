import axiosInstance from "./axiosInstance.js";

export const registerApi = (data) => axiosInstance.post("/auth/register", data);
export const loginApi = (data) => axiosInstance.post("/auth/login", data);
export const googleLoginApi = (idToken) => axiosInstance.post("/auth/google", { idToken });
export const logoutApi = () => axiosInstance.post("/auth/logout");
export const forceLogoutApi = (userId) => axiosInstance.post(`/auth/force-logout/${userId}`);
export const getMeApi = () => axiosInstance.get("/auth/me");
export const updateProfileApi = (data) => axiosInstance.put("/auth/me", data);

export const forgotPasswordApi = (email) => axiosInstance.post("/auth/forgot-password", { email });
export const resetPasswordApi = (token, newPassword) =>
  axiosInstance.post(`/auth/reset-password/${token}`, { newPassword });
export const updatePasswordApi = (oldPassword, newPassword) =>
  axiosInstance.put("/auth/update-password", { oldPassword, newPassword });
export const setPasswordApi = (newPassword) => axiosInstance.put("/auth/set-password", { newPassword });

/* ========== OTP-based flow ========== */
export const forgotPasswordOtpApi = (email) => axiosInstance.post("/auth/forgot-password-otp", { email });
export const verifyOtpApi = (email, otp) => axiosInstance.post("/auth/verify-otp", { email, otp });
export const resetPasswordOtpApi = (email, otp, newPassword) =>
  axiosInstance.post("/auth/reset-password-otp", { email, otp, newPassword });


export const refreshTokenApi = () => axiosInstance.post("/auth/refresh");


