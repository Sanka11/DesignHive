import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../auth/useAuth";
import Post from "./Post";
import { FiLoader } from "react-icons/fi";
import { GiBee, GiHoneycomb } from "react-icons/gi";

const RecommendedPost = () => {
  const { user } = useAuth();
  const [recommendedPosts, setRecommendedPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPreference, setSelectedPreference] = useState("");
  const [preferences, setPreferences] = useState([]);

  const fetchRecommendedPosts = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/posts/recommended?userId=${
          user?.id
        }`
      );

      const transformed = response.data
        .filter((post) => post.authorId !== user?.id) // ✅ exclude logged-in user's own posts
        .map((post) => ({
          ...post,
          user: {
            name: post.authorUsername || "Unknown",
            email: post.authorEmail,
            avatar:
              post.user?.avatar ||
              post.profileImagePath ||
              "/assets/default-profile.png",
          },
          media: post.mediaUrls?.[0] || null,
        }));

      setRecommendedPosts(transformed);
      setFilteredPosts(transformed);
    } catch (error) {
      console.error("❌ Error fetching recommended posts:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortPosts = () => {
    const keyword = searchTerm.toLowerCase();

    let filtered = recommendedPosts.filter((post) => {
      return (
        post.content?.toLowerCase().includes(keyword) ||
        post.designDisciplines?.some((tag) =>
          tag.toLowerCase().includes(keyword)
        ) ||
        post.tools?.some((tag) => tag.toLowerCase().includes(keyword)) ||
        post.learningGoals?.some((tag) =>
          tag.toLowerCase().includes(keyword)
        ) ||
        post.competitionInvolvement?.some((tag) =>
          tag.toLowerCase().includes(keyword)
        ) ||
        (post.skillLevel || "").toLowerCase().includes(keyword)
      );
    });

    if (selectedPreference) {
      filtered = filtered.filter((post) => {
        const allTags = [
          ...(post.designDisciplines || []),
          ...(post.designProcess || []),
          ...(post.tools || []),
          ...(post.learningGoals || []),
          ...(post.competitionInvolvement || []),
          post.skillLevel || "",
        ];
        return allTags.some(
          (tag) =>
            tag.toLowerCase().trim() === selectedPreference.toLowerCase().trim()
        );
      });
    }

    setFilteredPosts(filtered);
  };

  useEffect(() => {
    if (user?.id) {
      fetchRecommendedPosts();
      if (user?.preferences) {
        setPreferences(user.preferences);
      }
    }
  }, [user]);

  useEffect(() => {
    filterAndSortPosts();
  }, [searchTerm, selectedPreference, recommendedPosts]);

  return (
    <div className="min-h-screen bg-amber-50 bg-opacity-50 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiBvcGFjaXR5PSIwLjEiPjxkZWZzPjxwYXR0ZXJuIGlkPSJkaWFnb25hbF9oYXRjaCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgd2lkdGg9IjEwIiBoZWlnaHQ9IjEwIiBwYXR0ZXJuVHJhbnNmb3JtPSJyb3RhdGUoNDUpIj48cmVjdCB3aWR0aD0iMSIgaGVpZ2h0PSIxIiBmaWxsPSIjMDAwIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2RpYWdvbmFsX2hhdGNoKSIvPjwvc3ZnPg==')] py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="flex items-center justify-center my-6 gap-2">
          <GiHoneycomb className="text-3xl text-amber-500" />
          <h2 className="text-3xl font-bold text-amber-900 font-serif">
            Recommended Posts
          </h2>
          <GiBee className="text-3xl text-amber-500" />
        </div>

        {/* 🔍 Search & Sort */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          {/* Search */}
          <div className="relative mb-4">
            <input
              type="text"
              placeholder="Search posts..."
              className="w-full pl-10 pr-4 py-3 bg-amber-50 rounded-lg border-none focus:ring-2 focus:ring-amber-200 text-gray-700"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="absolute left-3 top-3.5 text-amber-500">
              <GiBee className="text-lg" />
            </div>
          </div>

          {/* Sort Dropdown */}
          <div className="relative">
            <select
              className="w-full pl-10 pr-4 py-3 bg-amber-50 rounded-lg border-none focus:ring-2 focus:ring-amber-200 text-gray-700"
              value={selectedPreference}
              onChange={(e) => setSelectedPreference(e.target.value)}
            >
              <option value="">Sort by Preference</option>
              {preferences.map((pref, idx) => (
                <option key={idx} value={pref}>
                  {pref}
                </option>
              ))}
            </select>
            <div className="absolute left-3 top-3.5 text-amber-500">🎯</div>
          </div>
        </div>

        {/* Posts */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 bg-amber-100 rounded-xl shadow-lg border border-amber-200">
            <FiLoader className="animate-spin text-3xl text-amber-600 mb-4" />
            <p className="text-amber-800">
              Gathering honey... (loading recommended posts)
            </p>
          </div>
        ) : filteredPosts.length > 0 ? (
          <div className="space-y-6">
            {filteredPosts.map((post, idx) => (
              <Post key={idx} post={post} />
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500">
            No matching posts found based on your preferences.
          </p>
        )}
      </div>
    </div>
  );
};

export default RecommendedPost;
