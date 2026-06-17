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

export const createUser = async (data) => {
  try {
    const response = await axiosInstance.post("/auth/register", data);
    return response.data;
  } catch (error) {
    throw error;
  }
};
export const deleteUser = async (id) => {
  try {
    const response = await axiosInstance.delete("/auth/delete-user/" + id);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateIndex = async (data) => {
  try {
    const response = await axiosInstance.post("/auth/update-index/", data);
    return response.data;
  } catch (error) {
    throw error;
  }
};
