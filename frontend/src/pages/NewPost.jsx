import { useState } from "react";
import axios from "axios";

// Mock profile helper (replace with actual logic)
const getProfilePic = (user) => user?.photoURL || "/default-profile.png";
const defaultProfilePic = "/default-profile.png";

const NewPost = ({ user, refreshPosts }) => {
  const [content, setContent] = useState("");

  const handlePost = async () => {
    console.log("🪵 DEBUG: user in NewPost", user);
    if (content.trim()) {
      try {
        await axios.post("http://localhost:9090/api/posts", {
          content,
          authorEmail: user?.email || "anonymous",
          authorUsername: user?.username || "unknown",
          authorId: user?.id || "unknown-id",
        });
        setContent("");
        refreshPosts();
      } catch (err) {
        console.error("Error creating post", err);
      }
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 mb-6 max-w-3xl mx-auto mt-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-2">
        Welcome back, {user?.username || user?.email} 👋
      </h1>
      <p className="text-gray-500 mb-6">
        Here's what's happening in your network today
      </p>

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
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Share your thoughts..."
            className="w-full bg-transparent border-none focus:ring-0 resize-none text-gray-800 placeholder-gray-500"
            rows="2"
          />

          <div className="flex justify-between items-center pt-2 border-t border-gray-100">
            <div className="flex space-x-2">
              <button
                className="p-2 text-gray-500 hover:text-blue-500 rounded-full hover:bg-blue-50"
                title="Attach image"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </button>
              <button
                className="p-2 text-gray-500 hover:text-green-500 rounded-full hover:bg-green-50"
                title="Add emoji"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </button>
            </div>

            <button
              onClick={handlePost}
              disabled={!content.trim()}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                content.trim()
                  ? "bg-blue-600 hover:bg-blue-700 text-white"
                  : "bg-gray-200 text-gray-500 cursor-not-allowed"
              }`}
            >
              Post
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewPost;
