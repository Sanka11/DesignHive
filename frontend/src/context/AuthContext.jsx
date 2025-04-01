import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";


export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const response = await axios.get("http://localhost:9090/api/auth/me", {
                withCredentials: true
            });
            setUser(response.data);
        } catch (error) {
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    const login = async (credentials) => {
        try {
            const response = await axios.post(
                "http://localhost:9090/api/auth/login", 
                credentials,
                { withCredentials: true }
            );
            setUser(response.data);
            return response.data;
        } catch (error) {
            throw error;
        }
    };

    const loginWithGoogle = () => {
        if (!navigator.cookieEnabled) {
            alert("Please enable third-party cookies for Google login to work properly");
            return;
        }
        
        // Store current route to redirect back after login
        sessionStorage.setItem('preAuthRoute', window.location.pathname);
        window.location.href = 'http://localhost:9090/oauth2/authorization/google';
    };

    const handleOAuthRedirect = async () => {
        try {
            const response = await axios.get("http://localhost:9090/api/auth/me", {
                withCredentials: true
            });
            setUser(response.data);
            
            // Redirect to stored route or home
            const redirectPath = sessionStorage.getItem('preAuthRoute') || '/';
            navigate(redirectPath);
        } catch (error) {
            console.error("OAuth validation failed:", error);
            navigate('/login');
        }
    };

    const logout = async () => {
        try {
            await axios.post('http://localhost:9090/api/auth/logout', {}, {
                withCredentials: true
            });
        } catch (error) {
            console.error('Logout API call failed:', error);
        } finally {
            // Clear all auth-related data
            setUser(null);
            localStorage.removeItem('rememberedEmail');
            sessionStorage.removeItem('preAuthRoute');
            navigate('/login', { state: { fromLogout: true } });
        }
    };

    return (
        <AuthContext.Provider value={{
            user,
            loading,
            login,
            loginWithGoogle,
            handleOAuthRedirect,
            logout,
            checkAuth
        }}>
            {children}
        </AuthContext.Provider>
    );
};

// Add this named export for the hook
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};