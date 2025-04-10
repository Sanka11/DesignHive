import { useEffect, useState } from "react";
import axios from "axios";
import { formatDistanceToNow } from "date-fns";

const DEFAULT_PROFILE_PIC = "/assets/my-default.png";

const Post = ({ post }) => {
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
    profileImagePath,
    createdAt,
  } = post;

  const [likes, setLikes] = useState(post.likes || 0);
  const [isLiked, setIsLiked] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [showComments, setShowComments] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editedCommentText, setEditedCommentText] = useState("");

  const [modalMedia, setModalMedia] = useState({ isOpen: false, url: "", isVideo: false });

  const handleOpenMedia = (url, isVideo) => {
    setModalMedia({ isOpen: true, url, isVideo });
  };

  const handleCloseMedia = () => {
    setModalMedia({ isOpen: false, url: "", isVideo: false });
  };

  const allTags = [
    ...designDisciplines,
    ...designProcess,
    ...tools,
    ...learningGoals,
    ...competitionInvolvement,
    ...(skillLevel ? [skillLevel] : []),
  ];

  useEffect(() => {
    fetchComments();
  }, [id]);

  const fetchComments = async () => {
    try {
      const res = await axios.get(`http://localhost:9090/api/posts/${id}/comments`);
      setComments(res.data);
    } catch (err) {
      console.error("Error loading comments", err);
    }
  };

  useEffect(() => {
    const likedPosts = JSON.parse(localStorage.getItem("likedPosts") || "[]");
    setIsLiked(likedPosts.includes(id));
  }, [id]);

  const handleLike = async () => {
    try {
      const res = await axios.post(`http://localhost:9090/api/posts/${id}/like`);
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
    if (newComment.trim()) {
      try {
        await axios.post(`http://localhost:9090/api/posts/${id}/comments`, {
          text: newComment,
        });
        setNewComment("");
        fetchComments();
      } catch (err) {
        console.error("Error adding comment", err);
      }
    }
  };

  const handleEditComment = async (commentId) => {
    try {
      await axios.put(`http://localhost:9090/api/posts/${id}/comments/${commentId}`, {
        text: editedCommentText,
      });
      setEditingCommentId(null);
      setEditedCommentText("");
      fetchComments();
    } catch (err) {
      console.error("Error editing comment", err);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await axios.delete(`http://localhost:9090/api/posts/${id}/comments/${commentId}`);
      fetchComments();
    } catch (err) {
      console.error("Error deleting comment", err);
    }
  };

  const getTimeDisplay = () => {
    try {
      let date;
  
      if (createdAt && typeof createdAt.toDate === "function") {
        date = createdAt.toDate(); // ✅ Firestore Timestamp (rarely this happens in JS)
      } else if (createdAt && createdAt.seconds) {
        date = new Date(createdAt.seconds * 1000); // ✅ convert Firestore timestamp manually
      } else {
        date = new Date(createdAt); // fallback
      }
  
      return !isNaN(date) ? formatDistanceToNow(date, { addSuffix: true }) : "Just now";
    } catch (e) {
      console.error("❌ Timestamp error:", e);
      return "Just now";
    }
  };
  
  

  const getVideoMimeType = (url) => {
    const ext = url.split(".").pop().split("?")[0].toLowerCase();
    return { mp4: "video/mp4", webm: "video/webm", ogg: "video/ogg" }[ext] || "";
  };

  return (
    <>
      <div className="bg-white rounded-xl shadow-md border border-gray-200 mb-6 max-w-2xl mx-auto">
        {/* Post Header */}
        <div className="flex items-center p-4 border-b">
        <img
  src={post.user?.avatar || "/assets/default-profile.png"}
  onError={(e) => {
    e.target.onerror = null;
    e.target.src = "/assets/default-profile.png";
  }}
  alt={post.user?.name}
  className="w-10 h-10 rounded-full object-cover"
/>


          <div className="ml-3">
            <p className="font-semibold text-gray-800">{authorUsername || authorEmail}</p>
            <p className="text-xs text-gray-500">{getTimeDisplay()}</p>
          </div>
        </div>

        {/* Post Content */}
        <div className="px-4 py-3">
          <p className="text-gray-800 whitespace-pre-line">{content}</p>
        </div>

        {/* Tags */}
        {allTags.length > 0 && (
          <div className="px-4 flex flex-wrap gap-2 mb-4">
            {allTags.map((tag) => (
              <span key={tag} className="bg-blue-50 text-blue-600 text-xs px-2 py-1 rounded-full">
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Media */}
        {mediaUrls.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 px-4 mb-4">
            {mediaUrls.map((url) => {
              const mimeType = getVideoMimeType(url);
              const isVideo = mimeType !== "";
              return (
                <div key={url} className="rounded-md overflow-hidden border">
                  {isVideo ? (
                    <video controls className="w-full h-48 object-cover cursor-pointer" onClick={() => handleOpenMedia(url, true)}>
                      <source src={url} type={mimeType} />
                    </video>
                  ) : (
                    <img src={url} className="w-full h-48 object-cover cursor-pointer" onClick={() => handleOpenMedia(url, false)} />
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Reactions */}
        <div className="px-4 py-2 border-t border-b text-sm text-gray-500 flex justify-between">
          <div className="flex items-center">
            <span className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs mr-1">👍</span>
            <span>{likes} {likes === 1 ? 'Like' : 'Likes'}</span>
          </div>
          <div className="hover:underline cursor-pointer" onClick={() => setShowComments(!showComments)}>
            {comments.length} {comments.length === 1 ? 'Comment' : 'Comments'}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-around text-gray-600 px-2 py-1 border-b">
          <button 
            onClick={handleLike} 
            className={`flex items-center justify-center w-full py-2 hover:bg-gray-100 rounded-md transition-colors ${isLiked ? "text-blue-600 font-medium" : ""}`}
          >
            <span className="mr-2 text-lg">{isLiked ? "👍" : "👍"}</span>
            <span>Like</span>
          </button>
          <button 
            onClick={() => setShowComments(!showComments)} 
            className="flex items-center justify-center w-full py-2 hover:bg-gray-100 rounded-md transition-colors"
          >
            <span className="mr-2 text-lg">💬</span>
            <span>Comment</span>
          </button>
          <button className="flex items-center justify-center w-full py-2 hover:bg-gray-100 rounded-md transition-colors">
            <span className="mr-2 text-lg">🔄</span>
            <span>Share</span>
          </button>
        </div>

        {/* Comments */}
        {showComments && (
          <div className="p-4 bg-gray-50 border-t">
            {/* Input */}
            <div className="flex mb-3">
              <div className="w-8 h-8 rounded-full bg-amber-100"></div>
              <div className="ml-2 flex-1">
                <input
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddComment()}
                  className="w-full px-4 py-2 rounded-full bg-white border"
                  placeholder="Write a comment..."
                />
              </div>
            </div>

            {/* List */}
            {comments.map((comment) => (
              <div key={comment.id} className="flex mb-3">
                <div className="w-8 h-8 rounded-full bg-amber-100"></div>
                <div className="ml-2 w-full">
                  <div className="bg-white p-3 rounded-2xl border">
                    <div className="font-semibold text-sm text-gray-800">
                      {comment.authorUsername || comment.authorEmail || "User"}
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
                            className="text-blue-600 text-sm"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => {
                              setEditingCommentId(null);
                              setEditedCommentText("");
                            }}
                            className="text-gray-500 text-sm"
                          >
                            Cancel
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <p className="text-sm text-gray-700">{comment.text}</p>
                        <div className="text-xs text-gray-500 mt-1 ml-2 flex gap-3">
                          <button
                            onClick={() => {
                              setEditingCommentId(comment.id);
                              setEditedCommentText(comment.text);
                            }}
                          >
                            Edit
                          </button>
                          <button onClick={() => handleDeleteComment(comment.id)}>Delete</button>
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

      {/* Modal */}
      {modalMedia.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center z-50" onClick={handleCloseMedia}>
          <div className="relative bg-transparent max-w-3xl mx-auto rounded-lg overflow-hidden">
            <button onClick={handleCloseMedia} className="absolute top-2 right-2 text-white text-2xl">
              &times;
            </button>
            {modalMedia.isVideo ? (
              <video controls autoPlay className="max-h-[80vh]">
                <source src={modalMedia.url} type={getVideoMimeType(modalMedia.url)} />
              </video>
            ) : (
              <img src={modalMedia.url} className="max-h-[80vh]" alt="modal media" />
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default Post;