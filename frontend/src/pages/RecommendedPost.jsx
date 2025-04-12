import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../auth/useAuth";
import Post from "./Post";
import { TailSpin } from "react-loader-spinner";
import { GiBee } from "react-icons/gi";

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
        `http://localhost:9090/api/posts/recommended?userId=${user?.id}`
      );

      const transformed = response.data.map((post) => ({
        ...post,
        user: {
          name: post.authorUsername || "Unknown",
          email: post.authorEmail,
          avatar: post.user?.avatar || post.profileImagePath || "/assets/default-profile.png",
        },
        media: post.mediaUrls?.[0] || null,
      }));

      setRecommendedPosts(transformed);
      setFilteredPosts(transformed); // initial state
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
        post.designDisciplines?.some((tag) => tag.toLowerCase().includes(keyword)) ||
        post.tools?.some((tag) => tag.toLowerCase().includes(keyword)) ||
        post.learningGoals?.some((tag) => tag.toLowerCase().includes(keyword)) ||
        post.competitionInvolvement?.some((tag) => tag.toLowerCase().includes(keyword)) ||
        (post.skillLevel || "").toLowerCase().includes(keyword)
      );
    });

    // ✅ Strict filter by selected preference tag
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
        return allTags.some((tag) =>
          tag.toLowerCase() === selectedPreference.toLowerCase()
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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <h2 className="text-2xl font-bold mb-6 text-center text-amber-600">
          🐝 Recommended Posts for You
        </h2>

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
          <div className="flex justify-center items-center py-12">
            <TailSpin height="40" width="40" color="#f59e0b" />
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
