import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { NotificationProvider } from "./components/WorkoutNotifications";
//eslint-disable-next-line no-unused-vars
import { toast, Toaster } from "react-hot-toast";
ReactDOM.createRoot(document.getElementById("root")).render(
  <NotificationProvider>
    <App />
  </NotificationProvider>
);
