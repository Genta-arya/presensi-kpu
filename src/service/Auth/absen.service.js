import axiosInstance from "../axiosInstance";

export const createAbsen = async (data) => {
  try {
    const response = await axiosInstance.post("/absen", {
      ...data,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getAbsenByUserId = async (userId, month, year) => {
  try {
    // Menambahkan query parameters ?month=...&year=... jika parameter dikirimkan
    const response = await axiosInstance.get(`/absen/${userId}`, {
      params: {
        month,
        year
      }
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};