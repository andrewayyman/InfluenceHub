import { RouterProvider } from "react-router-dom";
import { router } from "./routes/AppRouter";
import "./App.css";
import React from "react";

function App() {
  return <RouterProvider router={router} />;
}

export default App;
