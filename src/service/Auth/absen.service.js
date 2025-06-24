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
