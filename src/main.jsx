import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { Toaster } from "sonner";
import { UserProvider } from "./State/useContext.jsx";


createRoot(document.getElementById("root")).render(
  <UserProvider>

      <App />
      <Toaster richColors position="top-center" duration={3000} closeButton />
  
  </UserProvider>
);
