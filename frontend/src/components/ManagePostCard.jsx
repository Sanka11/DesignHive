import React from "react";
import { formatDistanceToNow } from "date-fns";

const DEFAULT_PROFILE_PIC = "/assets/default-profile.png";

const ManagePostCard = ({ post, onEdit, onDelete }) => {
  const {
    content,
    createdAt,
    mediaUrls = [],
    user = {},
    likes = 0,
    id,
    designDisciplines = [],
    designProcess = [],
    tools = [],
    learningGoals = [],
    competitionInvolvement = [],
    skillLevel = "",
  } = post;

  const getTimeDisplay = () => {
    try {
      let date;

      if (createdAt && typeof createdAt.toDate === "function") {
        date = createdAt.toDate(); // Firestore Timestamp
      } else if (createdAt?.seconds) {
        date = new Date(createdAt.seconds * 1000);
      } else {
        date = new Date(createdAt);
      }

      return !isNaN(date)
        ? formatDistanceToNow(date, { addSuffix: true })
        : "Just now";
    } catch (e) {
      console.error("⛔ Error formatting date:", e);
      return "Just now";
    }
  };

  const getVideoMimeType = (url) => {
    const ext = url.split(".").pop().split("?")[0].toLowerCase();
    return {
      mp4: "video/mp4",
      webm: "video/webm",
      ogg: "video/ogg",
    }[ext] || "";
  };

  const allTags = [
    ...designDisciplines,
    ...designProcess,
    ...tools,
    ...learningGoals,
    ...competitionInvolvement,
    ...(skillLevel ? [skillLevel] : []),
  ];

  return (
    <div className="bg-white shadow-md rounded-xl overflow-hidden border border-gray-100 mb-6">
      {/* Header */}
      <div className="flex items-center p-4 space-x-4">
        <img
          src={user.avatar || DEFAULT_PROFILE_PIC}
          alt={user.name || "User"}
          className="w-12 h-12 rounded-full object-cover"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = DEFAULT_PROFILE_PIC;
          }}
        />
        <div>
          <h2 className="font-semibold">{user.name || "User"}</h2>
          <p className="text-sm text-gray-500">{getTimeDisplay()}</p>
        </div>
      </div>

      {/* Content & Tags */}
      <div className="px-4 pb-4">
        <p className="mb-2 text-gray-800 whitespace-pre-line">{content}</p>

        {/* Tags BEFORE media */}
        {allTags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {allTags.map((tag, index) => (
              <span
                key={index}
                className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Media */}
        {mediaUrls.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-3">
            {mediaUrls.map((url, i) => {
              const mimeType = getVideoMimeType(url);
              const isVideo = mimeType !== "";
              return isVideo ? (
                <video
                  key={i}
                  controls
                  className="w-full max-h-[200px] rounded-lg object-cover"
                >
                  <source src={url} type={mimeType} />
                </video>
              ) : (
                <img
                  key={i}
                  src={url}
                  alt="Post media"
                  className="rounded-lg w-full max-h-[200px] object-cover"
                />
              );
            })}
          </div>
        )}

        {/* Reactions & Actions */}
        <div className="text-sm text-gray-600 flex items-center justify-between">
          <span>{likes} {likes === 1 ? "Like" : "Likes"}</span>
          <div className="space-x-2">
            <button
              onClick={() => onEdit(post)}
              className="text-blue-600 hover:underline"
            >
              Edit
            </button>
            <button
              onClick={() => onDelete(post.id)}
              className="text-red-600 hover:underline"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagePostCard;
