import axiosInstance from "../axiosInstance";

export const createJabatan = async (data) => {
  try {
    const response = await axiosInstance.post("/jabatan", data);
  } catch (error) {
    throw error;
  }
};

export const getJabatan = async () => {
  try {
    const response = await axiosInstance.get("/jabatan/data");
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateJabatan = async (id, data) => {
  try {
    const response = await axiosInstance.post(`/jabatan/${id}`, data);
  } catch (error) {
    throw error;
  }
};

export const deleteJabatan = async (id) => {
  try {
    const response = await axiosInstance.delete(`/jabatan/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};
