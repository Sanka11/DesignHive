// src/App.jsx
import { Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import OAuthRedirect from "./pages/OAuthRedirect";
import DashboardPage from "./pages/DashboardPage";
import MainLayout from "./layouts/MainLayout";

function App() {
  return (
    <Routes>
      {/* Pages without Navbar */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/oauth2/redirect" element={<OAuthRedirect />} />
      <Route path="/" element={<LandingPage />} />

      {/* Pages with Navbar */}
      <Route element={<MainLayout />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        {/* Add more routes here under the Navbar layout */}
      </Route>
    </Routes>
  );
}

export default App;
