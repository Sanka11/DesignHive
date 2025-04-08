import { useState } from "react";
import axios from "axios";

const NewPost = ({ refreshPosts }) => {
  const [content, setContent] = useState("");

  const handlePost = async () => {
    if (content.trim()) {
      try {
        await axios.post("http://localhost:9090/api/posts", { content });
        setContent("");
        refreshPosts();
      } catch (err) {
        console.error("Error creating post", err);
      }
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md mb-4 border border-gray-200 max-w-2xl mx-auto">
      {/* Post Creator Header */}
      <div className="flex items-center p-3 border-b border-gray-200">
        <div className="w-10 h-10 rounded-full bg-amber-400 flex items-center justify-center text-white font-bold">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
          </svg>
        </div>
        <div className="ml-2">
          <div className="font-semibold text-gray-900">You</div>
          <div className="text-xs text-gray-500">Post to everyone</div>
        </div>
      </div>

      {/* Post Input Area */}
      <div className="p-3">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="What's buzzing in your mind?"
          className="w-full p-3 text-gray-800 placeholder-gray-500 focus:outline-none resize-none"
          rows="3"
        />
      </div>

      {/* Post Options */}
      <div className="flex items-center justify-between p-2 border-t border-gray-200">
        <div className="flex space-x-2">
          <button className="p-1 rounded-full text-gray-500 hover:bg-gray-100">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
            </svg>
          </button>
          <button className="p-1 rounded-full text-gray-500 hover:bg-gray-100">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </button>
          <button className="p-1 rounded-full text-gray-500 hover:bg-gray-100">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
        </div>

        <button
          onClick={handlePost}
          disabled={!content.trim()}
          className={`px-4 py-2 rounded-md font-medium ${content.trim() ? 'bg-amber-500 hover:bg-amber-600 text-white' : 'bg-gray-200 text-gray-500 cursor-not-allowed'} transition-colors`}
        >
          Buzz
        </button>
      </div>

      {/* Decorative Bee Elements */}
      <div className="absolute top-12 right-4 w-6 h-6 bg-yellow-400 rounded-full opacity-20"></div>
      <div className="absolute bottom-16 left-4 w-4 h-4 bg-yellow-400 rounded-full opacity-20"></div>
    </div>
  );
};

export default NewPost;