import { useEffect, useState } from "react";
import axios from "axios";
import Post from "./Post";
import NewPost from "./NewPost";
import UserList from "./UserList";
import defaultProfilePic from "../assets/default-profile.png";
import ProfileCard from "./ProfileCard";
import { FiLoader } from "react-icons/fi";
import { GiHoneycomb, GiBee } from "react-icons/gi";

const Feed = () => {
  const [posts, setPosts] = useState([]);
  const [user, setUser] = useState(null);
  const [isLoadingPosts, setIsLoadingPosts] = useState(false);
  const [isLoadingUser, setIsLoadingUser] = useState(false);

  const fetchPosts = async () => {
    try {
      setIsLoadingPosts(true);
      const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/posts`);
      console.log("📦 First post from backend:", res.data[0]);
      const sortedPosts = res.data.sort((a, b) => {
        const dateA = new Date(a.updatedAt || a.createdAt);
        const dateB = new Date(b.updatedAt || b.createdAt);
        return dateB - dateA; // Latest first
      });
      setPosts(sortedPosts);
    } catch (err) {
      console.error("❌ Error fetching posts:", err);
    } finally {
      setIsLoadingPosts(false);
    }
  };

  const fetchUserFromLocalStorage = () => {
    try {
      setIsLoadingUser(true);
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
    } finally {
      setIsLoadingUser(false);
    }
  };

  const getProfilePic = (userData) => {
    if (userData?.profileImagePath) {
      return `${import.meta.env.VITE_API_BASE_URL.replace("/api", "")}${userData.profileImagePath}`;
    }
    return defaultProfilePic;
  };

  useEffect(() => {
    fetchPosts();
    fetchUserFromLocalStorage();
  }, []);

  return (
    <div className="min-h-screen bg-amber-50 bg-opacity-50 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiBvcGFjaXR5PSIwLjEiPjxkZWZzPjxwYXR0ZXJuIGlkPSJkaWFnb25hbF9oYXRjaCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgd2lkdGg9IjEwIiBoZWlnaHQ9IjEwIiBwYXR0ZXJuVHJhbnNmb3JtPSJyb3RhdGUoNDUpIj48cmVjdCB3aWR0aD0iMSIgaGVpZ2h0PSIxIiBmaWxsPSIjMDAwIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2RpYWdvbmFsX2hhdGNoKSIvPjwvc3ZnPg==')]">
      <div className="max-w-[87rem] mx-auto px-3 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row gap-7">
          {/* Left Side - Profile Card */}
          <div className="md:w-[20%] sticky top-8 h-fit">
            {isLoadingUser ? (
              <div className="bg-amber-100 p-6 rounded-xl shadow-lg border border-amber-200 flex flex-col items-center justify-center">
                <FiLoader className="animate-spin text-2xl text-amber-600 mb-3" />
                <p className="text-amber-800">Loading profile...</p>
              </div>
            ) : user ? (
              <ProfileCard 
                user={user} 
                profilePic={getProfilePic(user)}
              />
            ) : (
              <div className="bg-amber-100 p-6 rounded-xl shadow-lg border border-amber-200">
                <p className="text-amber-800 text-center">No user found</p>
              </div>
            )}
          </div>

          {/* Main Content - Scrollable Feed */}
          <div className="md:w-[50%]">
            <div className="max-w-2xl mx-auto px-4">
              <div className="flex items-center justify-center my-6 gap-2">
                <GiHoneycomb className="text-3xl text-amber-500" />
                <h2 className="text-3xl font-bold text-amber-900 font-serif">Hive Feed</h2>
                <GiBee className="text-3xl text-amber-500" />
              </div>

              {isLoadingUser ? (
                <div className="bg-amber-100 p-4 rounded-xl shadow-lg mb-4 flex justify-center items-center border border-amber-200">
                  <FiLoader className="animate-spin text-xl text-amber-600 mr-2" />
                  <span className="text-amber-800">Checking user...</span>
                </div>
              ) : user ? (
                <NewPost user={user} refreshPosts={fetchPosts} />
              ) : (
                <div className="text-center bg-amber-100 p-3 rounded-xl shadow-lg border border-amber-200">
                  <p className="text-amber-700 font-medium">
                    🐝 Please log in to create posts
                  </p>
                </div>
              )}

              <div className="overflow-y-auto max-h-[calc(100vh-200px)] pr-2">
                {isLoadingPosts ? (
                  <div className="flex flex-col items-center justify-center py-12 bg-amber-100 rounded-xl shadow-lg border border-amber-200">
                    <FiLoader className="animate-spin text-3xl text-amber-600 mb-4" />
                    <p className="text-amber-800">Gathering honey... (loading posts)</p>
                  </div>
                ) : posts.length > 0 ? (
                  <div className="space-y-4">
                    {posts.map((post) => (
                      <Post key={post.id} post={post} />
                    ))}
                  </div>
                ) : (
                  <div className="bg-amber-100 p-6 rounded-xl shadow-lg text-center border border-amber-200">
                    <GiHoneycomb className="mx-auto text-4xl text-amber-500 mb-3" />
                    <p className="text-amber-800">
                      The hive is quiet. Be the first to buzz!
                    </p>
                  </div>
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