import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
//eslint-disable-next-line no-unused-vars
import { toast, Toaster } from "react-hot-toast"; 
ReactDOM.createRoot(document.getElementById("root")).render(
      <>
      <App />  
       <Toaster position="top-center" />
      </>
);
