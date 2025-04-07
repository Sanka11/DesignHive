// src/components/FeedCard.jsx
import React from "react";

const FeedCard = ({ post }) => {
  return (
    <div className="bg-white shadow-md rounded-xl overflow-hidden border border-gray-100">
      <div className="flex items-center p-4 space-x-4">
        <img
          src={post.user.avatar}
          alt={post.user.name}
          className="w-12 h-12 rounded-full object-cover"
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
