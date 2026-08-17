import React from "react";
import ReactDOM from "react-dom/client";

import App from "./App.jsx";

import "./index.css";

// Clear stale cached student data so invented fee/payment defaults don't persist on refresh
localStorage.removeItem("crm_fallback_students");


ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);