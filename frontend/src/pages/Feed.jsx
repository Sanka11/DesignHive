import { useEffect, useState } from "react";
import axios from "axios";
import Post from "./Post";
import NewPost from "./NewPost";
import UserList from "./UserList";
import defaultProfilePic from "../assets/default-profile.png";
import ProfileCard from "./ProfileCard";
import { FiLoader } from "react-icons/fi";

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
        return dateB - dateA;
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

  const handleNewComment = ({ comment, postId }) => {
    console.log(`📝 New comment on post ${postId}:`, comment);
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
            {isLoadingUser ? (
              <div className="bg-white p-6 rounded-lg shadow flex flex-col items-center justify-center">
                <FiLoader className="animate-spin text-2xl text-blue-600 mb-3" />
                <p className="text-gray-500">Loading profile...</p>
              </div>
            ) : user ? (
              <ProfileCard user={user} profilePic={getProfilePic(user)} />
            ) : (
              <div className="bg-white p-6 rounded-lg shadow">
                <p className="text-gray-500 text-center">No user found</p>
              </div>
            )}
          </div>

          {/* Main Content - Scrollable Feed */}
          <div className="md:w-[50%]">
            <div className="max-w-2xl mx-auto px-4">
              <h2 className="text-2xl font-bold my-4 text-center">News Feed</h2>

              {isLoadingUser ? (
                <div className="bg-white p-4 rounded-lg shadow mb-4 flex justify-center">
                  <FiLoader className="animate-spin text-xl text-blue-600 mr-2" />
                  <span>Checking user...</span>
                </div>
              ) : user ? (
                <NewPost user={user} refreshPosts={fetchPosts} />
              ) : (
                <p className="text-center text-red-500 bg-white p-3 rounded-lg shadow">
                  ⚠️ Please log in to create posts
                </p>
              )}

              <div className="overflow-y-auto max-h-[calc(100vh-200px)]">
                {isLoadingPosts ? (
                  <div className="flex flex-col items-center justify-center py-12 bg-white rounded-lg shadow">
                    <FiLoader className="animate-spin text-3xl text-blue-600 mb-4" />
                    <p className="text-gray-600">Loading posts...</p>
                  </div>
                ) : posts.length > 0 ? (
                  posts.map((post) => (
                    <Post
                      key={post.id}
                      post={post}
                      onCommentAdded={({ comment }) =>
                        handleNewComment({ comment, postId: post.id })
                      }
                    />
                  ))
                ) : (
                  <div className="bg-white p-6 rounded-lg shadow text-center">
                    <p className="text-gray-500">No posts yet. Be the first to post!</p>
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
