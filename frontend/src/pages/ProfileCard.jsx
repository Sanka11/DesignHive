// components/ProfileCard.jsx
import { Link } from "react-router-dom";
import { FaUser, FaGraduationCap, FaComments } from "react-icons/fa";
import { GiBee } from "react-icons/gi";
import defaultProfilePic from "../assets/default-profile.png";
import { useEffect, useState } from "react";
import axios from "axios";
import {
  getFollowers,
  getFollowing,
} from "../api/followApi";

const ProfileCard = ({ user }) => {
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [loading, setLoading] = useState(true);

  const handleImgError = (e) => {
    e.target.onerror = null;
    e.target.src = defaultProfilePic;
  };

  // Get profile image URL
  const getProfilePicUrl = () => {
    if (!user?.profileImagePath) return defaultProfilePic;
    return user.profileImagePath.startsWith("http") 
      ? user.profileImagePath 
      : `${import.meta.env.VITE_API_BASE_URL.replace("/api", "")}${user.profileImagePath}`;
  };
  

  // Fetch data using same functions as profile page
  useEffect(() => {
    const loadData = async () => {
      try {
        if (!user?.email) return;
        
        const [followersRes, followingRes] = await Promise.all([
          getFollowers(user.email),
          getFollowing(user.email)
        ]);

        setFollowers(followersRes.data);
        setFollowing(followingRes.data);

      } catch (error) {
        console.error("Error loading profile data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user]);

  return (
    <div className="bg-white p-4 rounded-lg shadow-lg border border-amber-100 mt-6">
      <div className="flex flex-col items-center">
        {/* Profile Image */}
        <div className="relative mb-4">
          <img 
            src={getProfilePicUrl()} 
            onError={handleImgError}
            alt="Profile" 
            className="w-24 h-24 rounded-full object-cover border-4 border-amber-200 shadow-md"
            referrerPolicy="no-referrer"
          />
        </div>

        {/* User Info */}
        <div className="text-center mb-4">
          <h3 className="font-bold text-xl text-amber-900">{user?.username || 'User'}</h3>
          <p className="text-sm text-amber-700/80 break-all">{user?.email || ''}</p>
        </div>

        {/* Stats */}
        <div className="flex justify-around w-full mb-4 border-y border-amber-100 py-3">
          <div className="text-center px-2">
            <p className="font-bold text-amber-900">
              {loading ? '--' : user?.postCount || 0}
            </p>
            <p className="text-xs text-amber-600">Posts</p>
          </div>
          <div className="text-center px-2">
            <p className="font-bold text-amber-900">
              {loading ? '--' : followers.length}
            </p>
            <p className="text-xs text-amber-600">Followers</p>
          </div>
          <div className="text-center px-2">
            <p className="font-bold text-amber-900">
              {loading ? '--' : following.length}
            </p>
            <p className="text-xs text-amber-600">Following</p>
          </div>
        </div>

        {/* Preferences List */}
        {user?.preferences?.length > 0 && (
          <div className="w-full mb-4">
            <h4 className="text-sm font-medium text-amber-800 mb-2">Preferences</h4>
            <div className="flex flex-wrap gap-2">
              {user.preferences.map((pref, index) => (
                <span key={index} className="text-sm bg-amber-100 text-amber-800 px-2 py-1 rounded-full">
                  #{pref}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="w-full space-y-2">
          <Link
            to="/profile"
            className="flex items-center justify-center space-x-2 w-full bg-amber-100 hover:bg-amber-200 text-amber-800 font-medium py-2 px-4 rounded-lg transition"
          >
            <FaUser className="text-amber-700" />
            <span>View Profile</span>
          </Link>
          
          <Link
            to="/learning-plans"
            className="flex items-center justify-center space-x-2 w-full bg-amber-50 hover:bg-amber-100 text-amber-800 font-medium py-2 px-4 rounded-lg transition border border-amber-200"
          >
            <FaGraduationCap className="text-amber-700" />
            <span>Learning Plans</span>
          </Link>

          {/* New Chat Button */}
          <Link
            to="/chat"
            className="flex items-center justify-center space-x-2 w-full bg-amber-50 hover:bg-amber-100 text-amber-800 font-medium py-2 px-4 rounded-lg transition border border-amber-200"
          >
            <FaComments className="text-amber-700" />
            <span>My Chats</span>
          </Link>
        </div>

        {/* Additional Info */}
        {user?.createdAt && (
          <div className="mt-4 pt-3 border-t border-amber-100 w-full">
            <p className="text-xs text-center text-amber-600">
              Member since {new Date(user.createdAt).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'short' 
              })}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileCard;