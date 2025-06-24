import axiosInstance from "../axiosInstance";

export const listUser = async () => {
  try {
    const response = await axiosInstance.get("/auth/user");
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
