import { useEffect, useState } from "react";
import axios from "axios";

const Post = ({ post }) => {
    if (!post) return null;
  
    const [likes, setLikes] = useState(post.likes || 0);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState("");
    const [isLiked, setIsLiked] = useState(false);
    const [showComments, setShowComments] = useState(false);

    useEffect(() => {
        axios.get(`http://localhost:9090/api/posts/${post.id}/comments`)
            .then(res => setComments(res.data))
            .catch(err => console.error("Error loading comments", err));
    }, [post.id]);

    const handleLike = async () => {
        try {
            const res = await axios.post(`http://localhost:9090/api/posts/${post.id}/like`);
            setLikes(res.data.likes);
            setIsLiked(!isLiked);
        } catch (err) {
            console.error("Error liking post", err);
        }
    };

    const handleAddComment = async () => {
        if (newComment.trim()) {
            try {
                const res = await axios.post(`http://localhost:9090/api/posts/${post.id}/comments`, {
                    text: newComment
                });
                setComments([...comments, res.data]);
                setNewComment("");
            } catch (err) {
                console.error("Error adding comment", err);
            }
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-md mb-4 border border-gray-200 max-w-2xl mx-auto">
            {/* Post Header */}
            <div className="flex items-center p-3 border-b border-gray-200">
                <div className="w-10 h-10 rounded-full bg-amber-400 flex items-center justify-center text-white font-bold">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
                    </svg>
                </div>
                <div className="ml-2">
                    <div className="font-semibold text-gray-900">{post.username}</div>
                    <div className="text-xs text-gray-500">Just now</div>
                </div>
            </div>

            {/* Post Content */}
            <div className="p-3">
                <p className="text-gray-800">{post.content}</p>
            </div>

            {/* Post Stats */}
            <div className="px-3 py-2 border-t border-b border-gray-200 text-sm text-gray-500 flex justify-between">
                <div>{likes} Likes</div>
                <div>{comments.length} comments</div>
            </div>

            {/* Post Actions */}
            <div className="flex justify-around p-1 text-gray-500">
                <button 
                    onClick={handleLike}
                    className={`flex items-center justify-center w-full py-2 rounded-md hover:bg-gray-100 ${isLiked ? 'text-amber-600' : ''}`}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                    </svg>
                    Post
                </button>
                <button 
                    onClick={() => setShowComments(!showComments)}
                    className="flex items-center justify-center w-full py-2 rounded-md hover:bg-gray-100"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zM7 8H5v2h2V8zm2 0h2v2H9V8zm6 0h-2v2h2V8z" clipRule="evenodd" />
                    </svg>
                    Comment
                </button>
                <button className="flex items-center justify-center w-full py-2 rounded-md hover:bg-gray-100">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
                    </svg>
                    Share
                </button>
            </div>

            {/* Comments Section */}
            {showComments && (
                <div className="p-3 bg-gray-50">
                    {/* Comment Input */}
                    <div className="flex mb-3">
                        <div className="w-8 h-8 rounded-full bg-amber-100 flex-shrink-0"></div>
                        <div className="ml-2 flex-1">
                            <input
                                type="text"
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                className="w-full p-2 bg-gray-100 rounded-full border-none focus:outline-none focus:ring-2 focus:ring-amber-200"
                                placeholder="Write a comment..."
                                onKeyPress={(e) => e.key === 'Enter' && handleAddComment()}
                            />
                        </div>
                    </div>

                    {/* Comments List */}
                    {comments.map(comment => (
                        <div key={comment.id} className="flex mb-3">
                            <div className="w-8 h-8 rounded-full bg-amber-100 flex-shrink-0"></div>
                            <div className="ml-2">
                                <div className="bg-gray-100 p-2 rounded-2xl">
                                    <div className="font-semibold text-sm">Commenter Name</div>
                                    <p className="text-sm">{comment.text}</p>
                                </div>
                                <div className="text-xs text-gray-500 mt-1 ml-2">Like · Reply · Just now</div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Post;