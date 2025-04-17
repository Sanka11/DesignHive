// src/App.jsx
import { useAuth } from "./auth/useAuth";
import { Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import Register from "./pages/Register";

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
import SentRequests from "./pages/SentRequests";
import FollowingPage from "./pages/FollowingPage";
import FollowersPage from "./pages/FollowersPage";
import ManagePosts from './pages/ManagePosts';
import RecommendedPost from "./pages/RecommendedPost";
import HomeLearningPlan from "./pages/HomeLeraningPlan.jsx";
import CreatePlanPage from "./pages/CreatePlanPage.jsx";
import LearningPlanPage from "./pages/LearningPlanPage.jsx";
import ChangePassword from "./pages/ChangePassword.jsx";
import ForgotPassword from "./pages/ForgotPassword.jsx";


function App() {
  const { user } = useAuth(); // ✅ this defines user!
  return (
    <Routes>
      {/* Pages without Navbar */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
     
      <Route path="/" element={<LandingPage />} />
      <Route path="/oauth2/redirect" element={<OAuthRedirect />} />
      <Route path="/chat/:chatId" element={<ChatPage currentUser={user} />} />
      <Route path="/my-chats" element={<MyChats />} />
      <Route path="/chat" element={<ChatPage currentUser={user} />} />
      <Route path="/sent-requests" element={<SentRequests />} />
      <Route path="/following" element={<FollowingPage />} />
      <Route path="/followers" element={<FollowersPage />} />
      <Route path="/change-password" element={<ChangePassword />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      

        

      {/* Pages with Navbar */}
      <Route element={<MainLayout />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />


        <Route path="/Feed" element={<ProtectedRoute><Feed /></ProtectedRoute>} />
        <Route path="/Post" element={<ProtectedRoute><Post /></ProtectedRoute>} />
        <Route path="/newpost" element={<ProtectedRoute><NewPostPage /></ProtectedRoute>} />
        <Route path="/manageposts" element={<ManagePosts />} />
        <Route path="/recommended" element={<RecommendedPost />} />
        {/* Add more routes here under the Navbar layout */}
        <Route
          path="/learning-planhome"
          element={
            <ProtectedRoute>
              <HomeLearningPlan />
            </ProtectedRoute>
          }
        />

        <Route
          path="/create-plan"
          element={
            <ProtectedRoute>
              <CreatePlanPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/learning-plan/:id"
          element={
            <ProtectedRoute>
              <LearningPlanPage />
            </ProtectedRoute>
          }
        />
      </Route>
      


      <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
    </Routes>
  );
}

export default App;
