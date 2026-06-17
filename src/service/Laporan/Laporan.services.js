import axiosInstance from "../axiosInstance";

export const PostLaporan = async (data) => {
  try {
    const response = await axiosInstance.post("/laporan", {
      ...data,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const GetLaporanByUser = async (userId , date = null) => {
  try {
    const response = await axiosInstance.get(`/laporan/data?idUser=${userId}&date=${date}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const EditLaporan = async (id, data) => {
  try {
    const response = await axiosInstance.put(`/laporan/${id}`, {
      ...data,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const DeleteLaporan = async (id) => {
  try {
    const response = await axiosInstance.delete(`/laporan/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const GetlaporanById = async (id) => {
  try {
    const response = await axiosInstance.get(`/laporan/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};
