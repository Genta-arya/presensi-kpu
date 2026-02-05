import React from "react";
import { Navigate, useNavigate } from "react-router-dom";
import useCheckLogin from "./useLogin";
import Loading from "../components/Loading";

const ProtectedRoute = ({ element }) => {
  if (localStorage.getItem("token") === null) {
    return <Navigate to="/login" />;
  }
  return element;
};

export default ProtectedRoute;
