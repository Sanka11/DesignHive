import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GiBee } from 'react-icons/gi';
import { FaUserCircle, FaArrowRight, FaSignOutAlt } from 'react-icons/fa';
import { motion } from 'framer-motion';
import axios from 'axios';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get('http://localhost:9090/api/user', {
          withCredentials: true
        });
        setUser(response.data);
      } catch (error) {
        console.error('Error fetching user data:', error);
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  const handleViewProfile = () => {
    navigate('/profile');
  };

  const handleLogout = async () => {
    try {
      await axios.post('http://localhost:9090/api/auth/logout', {}, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      localStorage.removeItem('rememberedEmail');
      navigate('/login?logout_success=true', { replace: true });
    } catch (error) {
      console.error('Logout error:', error);
      navigate('/login');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-amber-50 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360, scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <GiBee className="text-5xl text-amber-600" />
        </motion.div>
      </div>
    );
  }

  const profilePic = user?.picture || user?.avatar_url;

  return (
    <div className="min-h-screen bg-amber-50">
      <header className="bg-gradient-to-r from-amber-500 to-yellow-600 text-white p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <GiBee className="text-3xl" />
            <h1 className="text-2xl font-bold">DesignHive Dashboard</h1>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              {profilePic ? (
                <img 
                  src={profilePic} 
                  alt="Profile" 
                  className="w-10 h-10 rounded-full border-2 border-white cursor-pointer"
                  onClick={handleViewProfile}
                />
              ) : (
                <FaUserCircle 
                  className="text-3xl text-amber-200 cursor-pointer" 
                  onClick={handleViewProfile}
                />
              )}
              <span className="font-medium">{user?.name || 'User'}</span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <FaSignOutAlt />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-4">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-xl shadow-md overflow-hidden mb-6"
        >
          <div className="bg-gradient-to-r from-amber-400 to-yellow-500 h-32"></div>
          <div className="px-6 pb-6 relative">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end -mt-16">
              <div className="flex items-end">
                <div className="bg-white p-1 rounded-full shadow-lg">
                  {profilePic ? (
                    <img 
                      src={profilePic} 
                      alt="Profile" 
                      className="w-32 h-32 rounded-full border-4 border-white object-cover"
                    />
                  ) : (
                    <div className="w-32 h-32 rounded-full border-4 border-white bg-amber-100 flex items-center justify-center">
                      <FaUserCircle className="text-7xl text-amber-600" />
                    </div>
                  )}
                </div>
                <div className="ml-6 mb-4">
                  <h2 className="text-3xl font-bold text-gray-800">{user?.name || 'Beekeeper'}</h2>
                  <div className="flex items-center text-gray-600 mt-2">
                    <span>{user?.email || 'No email provided'}</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={handleViewProfile}
                className="flex items-center space-x-2 bg-amber-600 hover:bg-amber-700 text-white px-5 py-3 rounded-lg transition-colors mt-4 md:mt-0"
              >
                <span>View Full Profile</span>
                <FaArrowRight />
              </button>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
