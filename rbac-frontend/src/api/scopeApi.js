import axiosInstance from "./axiosInstance.js";

/* =====================================================
   SCOPE API (branch/warehouse/department — project-dependent)
===================================================== */

export const createScopeApi = (data) => {
  return axiosInstance.post("/scopes", data);
};

export const getScopesApi = (orgId) => {
  return axiosInstance.get(`/scopes?orgId=${orgId}`);
};

export const switchScopeApi = (id) => {
  return axiosInstance.put(`/scopes/switch/${id}`);
};