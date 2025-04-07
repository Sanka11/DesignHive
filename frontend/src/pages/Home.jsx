import { useAuth } from "../auth/useAuth";
import { useEffect, useState } from "react";
import axios from "../api/axios";
import { sendFollowRequest } from "../api/followApi";
import FeedCard from "../components/FeedCard";
import { FiSearch, FiUserPlus, FiUserCheck, FiUsers} from "react-icons/fi";
import defaultProfilePic from "../assets/default-profile.png"; 

export default function Home() {
  const { user } = useAuth();
  const [allUsers, setAllUsers] = useState([]);
  const [statuses, setStatuses] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [posts, setPosts] = useState([]);
  const [showAllSuggestions, setShowAllSuggestions] = useState(false);

  // Function to get profile picture URL
  const getProfilePic = (userData) => {
    if (userData?.profileImagePath) {
      return `http://localhost:9090${userData.profileImagePath}`;
    }
    return defaultProfilePic;
  };

  useEffect(() => {
    const fetchUsersAndStatuses = async () => {
      try {
        const usersRes = await axios.get("/user/all");
        const filtered = usersRes.data.filter((u) => u.email !== user.email);
        setAllUsers(filtered);

        const statusRes = await axios.get("/follow/statuses", {
          params: { senderEmail: user.email },
        });
        setStatuses(statusRes.data);
      } catch (error) {
        console.error("Error fetching users or statuses:", error);
      }
    };

    fetchUsersAndStatuses();

    const fetchPosts = async () => {
      try {
        // Replace with actual API call to get posts
        // const postsRes = await axios.get("/posts");
        // const postsWithProfilePics = postsRes.data.map(post => ({
        //   ...post,
        //   user: {
        //     ...post.user,
        //     avatar: getProfilePic(post.user)
        //   }
        // }));
        // setPosts(postsWithProfilePics);

        // Temporary dummy data with profile pic handling
        setPosts([
          {
            id: 1,
            user: {
              name: "Jane Doe",
              username: "janedoe",
              profileImagePath: "/uploads/profile1.jpg" // Example from DB
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
              profileImagePath: "" // Empty means no profile pic
            },
            content: "Working on an animation for DesignHive's dashboard. Feedback welcome! #animation #designsystem",
            media: "",
            likes: 12,
            comments: 3,
            time: "5h ago"
          },
          {
            id: 3,
            user: {
              name: "Alex Chen",
              username: "alexc",
              profileImagePath: "/uploads/profile3.jpg" // Example from DB
            },
            content: "Just published a new article about React performance optimization techniques. Check it out! #react #webdev",
            media: "https://source.unsplash.com/800x400/?code,programming",
            likes: 42,
            comments: 15,
            time: "1d ago"
          }
        ]);
      } catch (error) {
        console.error("Error fetching posts:", error);
      }
    };

    fetchPosts();
  }, [user.email]);

  const handleFollow = async (receiverEmail) => {
    try {
      await sendFollowRequest(user.email, receiverEmail);
      const res = await axios.get("/follow/statuses", {
        params: { senderEmail: user.email },
      });
      setStatuses(res.data);
    } catch (error) {
      console.error("Error following user:", error);
    }
  };

  const handleUnfollow = async (receiverEmail) => {
    try {
      await axios.post("/follow/unfollow", null, {
        params: { senderEmail: user.email, receiverEmail },
      });
      const res = await axios.get("/follow/statuses", {
        params: { senderEmail: user.email },
      });
      setStatuses(res.data);
    } catch (error) {
      console.error("Error unfollowing user:", error);
    }
  };

  const filteredUsers = allUsers.filter(user => 
    user.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const followingUsers = filteredUsers.filter(u => statuses[u.email] === "accepted");
  const otherUsers = filteredUsers.filter(u => statuses[u.email] !== "accepted");
  const displayedSuggestions = showAllSuggestions ? otherUsers : otherUsers.slice(0, 5);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Left Side - Empty Space (removed profile card) */}
          <div className="md:w-1/5">
            {/* This space is intentionally left blank for future use */}
          </div>

          {/* Main Content */}
          <div className="md:w-3/5">
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

          {/* Right Sidebar - Discover */}
          <div className="md:w-1/5">
            <div className="sticky top-8 space-y-6">
              {/* Search Bar */}
              <div className="bg-white rounded-xl shadow-sm p-4">
                <div className="relative">
                  <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search people..."
                    className="w-full pl-10 pr-4 py-2 bg-gray-50 rounded-lg border-none focus:ring-2 focus:ring-blue-200"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              {/* Following Section */}
              {followingUsers.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm p-4">
                  <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                    <FiUserCheck className="mr-2 text-blue-500" />
                    Following ({followingUsers.length})
                  </h3>
                  <ul className="space-y-3">
                    {followingUsers.slice(0, 5).map((u) => (
                      <li key={u.email} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-8 h-8 rounded-full bg-gray-200 mr-2 overflow-hidden">
                            <img 
                              src={getProfilePic(u)}
                              alt={u.username}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = defaultProfilePic;
                              }}
                            />
                          </div>
                          <span className="text-sm font-medium">{u.username}</span>
                        </div>
                        <button
                          onClick={() => handleUnfollow(u.email)}
                          className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded-full"
                        >
                          Unfollow
                        </button>
                      </li>
                    ))}
                  </ul>
                  {followingUsers.length > 5 && (
                    <button className="text-xs text-blue-600 mt-2 hover:underline">
                      See all {followingUsers.length} following
                    </button>
                  )}
                </div>
              )}

              {/* Suggestions Section */}
              <div className="bg-white rounded-xl shadow-sm p-4">
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                  <FiUserPlus className="mr-2 text-purple-500" />
                  Suggestions for you
                </h3>
                <ul className="space-y-3">
                  {displayedSuggestions.map((u) => {
                    const status = statuses[u.email] || "none";
                    return (
                      <li key={u.email} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-8 h-8 rounded-full bg-gray-200 mr-2 overflow-hidden">
                            <img 
                              src={getProfilePic(u)}
                              alt={u.username}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = defaultProfilePic;
                              }}
                            />
                          </div>
                          <div>
                            <p className="text-sm font-medium">{u.username}</p>
                            <p className="text-xs text-gray-500">New to DesignHive</p>
                          </div>
                        </div>
                        {status === "none" && (
                          <button
                            onClick={() => handleFollow(u.email)}
                            className="text-xs bg-blue-600 text-white px-2 py-1 rounded-full hover:bg-blue-700"
                          >
                            Follow
                          </button>
                        )}
                        {status === "pending" && (
                          <button
                            disabled
                            className="text-xs bg-gray-200 text-gray-500 px-2 py-1 rounded-full"
                          >
                            Requested
                          </button>
                        )}
                      </li>
                    );
                  })}
                </ul>
                {otherUsers.length > 5 && (
                  <button 
                    onClick={() => setShowAllSuggestions(!showAllSuggestions)}
                    className="text-xs text-blue-600 mt-2 hover:underline"
                  >
                    {showAllSuggestions ? "Show less" : `Show more (${otherUsers.length - 5})`}
                  </button>
                )}
              </div>

              {/* Footer Links */}
              <div className="text-xs text-gray-500 space-y-1">
                <div className="flex flex-wrap gap-2">
                  <a href="#" className="hover:underline">About</a>
                  <a href="#" className="hover:underline">Help</a>
                  <a href="#" className="hover:underline">Terms</a>
                  <a href="#" className="hover:underline">Privacy</a>
                </div>
                <p>© {new Date().getFullYear()} DesignHive</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}