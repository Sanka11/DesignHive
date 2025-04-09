import { useState, useMemo } from "react";
import axios from "axios";
import Select from "react-select";
import { X } from "lucide-react";
import { storage } from "../services/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

// Toasts (Optional): You can install `react-hot-toast` for cleaner notifications
import { toast } from "react-hot-toast";

const DEFAULT_PROFILE_PIC = "/assets/my-default.png";

const NewPost = ({ user, refreshPosts }) => {
  const [content, setContent] = useState("");
  const [mediaFiles, setMediaFiles] = useState([]);
  const [previewURLs, setPreviewURLs] = useState([]);
  const [isPosting, setIsPosting] = useState(false);

  const [designDisciplines, setDesignDisciplines] = useState([]);
  const [designProcess, setDesignProcess] = useState([]);
  const [tools, setTools] = useState([]);
  const [learningGoals, setLearningGoals] = useState([]);
  const [skillLevel, setSkillLevel] = useState(null);
  const [competitionInvolvement, setCompetitionInvolvement] = useState([]);

  const profilePic = useMemo(() => {
    if (user?.profileImagePath) {
      return user.profileImagePath.startsWith("http")
        ? user.profileImagePath
        : `http://localhost:9090${user.profileImagePath}`;
    }
    return DEFAULT_PROFILE_PIC;
  }, [user]);

  const selectOptions = {
    designDisciplines: [
      "UI Design",
      "UX Design",
      "Interaction Design",
      "Motion Design",
    ],
    designProcess: [
      "Wireframing",
      "Prototyping",
      "Visual Design",
      "UI Design Techniques",
    ],
    tools: ["Figma", "Adobe XD", "Sketch"],
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
    ],
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const updatedFiles = [...mediaFiles, ...files];
    const updatedPreviews = [
      ...previewURLs,
      ...files.map((file) => URL.createObjectURL(file)),
    ];
    setMediaFiles(updatedFiles);
    setPreviewURLs(updatedPreviews);
  };

  const handleRemoveMedia = (index) => {
    const updatedFiles = [...mediaFiles];
    const updatedPreviews = [...previewURLs];
    updatedFiles.splice(index, 1);
    updatedPreviews.splice(index, 1);
    setMediaFiles(updatedFiles);
    setPreviewURLs(updatedPreviews);
  };

  const resetForm = () => {
    setContent("");
    setMediaFiles([]);
    setPreviewURLs([]);
    setDesignDisciplines([]);
    setDesignProcess([]);
    setTools([]);
    setLearningGoals([]);
    setSkillLevel(null);
    setCompetitionInvolvement([]);
  };

  const handlePost = async () => {
    if (!content.trim()) {
      toast.error("Content cannot be empty.");
      return;
    }

    try {
      setIsPosting(true);
      const mediaUrls = [];

      for (let file of mediaFiles) {
        const fileRef = ref(storage, `posts/${user.id}/${Date.now()}_${file.name}`);
        const snapshot = await uploadBytes(fileRef, file);
        const url = await getDownloadURL(snapshot.ref);
        mediaUrls.push(url);
      }

      await axios.post("http://localhost:9090/api/posts", {
        content,
        authorEmail: user?.email || "anonymous",
        authorUsername: user?.username || "unknown",
        authorId: user?.id || "unknown-id",
        designDisciplines,
        designProcess,
        tools,
        learningGoals,
        skillLevel,
        competitionInvolvement,
        mediaUrls,
      });

      toast.success("Post created successfully!");
      resetForm();
      refreshPosts();
    } catch (err) {
      console.error("Error posting:", err);
      toast.error("Failed to post. Try again.");
    } finally {
      setIsPosting(false);
    }
  };

  const toOptionList = (list) => list.map((x) => ({ label: x, value: x }));

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6 max-w-3xl mx-auto mt-8">
      {/* Header */}
      <div className="flex items-center mb-4">
        <div className="w-12 h-12 rounded-full overflow-hidden mr-3 border shadow-sm">
          <img
            src={profilePic}
            alt="Profile"
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = DEFAULT_PROFILE_PIC;
            }}
            referrerPolicy="no-referrer"
          />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-gray-800">
            {user?.username || user?.email}
          </h1>
          <p className="text-sm text-gray-500">Share your design journey</p>
        </div>
      </div>

      {/* Content */}
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="What design challenge are you working on?"
        className="w-full bg-gray-50 rounded-lg p-4 border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 resize-none text-gray-800 placeholder-gray-400 mb-4"
        rows="4"
      />

      {/* Media Previews */}
      {previewURLs.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
          {previewURLs.map((url, index) => (
            <div key={index} className="relative group rounded-lg overflow-hidden border border-gray-200">
              <button
                onClick={() => handleRemoveMedia(index)}
                className="absolute top-2 right-2 bg-white/80 text-gray-800 rounded-full p-1 hover:text-red-500 hover:bg-white shadow-sm"
              >
                <X size={16} />
              </button>
              {mediaFiles[index]?.type?.startsWith("video") ? (
                <video controls className="w-full aspect-square object-cover">
                  <source src={url} type={mediaFiles[index]?.type} />
                </video>
              ) : (
                <img src={url} alt="preview" className="w-full aspect-square object-cover" />
              )}
            </div>
          ))}
        </div>
      )}

      {/* Dropdowns */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
        <Dropdown label="Design Disciplines" options={toOptionList(selectOptions.designDisciplines)} value={designDisciplines} onChange={setDesignDisciplines} isMulti />
        <Dropdown label="Design Process" options={toOptionList(selectOptions.designProcess)} value={designProcess} onChange={setDesignProcess} isMulti />
        <Dropdown label="Tools Used" options={toOptionList(selectOptions.tools)} value={tools} onChange={setTools} isMulti />
        <Dropdown label="Learning Goals" options={toOptionList(selectOptions.learningGoals)} value={learningGoals} onChange={setLearningGoals} isMulti />
        <Dropdown label="Skill Level" options={toOptionList(selectOptions.skillLevel)} value={skillLevel} onChange={setSkillLevel} />
        <Dropdown label="Competitions" options={toOptionList(selectOptions.competitionInvolvement)} value={competitionInvolvement} onChange={setCompetitionInvolvement} isMulti />
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <label className="cursor-pointer text-sm bg-gray-100 hover:bg-gray-200 text-gray-600 px-3 py-2 rounded-lg flex items-center">
          <input
            type="file"
            accept="image/*,video/*"
            multiple
            onChange={handleFileChange}
            className="hidden"
          />
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Media
        </label>

        <button
          onClick={handlePost}
          disabled={!content.trim() || isPosting}
          className={`px-6 py-2 rounded-lg font-medium transition-colors ${
            content.trim() && !isPosting
              ? "bg-blue-600 hover:bg-blue-700 text-white shadow-md"
              : "bg-gray-200 text-gray-500 cursor-not-allowed"
          }`}
        >
          {isPosting ? "Posting..." : "Post"}
        </button>
      </div>
    </div>
  );
};

// Reusable dropdown component
const Dropdown = ({ label, options, value, onChange, isMulti = false }) => (
  <div>
    <label className="block text-xs font-medium text-gray-500 mb-1">{label}</label>
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
          ? onChange(selected.map((opt) => opt.value))
          : onChange(selected?.value || "")
      }
      isClearable={!isMulti}
      placeholder={`Select ${label.toLowerCase()}...`}
    />
  </div>
);

export default NewPost;
