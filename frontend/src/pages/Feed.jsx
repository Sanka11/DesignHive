import { useEffect, useState } from "react";
import axios from "axios";
import Post from "./Post";
import NewPost from "./NewPost";
import UserList from "./UserList";
import defaultProfilePic from "../assets/default-profile.png";
import ProfileCard from "./ProfileCard"; // We'll create this component next

const Feed = () => {
  const [posts, setPosts] = useState([]);
  const [user, setUser] = useState(null);

  const fetchPosts = async () => {
    try {
      const res = await axios.get("http://localhost:9090/api/posts");
      const sortedPosts = res.data.sort((a, b) => {
        const dateA = new Date(a.updatedAt || a.createdAt);
        const dateB = new Date(b.updatedAt || b.createdAt);
        return dateB - dateA; // Latest first
      });
      setPosts(sortedPosts);
    } catch (err) {
      console.error("❌ Error fetching posts:", err);
    }
  };

  const fetchUserFromLocalStorage = () => {
    try {
      const storedUser = localStorage.getItem("loggedInUser");
      if (!storedUser) {
        console.warn("⚠️ No 'loggedInUser' found in localStorage.");
        return;
      }

      const parsed = JSON.parse(storedUser);
      if (parsed && parsed.email && parsed.username && parsed.id) {
        console.log("✅ Loaded user from localStorage:", parsed);
        setUser(parsed);
      } else {
        console.warn("⚠️ Invalid user format in localStorage:", parsed);
      }
    } catch (err) {
      console.error("❌ Error parsing loggedInUser:", err);
    }
  };

  const getProfilePic = (userData) => {
    if (userData?.profileImagePath) {
      return `http://localhost:9090${userData.profileImagePath}`;
    }
    return defaultProfilePic;
  };

  useEffect(() => {
    fetchPosts();
    fetchUserFromLocalStorage();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-[87rem] mx-auto px-3 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row gap-7">
          {/* Left Side - Profile Card */}
          <div className="md:w-[20%] sticky top-8 h-fit">
            {user ? (
              <ProfileCard 
                user={user} 
                profilePic={getProfilePic(user)}
              />
            ) : (
              <div className="bg-white p-4 rounded-lg shadow">
                <p className="text-gray-500">Loading profile...</p>
              </div>
            )}
          </div>

          {/* Main Content - Scrollable Feed */}
          <div className="md:w-[50%]">
            <div className="max-w-2xl mx-auto px-4">
              <h2 className="text-2xl font-bold my-4 text-center">News Feed</h2>

              {user ? (
                <NewPost user={user} refreshPosts={fetchPosts} />
              ) : (
                <p className="text-center text-red-500">
                  ⚠️ User not loaded. Check localStorage.
                </p>
              )}

              <div className="overflow-y-auto max-h-[calc(100vh-200px)]">
                {posts.length > 0 ? (
                  posts.map((post) => <Post key={post.id} post={post} />)
                ) : (
                  <p className="text-center text-gray-500">No posts yet.</p>
                )}
              </div>
            </div>
          </div>

          {/* Right Sidebar - User List */}
          {user && <UserList user={user} />}
        </div>
      </div>
    </div>
  );
};

export default Feed;