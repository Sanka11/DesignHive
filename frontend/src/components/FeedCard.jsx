import React from "react";
import { formatDistanceToNow } from "date-fns";

const DEFAULT_PROFILE_PIC = "/assets/my-default.png";

const FeedCard = ({ post }) => {
  const created = post.createdAt?.seconds
    ? new Date(post.createdAt.seconds * 1000)
    : new Date(post.createdAt);

  const updated = post.updatedAt?.seconds
    ? new Date(post.updatedAt.seconds * 1000)
    : new Date(post.updatedAt);

  const isUpdated = post.updatedAt && post.updatedAt !== post.createdAt;

  const timeLabel = isUpdated
    ? `Updated ${formatDistanceToNow(updated, { addSuffix: true })}`
    : `Posted ${formatDistanceToNow(created, { addSuffix: true })}`;

  return (
    <div className="bg-white shadow-md rounded-xl overflow-hidden border border-gray-100">
      <div className="flex items-center p-4 space-x-4">
        <img
          src={post.user?.avatar || DEFAULT_PROFILE_PIC}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = DEFAULT_PROFILE_PIC;
          }}
          alt={post.user?.name}
          className="w-10 h-10 rounded-full object-cover"
        />

        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-semibold text-gray-800">{post.user?.name}</h2>
            {isUpdated && (
              <span className="text-xs text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                🛠 Updated
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500">{timeLabel}</p>
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
