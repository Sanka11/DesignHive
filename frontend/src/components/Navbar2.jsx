import { useAuth } from "../auth/useAuth";
import { Link, useLocation } from "react-router-dom";

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();

  // Hide navbar on /login and /register routes
  const hideNavbar = location.pathname === "/login" || location.pathname === "/register";

  if (hideNavbar) return null;

  // Use VITE_API_BASE_URL for image path (remove /api if it's there)
  const profilePic = user?.profileImagePath
    ? user.profileImagePath.startsWith("http")
      ? user.profileImagePath
      : `${import.meta.env.VITE_API_BASE_URL.replace("/api", "")}${user.profileImagePath}`
    : "/assets/default-profile.png";

  return (
    <nav className="bg-gray-800 p-4 text-white flex justify-between items-center">
      <div className="text-xl font-bold">
        <Link to="/">MyApp</Link>
      </div>
      {user && (
        <div className="flex items-center gap-4">
          <Link to="/profile">
            <img
              src={profilePic}
              alt="profile"
              className="w-10 h-10 rounded-full object-cover border-2 border-white cursor-pointer hover:scale-105 transition"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "/assets/default-profile.png"; // fallback image
              }}
              referrerPolicy="no-referrer"
            />
          </Link>
          <span>{user.username}</span>
          <button onClick={logout} className="bg-red-500 px-3 py-1 rounded">
            Logout
          </button>
        </div>
      )}
    </nav>
  );
}
