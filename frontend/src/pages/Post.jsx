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
      const res = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/posts/${id}/like`
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
      const storedUser = localStorage.getItem("loggedInUser");
      const user = storedUser ? JSON.parse(storedUser) : null;
      if (!user || !user.username) return;

      const res = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/posts/${id}/comments`,
        {
          text: newComment,
          email: user.email,
          username: user.username,
        }
      );

      const addedComment = res.data;
      setComments((prev) => [addedComment, ...prev]);
      setNewComment("");
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
        <button className="w-full py-2 flex justify-center items-center hover:bg-gray-100 rounded-md">
          🔄 <span className="ml-2">Share</span>
        </button>
      </div>

      {showComments && (
        <div className="p-4 bg-gray-50 border-t">
          <div className="flex mb-4 gap-2">
            <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-sm">
              {user?.username?.charAt(0) || user?.email?.charAt(0) || "U"}
            </div>
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddComment()}
              placeholder="Write a comment..."
              className="flex-grow border rounded px-3 py-1 text-sm"
            />
            <button
              onClick={handleAddComment}
              className="text-blue-600 text-sm font-semibold"
            >
              Post
            </button>
          </div>

          {comments.map((comment) => (
            <div key={comment.id} className="flex mb-3">
              <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-xs">
                {comment.commentUser?.charAt(0) ||
                  comment.commentEmail?.charAt(0) ||
                  "U"}
              </div>
              <div className="ml-2 w-full">
                <div className="bg-white p-3 rounded-2xl border">
                  <div className="font-semibold text-sm mb-1">
                    {comment.commentUser ||
                      comment.commentEmail?.split("@")[0] ||
                      "User"}
                  </div>
                  {editingCommentId === comment.id ? (
                    <>
                      <textarea
                        value={editedCommentText}
                        onChange={(e) => setEditedCommentText(e.target.value)}
                        className="w-full mt-2 p-2 border rounded"
                      />
                      <div className="flex gap-2 mt-2">
                        <button
                          onClick={() => handleEditComment(comment.id)}
                          className="text-green-600 text-sm"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingCommentId(null)}
                          className="text-gray-600 text-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <p className="text-sm text-gray-700 mb-2">
                        {comment.text}
                      </p>
                      <div className="flex justify-between text-xs text-gray-500">
                        <button
                          onClick={() => {
                            setEditingCommentId(comment.id);
                            setEditedCommentText(comment.text);
                          }}
                          className="hover:underline"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteComment(comment.id)}
                          className="hover:underline"
                        >
                          Delete
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Post;
