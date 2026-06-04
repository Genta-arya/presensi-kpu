import axiosInstance from "../axiosInstance";

export const listUser = async (status = true) => {
  try {
    const response = await axiosInstance.get("/auth/user?status=" + status);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const SingleUsers = async (id) => {
  try {
    const response = await axiosInstance.get("/auth/user/" + id);
    return response.data;
  } catch (error) {
    throw error;
  }
};
