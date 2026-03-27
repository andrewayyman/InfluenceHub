import { RouterProvider } from "react-router-dom";
import React from "react";
import { AuthProvider } from "./context/AuthContext";
import { router } from "./routes/AppRouter";
import "./App.css";

function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}

export default App;
