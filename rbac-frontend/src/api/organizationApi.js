import axiosInstance from "./axiosInstance.js";

/* =====================================================
   ORGANIZATION API
===================================================== */

export const createOrganizationApi = (data) => {
  return axiosInstance.post("/organizations", data);
};

export const getMyOrganizationsApi = () => {
  return axiosInstance.get("/organizations");
};

export const updateOrganizationApi = (id, data) => {
  return axiosInstance.put(`/organizations/${id}`, data);
};

export const switchOrganizationApi = (id) => {
  return axiosInstance.put(`/organizations/switch/${id}`);
};
