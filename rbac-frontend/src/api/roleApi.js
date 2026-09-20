import axiosInstance from "./axiosInstance.js";

/* =====================================================
   ROLE API — dynamic role templates (Teacher, Manager, etc.)
===================================================== */

export const createRoleApi = (data) => {
  return axiosInstance.post("/roles", data);
};

export const getRolesApi = (orgId) => {
  return axiosInstance.get(`/roles?orgId=${orgId}`);
};

export const updateRoleApi = (id, data) => {
  return axiosInstance.put(`/roles/${id}`, data);
};

export const deleteRoleApi = (id) => {
  return axiosInstance.delete(`/roles/${id}`);
};