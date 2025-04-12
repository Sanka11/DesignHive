import { useEffect, useState } from "react";
import axios from "axios";
import ManagePostCard from "../components/ManagePostCard";
import { useAuth } from "../auth/useAuth";
import { toast } from "react-toastify";
import NewPost from "./NewPost";
import EditPostModal from "../components/EditPostModal";
import "react-toastify/dist/ReactToastify.css";
import { FiPlus, FiLoader } from "react-icons/fi";

const ManagePosts = () => {
  const { user } = useAuth();
  const [myPosts, setMyPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState(null);

  // 🔄 Load posts by current user
  const fetchMyPosts = async () => {
    try {
      setIsLoading(true);
      const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/posts`);
      const allPosts = res.data;
  
      // Normalize tag arrays
      const normalizeTags = (tags) =>
        (tags || []).map((t) => (typeof t === "string" ? t : t?.value)).filter(Boolean);
  
      // Filter and normalize
      const filtered = allPosts
        .filter((post) => post.authorId === user?.id)
        .map((post) => ({
          ...post,
          designDisciplines: normalizeTags(post.designDisciplines),
          designProcess: normalizeTags(post.designProcess),
          tools: normalizeTags(post.tools),
          learningGoals: normalizeTags(post.learningGoals),
          competitionInvolvement: normalizeTags(post.competitionInvolvement),
        }));
  
      setMyPosts(filtered);
    } catch (err) {
      console.error("❌ Error fetching posts:", err);
      toast.error("Failed to load your posts.");
    } finally {
      setIsLoading(false);
    }
  }; 

  // 🗑️ Delete post
  const handleDelete = async (postId) => {
    const confirmed = window.confirm("⚠️ Are you sure you want to permanently delete this post?");
    if (!confirmed) return;

    try {
      await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/posts/${postId}`);
      setMyPosts((prev) => prev.filter((p) => p.id !== postId));
      toast.success("✅ Post deleted!");
    } catch (err) {
      console.error("Error deleting post", err);
      toast.error("Failed to delete post.");
    }
  };

  // ✏️ Edit post
  const handleEdit = (post) => {
    setEditingPost(post);
    setEditModalOpen(true);
  };

  // 🔁 After editing, refresh posts
  const handlePostUpdated = () => {
    toast.success("✅ Post updated!");
    fetchMyPosts(); // Refresh posts
    setEditModalOpen(false); // Close modal
    setEditingPost(null); // Clear editing post
  };

  const refreshPosts = () => {
    fetchMyPosts();
  };

  useEffect(() => {
    if (user?.id) {
      fetchMyPosts();
    }
  }, [user]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Manage Posts</h1>
        <p className="text-gray-600 mt-2">
          View and manage all your created posts
        </p>
      </div>

      {/* ➕ Add New Post */}
      {user && (
        <div className="mb-8">
          <NewPost user={user} refreshPosts={refreshPosts} />
        </div>
      )}

      {/* 🧾 Posts List */}
      <div>
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <FiLoader className="animate-spin text-3xl text-blue-600 mb-4" />
            <p className="text-gray-600">Loading your posts...</p>
          </div>
        ) : myPosts.length > 0 ? (
          <div className="space-y-6">
            {myPosts.map((post) => (
              <ManagePostCard
                key={post.id}
                post={post}
                onEdit={() => handleEdit(post)}
                onDelete={() => handleDelete(post.id)}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white shadow-sm rounded-xl p-8 text-center border border-gray-200">
            <p className="text-gray-600">
              You haven't created any posts yet. Create your first post above.
            </p>
          </div>
        )}
      </div>

      {/* ✏️ Edit Modal */}
      <EditPostModal
        isOpen={editModalOpen}
        onRequestClose={() => {
          setEditModalOpen(false);
          setEditingPost(null);
        }}
        post={editingPost}
        user={user}
        onPostUpdated={handlePostUpdated}
      />
    </div>
  );
};

export default ManagePosts;