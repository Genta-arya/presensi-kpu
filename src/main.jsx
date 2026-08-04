import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { Toaster } from "sonner";
import { UserProvider } from "./State/useContext.jsx";
import "react-calendar/dist/Calendar.css";
import { HelmetProvider } from "react-helmet-async";
createRoot(document.getElementById("root")).render(
  <>
    <HelmetProvider>
      <App />
      <Toaster richColors position="bottom-center" duration={6000} closeButton />
    </HelmetProvider>
  </>,
);
