import axiosInstance from "./axiosInstance.js";

/* =====================================================
   STAFF API — subAdmin create/manage + permission assign
===================================================== */

export const createStaffApi = (data) => {
  return axiosInstance.post("/staff", data);
};

export const getStaffListApi = () => {
  return axiosInstance.get("/staff");
};

export const toggleStaffActiveApi = (id) => {
  return axiosInstance.put(`/staff/${id}/toggle-active`);
};

export const getMyPermissionsApi = () => {
  return axiosInstance.get("/staff/permissions/me");
};

export const getPermissionByUserApi = (subAdminUserId) => {
  return axiosInstance.get(`/staff/permissions/${subAdminUserId}`);
};

export const assignPermissionApi = (subAdminUserId, data) => {
  return axiosInstance.put(`/staff/permissions/${subAdminUserId}`, data);
};