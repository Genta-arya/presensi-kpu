import axiosInstance from "../axiosInstance";

export const HandleLogin = async (data) => {
  try {
    const response = await axiosInstance.post("/auth/verifikasi", {
      ...data,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};
