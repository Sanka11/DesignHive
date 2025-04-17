import { useEffect, useState } from "react";
import axios from "axios";
import { formatDistanceToNow } from "date-fns";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const DEFAULT_PROFILE_PIC = "/assets/default-profile.png";

const Post = ({ user = {}, post }) => {
  if (!post) return null;

  const {
    id,
    content,
    authorUsername,
    authorEmail,
    mediaUrls = [],
    designDisciplines = [],
    designProcess = [],
    tools = [],
    learningGoals = [],
    competitionInvolvement = [],
    skillLevel,
    createdAt,
    updatedAt,
    user: postUser,
    likes: initialLikes = 0,
  } = post;

  const [likes, setLikes] = useState(initialLikes);
  const [isLiked, setIsLiked] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [showComments, setShowComments] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editedCommentText, setEditedCommentText] = useState("");
  const [isAddingComment, setIsAddingComment] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState(null);

  const allTags = [
    ...designDisciplines,
    ...designProcess,
    ...tools,
    ...learningGoals,
    ...competitionInvolvement,
    ...(skillLevel ? [skillLevel] : []),
  ];

  const isUpdated = updatedAt && updatedAt !== createdAt;

  const getFormattedDate = (dateRef) => {
    try {
      const date =
        dateRef?.toDate?.() ??
        new Date(dateRef?.seconds ? dateRef.seconds * 1000 : dateRef);
      return formatDistanceToNow(date, { addSuffix: true });
    } catch {
      return "Just now";
    }
  };

  useEffect(() => {
    const fetchUserWithAvatar = async () => {
      const storedUser = localStorage.getItem("loggedInUser");
      if (!storedUser) return;

      const parsed = JSON.parse(storedUser);
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/user/email/${parsed.email}`
        );
        setLoggedInUser({ ...parsed, avatar: res.data.profileImagePath });
      } catch (err) {
        console.warn("⚠️ Could not fetch user profile image", err);
        setLoggedInUser(parsed);
      }
    };

    fetchUserWithAvatar();
  }, []);

  useEffect(() => {
    if (id) fetchComments();
  }, [id]);

  useEffect(() => {
    const likedPosts = JSON.parse(localStorage.getItem("likedPosts") || "[]");
    setIsLiked(likedPosts.includes(id));
  }, [id]);

  const fetchComments = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/posts/${id}/comments`
      );
      setComments(res.data);
    } catch (err) {
      console.error("Error loading comments", err);
    }
  };

  const handleLike = async () => {
    try {
      const email = post?.authorEmail; // make sure user is defined
      const username = post?.authorUsername;

      if (!email || !username) {
        console.error("Missing email or username");
        return;
      }

      const res = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/posts/${id}/like`,
        {
          email,
          username,
        }
      );

      setLikes(res.data.likes);

      const likedPosts = JSON.parse(localStorage.getItem("likedPosts") || "[]");
      const updatedLikes = isLiked
        ? likedPosts.filter((pid) => pid !== id)
        : [...likedPosts, id];

      localStorage.setItem("likedPosts", JSON.stringify(updatedLikes));
      setIsLiked(!isLiked);
    } catch (err) {
      console.error("Error liking post", err);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    try {
      setIsAddingComment(true);

      if (!loggedInUser?.username) {
        console.error("⚠️ User not found in localStorage");
        return;
      }

      await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/posts/${id}/comments`,
        {
          text: newComment,
          email: loggedInUser.email,
          username: loggedInUser.username,
        }
      );

      setNewComment("");
      fetchComments(); // ✅ refresh comments from backend
    } catch (err) {
      console.error("❌ Error adding comment:", err);
    } finally {
      setIsAddingComment(false);
    }
  };

  const handleEditComment = async (commentId) => {
    try {
      await axios.put(
        `${
          import.meta.env.VITE_API_BASE_URL
        }/posts/${id}/comments/${commentId}`,
        {
          text: editedCommentText,
        }
      );
      setEditingCommentId(null);
      setEditedCommentText("");
      fetchComments();
    } catch (err) {
      console.error("Error editing comment", err);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await axios.delete(
        `${import.meta.env.VITE_API_BASE_URL}/posts/${id}/comments/${commentId}`
      );
      fetchComments();
    } catch (err) {
      console.error("Error deleting comment", err);
    }
  };

  const getTimeDisplay = () => {
    try {
      let date;

      if (createdAt?.toDate) {
        date = createdAt.toDate(); // Firebase Timestamp
      } else if (createdAt?.seconds) {
        date = new Date(createdAt.seconds * 1000); // Firestore timestamp format
      } else if (
        typeof createdAt === "string" ||
        typeof createdAt === "number"
      ) {
        date = new Date(createdAt); // ISO string or number
      } else {
        return "Just now";
      }

      if (isNaN(date.getTime())) {
        return "Just now"; // Invalid Date
      }

      return formatDistanceToNow(date, { addSuffix: true });
    } catch (err) {
      console.error("Time formatting error:", err);
      return "Just now";
    }
  };

  const getVideoMimeType = (url) => {
    const ext = url.split(".").pop().split("?")[0].toLowerCase();
    return (
      { mp4: "video/mp4", webm: "video/webm", ogg: "video/ogg" }[ext] || ""
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-200 mb-6 max-w-2xl mx-auto">
      <div className="flex items-center p-4 border-b">
        <img
          src={postUser?.avatar || DEFAULT_PROFILE_PIC}
          onError={(e) => (e.target.src = DEFAULT_PROFILE_PIC)}
          alt="User Avatar"
          className="w-10 h-10 rounded-full object-cover"
        />
        <div className="ml-3">
          <div className="flex items-center gap-2">
            <p className="font-semibold text-gray-800">
              {authorUsername || authorEmail}
            </p>
            {isUpdated && (
              <span className="text-xs text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                🛠 Updated
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500">
            Posted {getFormattedDate(createdAt)}
          </p>
          {isUpdated && (
            <p className="text-xs text-amber-500">
              Edited {getFormattedDate(updatedAt)}
            </p>
          )}
        </div>
      </div>

      <div className="px-4 py-3">
        <p className="text-gray-800 whitespace-pre-line">{content}</p>
      </div>

      {allTags.length > 0 && (
        <div className="px-4 flex flex-wrap gap-2 mb-4">
          {allTags.map((tag) => (
            <span
              key={tag}
              className="bg-blue-50 text-blue-600 text-xs px-2 py-1 rounded-full"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {mediaUrls.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 px-4 mb-4">
          {mediaUrls.map((url) => {
            const mimeType = getVideoMimeType(url);
            const isVideo = Boolean(mimeType);
            return (
              <div key={url} className="rounded-md overflow-hidden border">
                {isVideo ? (
                  <video
                    controls
                    className="w-full h-48 object-cover cursor-pointer"
                  >
                    <source src={url} type={mimeType} />
                  </video>
                ) : (
                  <img
                    src={url}
                    className="w-full h-48 object-cover"
                    alt="Post Media"
                  />
                )}
              </div>
            );
          })}
        </div>
      )}

      <div className="px-4 py-2 border-t border-b text-sm text-gray-500 flex justify-between">
        <div className="flex items-center">
          <span className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs mr-1">
            👍
          </span>
          <span>
            {likes} {likes === 1 ? "Like" : "Likes"}
          </span>
        </div>
        <div
          className="hover:underline cursor-pointer"
          onClick={() => setShowComments(!showComments)}
        >
          {comments.length} {comments.length === 1 ? "Comment" : "Comments"}
        </div>
      </div>

      <div className="flex justify-around text-gray-600 px-2 py-1 border-b">
        <button
          onClick={handleLike}
          className={`w-full py-2 flex justify-center items-center hover:bg-gray-100 rounded-md ${
            isLiked ? "text-blue-600 font-semibold" : ""
          }`}
        >
          👍 <span className="ml-2">Like</span>
        </button>
        <button
          onClick={() => setShowComments(!showComments)}
          className="w-full py-2 flex justify-center items-center hover:bg-gray-100 rounded-md"
        >
          💬 <span className="ml-2">Comment</span>
        </button>
      </div>

      {/* Comments Section */}
      {/* Comments Section */}
      {showComments && (
        <div className="p-4 bg-gray-50 border-t">
          {/* Add Comment - Improved */}
          <div className="flex mb-4 gap-2 items-center">
            <img
              src={loggedInUser?.avatar || DEFAULT_PROFILE_PIC}
              onError={(e) => (e.target.src = DEFAULT_PROFILE_PIC)}
              alt="User Avatar"
              className="w-8 h-8 rounded-full object-cover"
            />
            <div className="flex-grow relative">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddComment()}
                placeholder="Write a comment..."
                className="w-full border border-gray-300 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                onClick={handleAddComment}
                disabled={isAddingComment || !newComment.trim()}
                className={`absolute right-2 top-1/2 transform -translate-y-1/2 ${
                  isAddingComment || !newComment.trim()
                    ? "text-gray-400"
                    : "text-blue-600 hover:text-blue-700"
                } font-semibold text-sm`}
              >
                {isAddingComment ? "Posting..." : "Post"}
              </button>
            </div>
          </div>

          {/* Comments List - Improved */}
          <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
            {comments.length === 0 ? (
              <div className="text-center py-4 text-gray-500 text-sm">
                No comments yet. Be the first to comment!
              </div>
            ) : (
              comments.map((comment) => {
                const isOwner = loggedInUser?.email === comment.commentEmail;
                return (
                  <div key={comment.id} className="flex gap-3 group">
                    <img
                      src={comment.avatar || DEFAULT_PROFILE_PIC}
                      onError={(e) => (e.target.src = DEFAULT_PROFILE_PIC)}
                      alt="Commenter Avatar"
                      className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                    />

                    <div className="flex-1 min-w-0">
                      <div className="bg-white p-3 rounded-2xl shadow-sm border border-gray-200 hover:border-gray-300 transition-colors">
                        <div className="flex justify-between items-start mb-1">
                          <span className="font-semibold text-sm text-gray-800">
                            {comment.commentUser || comment.commentEmail}
                          </span>
                          <span className="text-xs text-gray-500">
                            {formatDistanceToNow(
                              new Date(
                                comment.createdAt?.seconds
                                  ? comment.createdAt.seconds * 1000
                                  : comment.createdAt
                              ),
                              { addSuffix: true }
                            )}
                          </span>
                        </div>

                        {editingCommentId === comment.id ? (
                          <div className="space-y-2">
                            <textarea
                              className="w-full border p-2 text-sm rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                              value={editedCommentText}
                              onChange={(e) =>
                                setEditedCommentText(e.target.value)
                              }
                              rows="3"
                              autoFocus
                            />
                            <div className="flex gap-2 justify-end text-xs">
                              <button
                                className="px-3 py-1 bg-gray-200 rounded-lg hover:bg-gray-300"
                                onClick={() => setEditingCommentId(null)}
                              >
                                Cancel
                              </button>
                              <button
                                className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                                onClick={() => handleEditComment(comment.id)}
                                disabled={!editedCommentText.trim()}
                              >
                                Save
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="text-sm text-gray-800 whitespace-pre-line">
                            {comment.text}
                          </div>
                        )}
                      </div>

                      {/* Action Buttons - Only visible on hover or when owner */}
                      {isOwner && (
                        <div className="flex gap-3 mt-1 opacity-0 group-hover:opacity-100 transition-opacity text-xs text-gray-500">
                          <button
                            onClick={() => {
                              setEditingCommentId(comment.id);
                              setEditedCommentText(comment.text);
                            }}
                            className="hover:text-blue-600"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteComment(comment.id)}
                            className="hover:text-red-600"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Post;
