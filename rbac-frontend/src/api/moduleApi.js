import axiosInstance from "./axiosInstance.js";

/* =====================================================
   MODULE API — DB-driven feature registry
===================================================== */

export const createModuleApi = (data) => {
  return axiosInstance.post("/modules", data);
};

export const getModulesApi = () => {
  return axiosInstance.get("/modules");
};

export const updateModuleApi = (id, data) => {
  return axiosInstance.put(`/modules/${id}`, data);
};

export const deleteModuleApi = (id) => {
  return axiosInstance.delete(`/modules/${id}`);
};
