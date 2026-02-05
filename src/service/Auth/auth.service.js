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

export const HandleLoginPage = async (data) => {
  try {
    const response = await axiosInstance.post("/auth/login", { ...data });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const HandleSession = async (data) => {
  try {
    const response = await axiosInstance.post("/auth/session", {
      ...data,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const HandleVerifyMFA = async (data) => {
  try {
    const response = await axiosInstance.post("/auth/mfa/verify", {
      ...data,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const GetQRForMFASetup = async (userId) => {
  try {
    const response = await axiosInstance.get(`/auth/mfa/setup/${userId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const HandlePostMFASetup = async (data) => {
  try {
    const response = await axiosInstance.post("/auth/mfa/verify-setup", {
      ...data,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const ResetMFA = async (userId) => {
  try {
    const response = await axiosInstance.post(`/auth/mfa/reset`, {
      nip: userId.nip,
      password: userId.password,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};
