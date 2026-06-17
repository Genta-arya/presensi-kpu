import axiosInstance from "../axiosInstance";

export const createReportData = async (data) => {
  try {
    const response = await axiosInstance.post("/reportdata", data);
  } catch (error) {
    throw error;
  }
};

export const deleteReportData = async (id) => {
  try {
    const response = await axiosInstance.delete(`/reportdata/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};
