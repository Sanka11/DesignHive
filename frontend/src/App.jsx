// src/App.jsx
import { Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import DashboardPage from "./pages/DashboardPage";
import MainLayout from "./layouts/MainLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import Profile from "./pages/Profile";
import Home from "./pages/Home";
import Feed from "./pages/Feed";
import Post from "./pages/Post";

function App() {
  return (
    <Routes>
      {/* Pages without Navbar */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/" element={<LandingPage />} />

      {/* Pages with Navbar */}
      <Route element={<MainLayout />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/Feed" element={<ProtectedRoute><Feed /></ProtectedRoute>} />
        <Route path="/Post" element={<ProtectedRoute><Post /></ProtectedRoute>} />
       
        {/* Add more routes here under the Navbar layout */}
      </Route>

     
      <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
    </Routes>
  );
}

export default App;
