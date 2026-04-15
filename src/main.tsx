// src/main.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { AuthProvider } from "./features/auth/context/AuthContext";

import App from "./App";

import { ReactQueryProvider } from "./app/providers/ReactQueryProvider";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <AuthProvider>
    <ReactQueryProvider>
      <App />
    </ReactQueryProvider>
  </AuthProvider>
);