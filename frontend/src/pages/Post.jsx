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
    createdAt,
  } = post;

  const [likes, setLikes] = useState(post.likes || 0);
  const [isLiked, setIsLiked] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [showComments, setShowComments] = useState(false);

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

  // Load comments
  useEffect(() => {
    axios
      .get(`http://localhost:9090/api/posts/${id}/comments`)
      .then((res) => setComments(res.data))
      .catch((err) => console.error("Error loading comments", err));
  }, [id]);

  // Load like state from localStorage
  useEffect(() => {
    const likedPosts = JSON.parse(localStorage.getItem("likedPosts") || "[]");
    setIsLiked(likedPosts.includes(id));
  }, [id]);

  // Handle like with localStorage update
  const handleLike = async () => {
    try {
      const res = await axios.post(`http://localhost:9090/api/posts/${id}/like`);
      setLikes(res.data.likes);

      const likedPosts = JSON.parse(localStorage.getItem("likedPosts") || "[]");
      let updatedLikes;
      if (isLiked) {
        updatedLikes = likedPosts.filter((pid) => pid !== id);
      } else {
        updatedLikes = [...likedPosts, id];
      }
      localStorage.setItem("likedPosts", JSON.stringify(updatedLikes));
      setIsLiked(!isLiked);
    } catch (err) {
      console.error("Error liking post", err);
    }
  };

  const handleAddComment = async () => {
    if (newComment.trim()) {
      try {
        const res = await axios.post(`http://localhost:9090/api/posts/${id}/comments`, {
          text: newComment,
        });
        setComments([...comments, res.data]);
        setNewComment("");
      } catch (err) {
        console.error("Error adding comment", err);
      }
    }
  };

  const getTimeDisplay = () => {
    try {
      const date = new Date(createdAt);
      if (!isNaN(date)) {
        return formatDistanceToNow(date, { addSuffix: true });
      }
    } catch (e) {}
    return "Just now";
  };

  const getVideoMimeType = (url) => {
    const extension = url.split(".").pop().split("?")[0].toLowerCase();
    switch (extension) {
      case "mp4":
        return "video/mp4";
      case "webm":
        return "video/webm";
      case "ogg":
        return "video/ogg";
      default:
        return "";
    }
  };
  

  return (
    <>
    <div className="bg-white rounded-xl shadow-md border border-gray-200 mb-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center p-4 border-b border-gray-100">
        <img
          src={DEFAULT_PROFILE_PIC}
          alt="User"
          className="w-10 h-10 rounded-full border object-cover"
        />
        <div className="ml-3">
          <p className="font-semibold text-gray-800">{authorUsername || authorEmail}</p>
          <p className="text-xs text-gray-500">{getTimeDisplay()}</p>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-3">
        <p className="text-gray-800 whitespace-pre-line">{content}</p>
      </div>

      {/* Tags */}
      {allTags.length > 0 && (
        <div className="px-4 flex flex-wrap gap-2 mb-4">
          {allTags.map((tag, i) => (
            <span
              key={i}
              className="bg-blue-50 text-blue-600 text-xs font-medium px-2 py-1 rounded-full border border-blue-100"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

     {/* Media */}
     {mediaUrls.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 px-4 mb-4">
            {mediaUrls.map((url, i) => {
              const mimeType = getVideoMimeType(url);
              const isVideo = mimeType !== "";

              return (
                <div key={i} className="rounded-md overflow-hidden border border-gray-200">
                  {isVideo ? (
                    <video controls className="w-full h-48 object-cover cursor-pointer" onClick={() => handleOpenMedia(url, true)}>
                      <source src={url} type={mimeType} />
                    </video>
                  ) : (
                    <img
                      src={url}
                      alt={`media-${i}`}
                      className="w-full h-48 object-cover object-top cursor-pointer"
                      onClick={() => handleOpenMedia(url, false)}
                    />
                  )}
                </div>
              );
            })}
          </div>
        )}
      <div className="px-4 py-2 border-t border-b text-sm text-gray-500 flex justify-between">
        <div>{likes} Likes</div>
        <div>{comments.length} Comments</div>
      </div>

      {/* Actions */}
      <div className="flex justify-around text-gray-600 px-2 py-1">
        <button
          onClick={handleLike}
          className={`w-full py-2 rounded-md hover:bg-gray-100 flex items-center justify-center ${
            isLiked ? "text-amber-600" : ""
          }`}
        >
          👍 Like
        </button>
        <button
          onClick={() => setShowComments(!showComments)}
          className="w-full py-2 rounded-md hover:bg-gray-100 flex items-center justify-center"
        >
          💬 Comment
        </button>
        <button className="w-full py-2 rounded-md hover:bg-gray-100 flex items-center justify-center">
          🔄 Share
        </button>
      </div>

      {/* Comments */}
      {showComments && (
        <div className="p-4 bg-gray-50 border-t border-gray-100">
          {/* Comment Input */}
          <div className="flex mb-3">
            <div className="w-8 h-8 rounded-full bg-amber-100 flex-shrink-0"></div>
            <div className="ml-2 flex-1">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write a comment..."
                onKeyPress={(e) => e.key === "Enter" && handleAddComment()}
                className="w-full px-4 py-2 rounded-full bg-white border border-gray-200 focus:outline-none focus:ring-2 focus:ring-amber-200"
              />
            </div>
          </div>

          {/* Comment List */}
          {comments.map((comment) => (
            <div key={comment.id} className="flex mb-3">
              <div className="w-8 h-8 rounded-full bg-amber-100 flex-shrink-0"></div>
              <div className="ml-2">
                <div className="bg-white p-3 rounded-2xl border border-gray-100">
                  <div className="font-semibold text-sm text-gray-800">
                    {comment.username || "User"}
                  </div>
                  <p className="text-sm text-gray-700">{comment.text}</p>
                </div>
                <div className="text-xs text-gray-500 mt-1 ml-2">
                  Like · Reply · Just now
                </div>
              </div>
            </div>
          ))}
          
        </div>
      )}
      </div>
      
      {modalMedia.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center z-50" onClick={handleCloseMedia}>
          <div className="relative bg-transparent max-w-3xl mx-auto rounded-lg overflow-hidden">
            <button onClick={handleCloseMedia} className="absolute top-2 right-2 text-white text-2xl">&times;</button>
            {modalMedia.isVideo ? <video controls autoPlay className="max-h-[80vh]"><source src={modalMedia.url} type={getVideoMimeType(modalMedia.url)} /></video> : <img src={modalMedia.url} className="max-h-[80vh]" />}
          </div>
        </div>
      )}
    </>
  );
};

export default Post;