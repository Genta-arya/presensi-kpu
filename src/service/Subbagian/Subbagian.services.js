import axiosInstance from "../axiosInstance";

export const createSubbagian = async (data) => {
  try {
    const response = await axiosInstance.post("/subbagian", data);
  } catch (error) {
    throw error;
  }
};

export const updateSubbagian = async (id, data) => {
  try {
    const response = await axiosInstance.post(`/subbagian/${id}`, data);
  } catch (error) {
    throw error;
  }
};

export const getSubbagian = async () => {
  try {
    const response = await axiosInstance.get("/subbagian/data");
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteSubbagian = async (id) => {
  try {
    const response = await axiosInstance.delete(`/subbagian/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getSubbagianById = async (id) => {
  try {
    const response = await axiosInstance.get(`/subbagian/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const addUsersToSubbagian = async (id, data) => {
  try {
    const response = await axiosInstance.post(
      `/subbagian/${id}/add-users`,
      data,
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const assignSubbagianToJabatan = async (id, data) => {
  try {
    const response = await axiosInstance.post(
      `/subbagian/${id}/assign-posisi`,
      data,
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const unAssingn = async (id, data) => {
  try {
    const response = await axiosInstance.post(`/subbagian/${id}/remove-users`, data);
    return response.data;
  } catch (error) {
    throw error;
  }
};