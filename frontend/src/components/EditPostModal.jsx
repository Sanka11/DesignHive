import { useEffect, useState } from "react";
import Modal from "react-modal";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../services/firebase";
import { toast } from "react-toastify";
import axios from "axios";
import { X } from "lucide-react";

const EditPostModal = ({ isOpen, onRequestClose, post, onPostUpdated }) => {
  const [content, setContent] = useState("");
  const [existingMedia, setExistingMedia] = useState([]);
  const [newMediaFiles, setNewMediaFiles] = useState([]);
  const [newPreviewURLs, setNewPreviewURLs] = useState([]);
  const [isUpdating, setIsUpdating] = useState(false);

  // Reset all fields on modal open/close
  useEffect(() => {
    if (isOpen && post) {
      setContent(post.content || "");
      setExistingMedia(post.mediaUrls || []);
      setNewMediaFiles([]);
      setNewPreviewURLs([]);
    } else {
      setContent("");
      setExistingMedia([]);
      setNewMediaFiles([]);
      setNewPreviewURLs([]);
    }
  }, [isOpen, post]);

  const handleMediaChange = (e) => {
    const files = Array.from(e.target.files);
    setNewMediaFiles((prev) => [...prev, ...files]);
    setNewPreviewURLs((prev) => [...prev, ...files.map((file) => URL.createObjectURL(file))]);
  };

  const handleRemoveExisting = (index) => {
    setExistingMedia((prev) => prev.filter((_, i) => i !== index));
  };

  const handleRemoveNew = (index) => {
    setNewMediaFiles((prev) => prev.filter((_, i) => i !== index));
    setNewPreviewURLs((prev) => prev.filter((_, i) => i !== index));
  };

  const isVideo = (url) => /\.(mp4|webm|ogg)$/i.test(url);

  const handleUpdate = async () => {
    const confirmed = window.confirm("Are you sure you want to update this post?");
    if (!confirmed) return;
  
    try {
      setIsUpdating(true);
  
      const uploadedUrls = [];
  
      for (let file of newMediaFiles) {
        const fileRef = ref(storage, `posts/${post.authorId}/${Date.now()}_${file.name}`);
        const snapshot = await uploadBytes(fileRef, file);
        const url = await getDownloadURL(snapshot.ref);
        uploadedUrls.push(url);
      }
  
      const updatedPost = {
        content,
        mediaUrls: [...existingMedia, ...uploadedUrls],
      };
  
      await axios.put(`http://localhost:9090/api/posts/${post.id}`, updatedPost);
  
      toast.success("✅ Post updated successfully!");
  
      // Delay closing the modal slightly to let toast render
      setTimeout(() => {
        onPostUpdated();     // 🔄 Refresh the post list
        onRequestClose();    // ❌ Close the modal
      }, 100); // small delay to avoid race condition
  
    } catch (err) {
      console.error("Error updating post:", err);
      toast.error("❌ Failed to update post");
    } finally {
      setIsUpdating(false);
    }
  };
  
  

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      contentLabel="Edit Post"
      ariaHideApp={false}
      className="bg-white p-6 rounded-lg shadow-md max-w-2xl mx-auto mt-20 outline-none"
      overlayClassName="fixed inset-0 bg-black/50 z-50 flex justify-center items-start"
    >
      <h2 className="text-xl font-semibold mb-4">✏️ Edit Post</h2>

      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="w-full p-3 border rounded-md mb-4"
        rows={4}
        placeholder="Update your design story..."
      />

      {/* Existing Media */}
      {existingMedia.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
          {existingMedia.map((url, i) => (
            <div key={i} className="relative border rounded overflow-hidden">
              <button
                onClick={() => handleRemoveExisting(i)}
                className="absolute top-1 right-1 bg-white rounded-full shadow p-1 text-red-500 z-10"
              >
                <X size={16} />
              </button>
              {isVideo(url) ? (
                <video controls src={url} className="w-full h-32 object-cover" />
              ) : (
                <img src={url} alt="media" className="w-full h-32 object-cover" />
              )}
            </div>
          ))}
        </div>
      )}

      {/* New Media Preview */}
      {newPreviewURLs.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
          {newPreviewURLs.map((url, i) => (
            <div key={i} className="relative border rounded overflow-hidden">
              <button
                onClick={() => handleRemoveNew(i)}
                className="absolute top-1 right-1 bg-white rounded-full shadow p-1 text-red-500 z-10"
              >
                <X size={16} />
              </button>
              <img src={url} className="w-full h-32 object-cover" alt="preview" />
            </div>
          ))}
        </div>
      )}

      {/* File Input + Actions */}
      <div className="flex justify-between items-center mt-4">
        <label className="cursor-pointer text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded">
          📎 Add Media
          <input type="file" multiple accept="image/*,video/*" onChange={handleMediaChange} className="hidden" />
        </label>
        <div className="flex gap-3">
          <button onClick={onRequestClose} className="px-4 py-2 rounded bg-gray-200 text-gray-600">
            Cancel
          </button>
          <button
            onClick={handleUpdate}
            disabled={isUpdating || !content.trim()}
            className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {isUpdating ? "Updating..." : "Update Post"}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default EditPostModal;
