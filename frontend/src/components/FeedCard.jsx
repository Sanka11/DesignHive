// src/components/FeedCard.jsx
import React from "react";

const DEFAULT_PROFILE_PIC = "/assets/my-default.png";


const FeedCard = ({ post }) => {
  return (
    <div className="bg-white shadow-md rounded-xl overflow-hidden border border-gray-100">
      <div className="flex items-center p-4 space-x-4">
      <img
  src={post.user?.avatar || "/assets/default-profile.png"}
  onError={(e) => {
    e.target.onerror = null;
    e.target.src = "/assets/default-profile.png";
  }}
  alt={post.user?.name}
  className="w-10 h-10 rounded-full object-cover"
/>



        <div>
          <h2 className="font-semibold">{post.user.name}</h2>
          <p className="text-sm text-gray-500">Just now</p>
        </div>
      </div>
      <div className="px-4 pb-4">
        <p className="mb-2 text-gray-800">{post.content}</p>
        {post.media && (
          <img
            src={post.media}
            alt="Post media"
            className="w-full rounded-lg max-h-[500px] object-cover"
          />
        )}
      </div>
      <div className="px-4 py-2 border-t border-gray-100 flex justify-between text-gray-600 text-sm">
        <button className="hover:text-amber-600 font-medium">Like</button>
        <button className="hover:text-amber-600 font-medium">Comment</button>
        <button className="hover:text-amber-600 font-medium">Share</button>
      </div>
    </div>
  );
};

export default FeedCard;
