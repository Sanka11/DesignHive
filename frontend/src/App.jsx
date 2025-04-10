// src/App.jsx
import { useAuth } from "./auth/useAuth";
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
import ChatPage from "./pages/ChatPage";
import MyChats from "./pages/MyChats";
import Feed from "./pages/Feed";
import Post from "./pages/Post";
import NewPost from "./pages/NewPost";
import NewPostPage from "./pages/NewPostPage";
import OAuthRedirect from "./pages/OAuthRedirect";

function App() {
  const { user } = useAuth(); // ✅ this defines user!
  return (
    <Routes>
      {/* Pages without Navbar */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/" element={<LandingPage />} />
      <Route path="/oauth2/redirect" element={<OAuthRedirect />} />
      <Route path="/chat/:chatId" element={<ChatPage currentUser={user} />} />
      <Route path="/my-chats" element={<MyChats />} />
      <Route path="/chat" element={<ChatPage currentUser={user} />} />

        

      {/* Pages with Navbar */}
      <Route element={<MainLayout />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />

        <Route path="/Feed" element={<ProtectedRoute><Feed /></ProtectedRoute>} />
        <Route path="/Post" element={<ProtectedRoute><Post /></ProtectedRoute>} />
        <Route path="/newpost" element={<ProtectedRoute><NewPostPage /></ProtectedRoute>} />

        {/* Add more routes here under the Navbar layout */}
      </Route>


      <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
    </Routes>
  );
}

export default App;
