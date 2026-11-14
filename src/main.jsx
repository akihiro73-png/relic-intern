import React from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "./storage-shim.js";
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(<App />);
