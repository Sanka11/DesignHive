import { useEffect, useState } from "react";
import axios from "axios";
import ManagePostCard from "../components/ManagePostCard";
import { useAuth } from "../auth/useAuth";
import { toast } from "react-toastify";
import NewPost from "./NewPost";
import EditPostModal from "../components/EditPostModal";
import { FiLoader } from "react-icons/fi";
import { GiBee, GiHoneycomb } from "react-icons/gi";
import "react-toastify/dist/ReactToastify.css";
import ConfirmDialog from "../components/modals/ConfirmDialog";

const ManagePosts = () => {
  const { user } = useAuth();
  const [myPosts, setMyPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmType, setConfirmType] = useState("delete");
  const [selectedPostId, setSelectedPostId] = useState(null);

  const fetchMyPosts = async () => {
    try {
      setIsLoading(true);
      const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/posts`);
      const allPosts = res.data;

      const normalizeTags = (tags) =>
        (tags || [])
          .map((t) => (typeof t === "string" ? t : t?.value))
          .filter(Boolean);

      const filtered = allPosts
        .filter((post) => post.authorId === user?.id)
        .map((post) => ({
          ...post,
          designDisciplines: normalizeTags(post.designDisciplines),
          designProcess: normalizeTags(post.designProcess),
          tools: normalizeTags(post.tools),
          learningGoals: normalizeTags(post.learningGoals),
          competitionInvolvement: normalizeTags(post.competitionInvolvement),
          createdAt: post.createdAt?.seconds
            ? new Date(post.createdAt.seconds * 1000)
            : null,
          updatedAt: post.updatedAt?.seconds
            ? new Date(post.updatedAt.seconds * 1000)
            : null,
        }));

      setMyPosts(filtered);
    } catch (err) {
      console.error("❌ Error fetching posts:", err);
      toast.error("Failed to load your posts.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = (postId) => {
    setSelectedPostId(postId);
    setConfirmType("delete");
    setShowConfirm(true);
  };

  const handleEdit = (post) => {
    setEditingPost(post);
    setConfirmType("update");
    setShowConfirm(true);
  };

  const confirmAction = async () => {
    if (confirmType === "delete") {
      try {
        await axios.delete(
          `${import.meta.env.VITE_API_BASE_URL}/posts/${selectedPostId}`
        );
        setMyPosts((prev) => prev.filter((p) => p.id !== selectedPostId));
        toast.success("✅ Post deleted!");
      } catch (err) {
        console.error("Error deleting post", err);
        toast.error("Failed to delete post.");
      }
    } else if (confirmType === "update" && editingPost) {
      setEditModalOpen(true);
    }
    setShowConfirm(false);
    setSelectedPostId(null);
  };

  const handlePostUpdated = () => {
    toast.success("✅ Post updated!");
    fetchMyPosts();
    setEditModalOpen(false);
    setEditingPost(null);
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
    <div className="min-h-screen bg-amber-50 bg-opacity-50 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiBvcGFjaXR5PSIwLjEiPjxkZWZzPjxwYXR0ZXJuIGlkPSJkaWFnb25hbF9oYXRjaCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgd2lkdGg9IjEwIiBoZWlnaHQ9IjEwIiBwYXR0ZXJuVHJhbnNmb3JtPSJyb3RhdGUoNDUpIj48cmVjdCB3aWR0aD0iMSIgaGVpZ2h0PSIxIiBmaWxsPSIjMDAwIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2RpYWdvbmFsX2hhdGNoKSIvPjwvc3ZnPg==')]">
      <div className="max-w-[87rem] mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center justify-center my-6 gap-2">
          <GiHoneycomb className="text-3xl text-amber-500" />
          <h2 className="text-3xl font-bold text-amber-900 font-serif">
            Manage Your Posts
          </h2>
          <GiBee className="text-3xl text-amber-500" />
        </div>

        {user && (
          <div className="mb-10">
            <NewPost user={user} refreshPosts={refreshPosts} />
          </div>
        )}

        <div>
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 bg-amber-100 rounded-xl shadow-lg border border-amber-200">
              <FiLoader className="animate-spin text-3xl text-amber-600 mb-4" />
              <p className="text-amber-800">
                Gathering your hive... (loading posts)
              </p>
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

        <ConfirmDialog
          isOpen={showConfirm}
          title={confirmType === "delete" ? "Delete Post" : "Edit Post"}
          message={
            confirmType === "delete"
              ? "Are you sure you want to delete this post? This action cannot be undone."
              : "Are you sure you want to update this post?"
          }
          onConfirm={confirmAction}
          onCancel={() => setShowConfirm(false)}
          confirmLabel={
            confirmType === "delete" ? "Yes, Delete" : "Yes, Update"
          }
        />
      </div>
    </div>
  );
};

export default ManagePosts;
