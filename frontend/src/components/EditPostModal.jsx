import { useEffect, useState } from "react";
import Modal from "react-modal";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../services/firebase";
import axios from "axios";
import Select from "react-select";
import { toast } from "react-hot-toast";
import { X, ImagePlus, Video, FileImage } from "lucide-react";
import { GiBee } from "react-icons/gi";
import { FiAward, FiTool, FiTarget, FiLayers } from "react-icons/fi";
import { RiPencilRulerLine } from "react-icons/ri";

const EditPostModal = ({ isOpen, onRequestClose, post, onPostUpdated }) => {
  const [content, setContent] = useState("");
  const [existingMedia, setExistingMedia] = useState([]);
  const [newMediaFiles, setNewMediaFiles] = useState([]);
  const [newPreviewURLs, setNewPreviewURLs] = useState([]);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const [designDisciplines, setDesignDisciplines] = useState([]);
  const [designProcess, setDesignProcess] = useState([]);
  const [tools, setTools] = useState([]);
  const [learningGoals, setLearningGoals] = useState([]);
  const [skillLevel, setSkillLevel] = useState("");
  const [competitionInvolvement, setCompetitionInvolvement] = useState([]);

  const selectOptions = {
    designDisciplines: [
      {
        value: "UI Design",
        icon: <RiPencilRulerLine className="inline mr-2" />,
      },
      { value: "UX Design", icon: <FiLayers className="inline mr-2" /> },
      { value: "Interaction Design", icon: <FiTool className="inline mr-2" /> },
      { value: "Motion Design", icon: <Video className="inline mr-2" /> },
    ],
    designProcess: [
      "Wireframing",
      "Prototyping",
      "Visual Design",
      "UI Design Techniques",
      "User Research",
      "Usability Testing",
    ],
    tools: ["Figma", "Adobe XD", "Sketch", "Blender", "After Effects"],
    learningGoals: [
      "Career Development",
      "Improving UI/UX Skills",
      "Mastering Tools",
      "Building Case Studies",
    ],
    skillLevel: ["Beginner", "Intermediate", "Advanced"],
    competitionInvolvement: [
      "Participated",
      "Reached Final Round",
      "Runner-up",
      "Winner",
      "Hackathon",
      "Case Study Challenge",
      "Designathon",
      "International Competition",
      "Local Competition",
    ],
  };

  const toOptionList = (list) => {
    if (list[0]?.icon) {
      return list.map((item) => ({
        label: (
          <span>
            {item.icon}
            {item.value}
          </span>
        ),
        value: item.value,
      }));
    }
    return list.map((x) => ({ label: x, value: x }));
  };

  const customSelectStyles = {
    control: (provided) => ({
      ...provided,
      backgroundColor: "#FFFDF6",
      borderColor: "#E5E7EB",
      minHeight: "42px",
      boxShadow: "none",
      "&:hover": { borderColor: "#FCD34D" },
    }),
    multiValue: (provided) => ({
      ...provided,
      backgroundColor: "#FEF3C7",
      borderRadius: "6px",
    }),
    multiValueLabel: (provided) => ({
      ...provided,
      color: "#92400E",
      fontWeight: "500",
      padding: "2px 6px",
    }),
    multiValueRemove: (provided) => ({
      ...provided,
      color: "#92400E",
      borderRadius: "0 6px 6px 0",
      ":hover": { backgroundColor: "#F59E0B", color: "white" },
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected
        ? "#F59E0B"
        : state.isFocused
        ? "#FEF3C7"
        : "#FFFDF6",
      color: state.isSelected ? "white" : "#92400E",
    }),
  };

  useEffect(() => {
    if (isOpen && post) {
      setContent(post.content || "");
      setExistingMedia(post.mediaUrls || []);
      setNewMediaFiles([]);
      setNewPreviewURLs([]);

      setDesignDisciplines(post.designDisciplines || []);
      setDesignProcess(post.designProcess || []);
      setTools(post.tools || []);
      setLearningGoals(post.learningGoals || []);
      setSkillLevel(post.skillLevel || "");
      setCompetitionInvolvement(post.competitionInvolvement || []);
    }
  }, [isOpen, post]);

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files).filter(
      (file) => file.type.match("image.*") || file.type.match("video.*")
    );

    if (files.length > 0) {
      handleMediaFiles(files);
    }
  };

  const handleMediaChange = (e) => {
    const files = Array.from(e.target.files);
    handleMediaFiles(files);
  };

  const handleMediaFiles = (files) => {
    if (files.length + newMediaFiles.length + existingMedia.length > 10) {
      toast.error("You can upload a maximum of 10 files");
      return;
    }

    const validFiles = files.filter((file) => {
      const validTypes = [
        "image/jpeg",
        "image/png",
        "image/gif",
        "video/mp4",
        "video/webm",
        "video/ogg",
      ];
      if (!validTypes.includes(file.type)) {
        toast.error(`Unsupported file type: ${file.name}`);
        return false;
      }
      if (file.size > 10 * 1024 * 1024) {
        // 10MB limit
        toast.error(`File too large (max 10MB): ${file.name}`);
        return false;
      }
      return true;
    });

    setNewMediaFiles((prev) => [...prev, ...validFiles]);
    setNewPreviewURLs((prev) => [
      ...prev,
      ...validFiles.map((file) => URL.createObjectURL(file)),
    ]);
  };

  const handleRemoveExisting = (index) => {
    setExistingMedia((prev) => prev.filter((_, i) => i !== index));
  };

  const handleRemoveNew = (index) => {
    URL.revokeObjectURL(newPreviewURLs[index]);
    setNewMediaFiles((prev) => prev.filter((_, i) => i !== index));
    setNewPreviewURLs((prev) => prev.filter((_, i) => i !== index));
  };

  const isVideo = (url) => {
    if (typeof url === "string") {
      return /\.(mp4|webm|ogg)$/i.test(url);
    }
    return url?.type?.match("video.*");
  };

  const handleUpdate = async () => {
    if (!content.trim()) {
      toast.error("Please enter some content for your post");
      return;
    }

    try {
      setIsUpdating(true);
      const uploadedUrls = [];

      for (let file of newMediaFiles) {
        const fileRef = ref(
          storage,
          `posts/${post.authorId}/${Date.now()}_${file.name}`
        );
        const snapshot = await uploadBytes(fileRef, file);
        const url = await getDownloadURL(snapshot.ref);
        uploadedUrls.push(url);
        URL.revokeObjectURL(url);
      }

      const updatedPost = {
        content,
        mediaUrls: [...existingMedia, ...uploadedUrls],
        designDisciplines,
        designProcess,
        tools,
        learningGoals,
        competitionInvolvement,
        skillLevel,
      };

      await axios.put(
        `${import.meta.env.VITE_API_BASE_URL}/posts/${post.id}`,
        updatedPost
      );
      toast.success("✅ Post updated successfully!");
      onPostUpdated();
      onRequestClose();
    } catch (err) {
      console.error("Error updating post:", err);
      toast.error("❌ Failed to update post");
    } finally {
      setIsUpdating(false);
    }
  };

  const Dropdown = ({
    label,
    options,
    value,
    onChange,
    isMulti = false,
    icon,
  }) => (
    <div className="mb-3">
      <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
        {icon && <span className="mr-2">{icon}</span>}
        {label}
      </label>
      <Select
        isMulti={isMulti}
        options={options}
        value={
          isMulti
            ? options.filter((opt) => value.includes(opt.value))
            : options.find((opt) => opt.value === value)
        }
        onChange={(selected) =>
          isMulti
            ? onChange(selected?.map((opt) => opt.value) || [])
            : onChange(selected?.value || "")
        }
        isClearable={!isMulti}
        placeholder={`Select ${label.toLowerCase()}...`}
        styles={customSelectStyles}
        className="text-gray-800"
        classNamePrefix="select"
        noOptionsMessage={() => "No options available"}
      />
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      contentLabel="Edit Post"
      ariaHideApp={false}
      className="bg-white p-4 sm:p-6 rounded-lg shadow-xl max-w-3xl w-full mx-4 sm:mx-auto my-8 sm:my-20 relative outline-none"
      overlayClassName="fixed inset-0 bg-black/50 z-50 flex justify-center items-start overflow-y-auto"
    >
      {/* Close Button */}
      <button
        className="absolute top-3 right-3 text-gray-400 hover:text-red-500 transition-colors"
        onClick={onRequestClose}
        title="Close"
        aria-label="Close modal"
      >
        <X size={24} />
      </button>

      <div className="flex items-start mb-4">
        <div className="bg-amber-100 p-2 rounded-full mr-3">
          <GiBee className="text-amber-600 text-xl" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-800">
            Edit Your Design Post
          </h2>
          <p className="text-sm text-gray-500">
            Update your content, media, and design details
          </p>
        </div>
      </div>

      {/* Content Textarea */}
      <div className="mb-5">
        <label
          htmlFor="post-content"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Your Design Story
        </label>
        <textarea
          id="post-content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full p-3 border rounded-lg mb-1 bg-[#FFFDF6] text-gray-800 focus:ring-2 focus:ring-amber-300 focus:border-amber-300 transition-all"
          rows={5}
          placeholder="Share your design process, challenges, and learnings..."
        />
        <p className="text-xs text-gray-500 text-right">
          {content.length}/2000 characters
        </p>
      </div>

      {/* Design Details Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
        <Dropdown
          label="Design Disciplines"
          options={toOptionList(selectOptions.designDisciplines)}
          value={designDisciplines}
          onChange={setDesignDisciplines}
          isMulti
          icon={<RiPencilRulerLine />}
        />
        <Dropdown
          label="Design Process"
          options={toOptionList(selectOptions.designProcess)}
          value={designProcess}
          onChange={setDesignProcess}
          isMulti
          icon={<FiLayers />}
        />
        <Dropdown
          label="Tools Used"
          options={toOptionList(selectOptions.tools)}
          value={tools}
          onChange={setTools}
          isMulti
          icon={<FiTool />}
        />
        <Dropdown
          label="Learning Goals"
          options={toOptionList(selectOptions.learningGoals)}
          value={learningGoals}
          onChange={setLearningGoals}
          isMulti
          icon={<FiTarget />}
        />
        <Dropdown
          label="Skill Level"
          options={toOptionList(selectOptions.skillLevel)}
          value={skillLevel}
          onChange={setSkillLevel}
          icon={<FiAward />}
        />
        <Dropdown
          label="Competitions"
          options={toOptionList(selectOptions.competitionInvolvement)}
          value={competitionInvolvement}
          onChange={setCompetitionInvolvement}
          isMulti
          icon={<FiAward />}
        />
      </div>

      {/* Media Section */}
      <div className="mb-5">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Media Attachments
        </label>

        {/* Drag and Drop Area */}
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center mb-4 transition-colors ${
            isDragging ? "border-amber-400 bg-amber-50" : "border-gray-300"
          }`}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <div className="flex flex-col items-center justify-center space-y-2">
            <ImagePlus className="text-gray-400 h-8 w-8" />
            <p className="text-sm text-gray-600">
              Drag & drop images or videos here, or click to browse
            </p>
            <p className="text-xs text-gray-500">
              Supports JPG, PNG, GIF, MP4 (max 10MB each)
            </p>
            <label className="cursor-pointer mt-2 text-sm bg-amber-100 hover:bg-amber-200 text-amber-800 px-4 py-2 rounded-lg flex items-center transition-colors">
              <input
                type="file"
                accept="image/*,video/*"
                multiple
                onChange={handleMediaChange}
                className="hidden"
              />
              Select Files
            </label>
          </div>
        </div>

        {/* Media Previews */}
        {(existingMedia.length > 0 || newPreviewURLs.length > 0) && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-700">
              Current Media ({existingMedia.length + newPreviewURLs.length}/10)
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {/* Existing Media */}
              {existingMedia.map((url, i) => (
                <div
                  key={`existing-${i}`}
                  className="relative group rounded-lg overflow-hidden border border-gray-200"
                >
                  <button
                    onClick={() => handleRemoveExisting(i)}
                    className="absolute top-1 right-1 bg-white/90 rounded-full shadow p-1 text-red-500 z-10 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500 hover:text-white"
                    aria-label="Remove media"
                  >
                    <X size={14} />
                  </button>
                  {isVideo(url) ? (
                    <div className="relative aspect-video bg-black">
                      <video
                        src={url}
                        className="w-full h-full object-contain"
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-10 h-10 bg-black/50 rounded-full flex items-center justify-center">
                          <Video className="text-white" size={16} />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <img
                      src={url}
                      alt="media"
                      className="w-full h-32 object-cover"
                    />
                  )}
                </div>
              ))}

              {/* New Media */}
              {newPreviewURLs.map((url, i) => (
                <div
                  key={`new-${i}`}
                  className="relative group rounded-lg overflow-hidden border border-gray-200"
                >
                  <button
                    onClick={() => handleRemoveNew(i)}
                    className="absolute top-1 right-1 bg-white/90 rounded-full shadow p-1 text-red-500 z-10 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500 hover:text-white"
                    aria-label="Remove media"
                  >
                    <X size={14} />
                  </button>
                  {isVideo(newMediaFiles[i]) ? (
                    <div className="relative aspect-video bg-black">
                      <video
                        src={url}
                        className="w-full h-full object-contain"
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-10 h-10 bg-black/50 rounded-full flex items-center justify-center">
                          <Video className="text-white" size={16} />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <img
                      src={url}
                      alt="preview"
                      className="w-full h-32 object-cover"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-between pt-5 border-t border-gray-200 gap-3">
        <div className="text-xs text-gray-500 flex items-center">
          <FileImage className="mr-1" size={14} />
          {existingMedia.length + newPreviewURLs.length} media files attached
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <button
            onClick={onRequestClose}
            className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 w-full sm:w-auto transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleUpdate}
            disabled={isUpdating || !content.trim()}
            className={`px-6 py-2 rounded-lg font-medium transition-colors flex items-center justify-center w-full sm:w-auto ${
              content.trim() && !isUpdating
                ? "bg-amber-600 hover:bg-amber-700 text-white shadow-md hover:shadow-lg"
                : "bg-amber-100 text-amber-400 cursor-not-allowed"
            }`}
          >
            {isUpdating ? (
              <span className="flex items-center">
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Updating...
              </span>
            ) : (
              <>
                <GiBee className="mr-2" />
                Update Post
              </>
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default EditPostModal;
