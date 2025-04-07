
import { createContext, useContext, useEffect, useState } from "react";
import axios from "../api/axios";
import { jwtDecode } from "jwt-decode";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // 🆕 for controlling initial load

  const login = async (token) => {
    setLoading(true); // start loading
    if (token) {
      // 🔐 JWT Login
      localStorage.setItem("token", token);
      try {
        const decoded = jwtDecode(token);
        const res = await axios.get(`/user/profile?email=${decoded.sub}`);
        setUser(res.data);
      } catch (err) {
        console.error("JWT login failed", err);
        localStorage.removeItem("token");
      }
    } else {
      // 🌐 OAuth2 Login (Google/GitHub)
      try {
        const res = await axios.get("/user/me");
        setUser(res.data);
      } catch (err) {
        console.error("OAuth login failed", err);
      }
    }
    setLoading(false); // end loading
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    window.location.href = "http://localhost:9090/logout";
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    login(token);
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

// ✅ Custom hook
export const useAuth = () => useContext(AuthContext);
export { AuthContext };
