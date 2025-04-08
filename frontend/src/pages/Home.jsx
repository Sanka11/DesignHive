import { useAuth } from "../auth/useAuth";
import { useEffect, useState } from "react";
import FeedCard from "../components/FeedCard";
import { FiUsers } from "react-icons/fi";
import defaultProfilePic from "../assets/default-profile.png";
import UserList from "./UserList";

export default function Home() {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);

  const getProfilePic = (userData) => {
    if (userData?.profileImagePath) {
      return `http://localhost:9090${userData.profileImagePath}`;
    }
    return defaultProfilePic;
  };

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setPosts([
          {
            id: 1,
            user: {
              name: "Jane Doe",
              username: "janedoe",
              profileImagePath: "/uploads/profile1.jpg",
              email: "jane@example.com"
            },
            content: "Just finished a UI redesign for a mobile app! 💡✨ #design #uiux",
            media: "https://source.unsplash.com/800x400/?ui,design",
            likes: 24,
            comments: 8,
            time: "2h ago"
          },
          {
            id: 2,
            user: {
              name: "Pramod Ravisanka",
              username: "pramodr",
              profileImagePath: "",
              email: "pramod@example.com"
            },
            content: "Working on an animation for DesignHive's dashboard. Feedback welcome! #animation #designsystem",
            media: "",
            likes: 12,
            comments: 3,
            time: "5h ago"
          }
        ]);
      } catch (error) {
        console.error("Error fetching posts:", error);
      }
    };

    fetchPosts();
  }, [user.email]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Left Side - Empty Space */}
          <div className="md:w-[15%]">
            {/* Space reserved for future use */}
          </div>

          {/* Main Content */}
          <div className="md:w-[50%]">
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
              <h1 className="text-2xl font-bold text-gray-800 mb-2">Welcome back, {user?.username || user?.email} 👋</h1>
              <p className="text-gray-500 mb-6">Here's what's happening in your network today</p>
              
              {/* Create Post */}
              <div className="flex items-start mb-6">
                <div className="w-10 h-10 rounded-full bg-gray-200 mr-3 overflow-hidden">
                  <img 
                    src={getProfilePic(user)}
                    alt="Profile"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = defaultProfilePic;
                    }}
                  />
                </div>
                <div className="flex-1 bg-gray-50 rounded-xl p-3">
                  <textarea 
                    placeholder="Share your thoughts..." 
                    className="w-full bg-transparent border-none focus:ring-0 resize-none"
                    rows="2"
                  />
                  <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                    <div className="flex space-x-2">
                      <button className="p-2 text-gray-500 hover:text-blue-500 rounded-full hover:bg-blue-50">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </button>
                      <button className="p-2 text-gray-500 hover:text-green-500 rounded-full hover:bg-green-50">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </button>
                    </div>
                    <button className="bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-blue-700">
                      Post
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Feed Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-800">Your Feed</h2>
                <div className="flex space-x-2">
                  <button className="px-3 py-1 text-sm bg-gray-100 rounded-full hover:bg-gray-200">Latest</button>
                  <button className="px-3 py-1 text-sm bg-gray-100 rounded-full hover:bg-gray-200">Top</button>
                </div>
              </div>
              
              {posts.length > 0 ? (
                posts.map((post) => (
                  <FeedCard 
                    key={post.id} 
                    post={{
                      ...post,
                      user: {
                        ...post.user,
                        avatar: getProfilePic(post.user)
                      }
                    }} 
                  />
                ))
              ) : (
                <div className="bg-white rounded-xl shadow-sm p-8 text-center">
                  <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <FiUsers className="text-gray-400 text-3xl" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-800 mb-2">No posts yet</h3>
                  <p className="text-gray-500 mb-4">Follow more people to see their posts in your feed</p>
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-blue-700">
                    Discover People
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right Sidebar - User List */}
          <UserList user={user} />
        </div>
      </div>
    </div>
  );
}