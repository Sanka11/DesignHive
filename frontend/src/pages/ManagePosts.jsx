import { useEffect, useState } from "react";
import axios from "axios";
import ManagePostCard from "../components/ManagePostCard";
import { useAuth } from "../auth/useAuth";
import { toast } from "react-toastify";
import NewPost from "./NewPost";
import EditPostModal from "../components/EditPostModal";

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
      const res = await axios.get("http://localhost:9090/api/posts");
      const allPosts = res.data;
      const filtered = allPosts.filter((post) => post.authorId === user?.id);
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
      await axios.delete(`http://localhost:9090/api/posts/${postId}`);
      toast.success("✅ Post deleted!");
      setMyPosts((prev) => prev.filter((p) => p.id !== postId));
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
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* ➕ Add New Post */}
      {user && <NewPost user={user} refreshPosts={refreshPosts} />}

      {/* 🧾 Posts List */}
      <div className="mt-8">
        {isLoading ? (
          <p className="text-center text-gray-500">Loading your posts...</p>
        ) : myPosts.length > 0 ? (
          myPosts.map((post) => (
            <ManagePostCard
              key={post.id}
              post={post}
              onEdit={() => handleEdit(post)}
              onDelete={() => handleDelete(post.id)}
            />
          ))
        ) : (
          <p className="text-center text-gray-500">You haven’t created any posts yet.</p>
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
        onPostUpdated={handlePostUpdated}
      />
    </div>
  );
};

export default ManagePosts;
