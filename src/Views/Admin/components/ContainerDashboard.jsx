import React from "react";
import NavigateDashboard from "./NavigateDashboard";

const ContainerDashboard = ({ children }) => {
  return (
    <>
      <NavigateDashboard />
      <div className="p-5">{children}</div>
    </>
  );
};

export default ContainerDashboard;
