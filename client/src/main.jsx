
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

// Apply the saved appearance before rendering the app
try {
  const savedPreferences = JSON.parse(
    localStorage.getItem("travelmint-preferences") || "{}"
  );

  document.documentElement.setAttribute(
    "data-theme",
    savedPreferences.appearance === "dark" ? "dark" : "light"
  );
} catch {
  document.documentElement.setAttribute("data-theme", "light");
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
