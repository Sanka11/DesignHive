import { useEffect, useState } from "react";
import axios from "axios";
import Post from "./Post";
import NewPost from "./NewPost";

const Feed = () => {
  const [posts, setPosts] = useState([]);
  const [user, setUser] = useState(null);

  const fetchPosts = async () => {
    try {
      const res = await axios.get("http://localhost:9090/api/posts");
      const sortedPosts = res.data.sort((a, b) => {
        const dateA = new Date(a.updatedAt || a.createdAt);
        const dateB = new Date(b.updatedAt || b.createdAt);
        return dateB - dateA; // Latest first
      });
      setPosts(sortedPosts);
    } catch (err) {
      console.error("❌ Error fetching posts:", err);
    }
  };

  const fetchUserFromLocalStorage = () => {
    try {
      const storedUser = localStorage.getItem("loggedInUser");
      if (!storedUser) {
        console.warn("⚠️ No 'loggedInUser' found in localStorage.");
        return;
      }

      const parsed = JSON.parse(storedUser);
      if (parsed && parsed.email && parsed.username && parsed.id) {
        console.log("✅ Loaded user from localStorage:", parsed);
        setUser(parsed);
      } else {
        console.warn("⚠️ Invalid user format in localStorage:", parsed);
      }
    } catch (err) {
      console.error("❌ Error parsing loggedInUser:", err);
    }
  };

  useEffect(() => {
    fetchPosts();
    fetchUserFromLocalStorage();
  }, []);

  return (
    <div className="max-w-2xl mx-auto px-4">
      <h2 className="text-2xl font-bold my-4 text-center">News Feed</h2>

      {user ? (
        <NewPost user={user} refreshPosts={fetchPosts} />
      ) : (
        <p className="text-center text-red-500">
          ⚠️ User not loaded. Check localStorage.
        </p>
      )}

      {posts.length > 0 ? (
        posts.map((post) => <Post key={post.id} post={post} />)
      ) : (
        <p className="text-center text-gray-500">No posts yet.</p>
      )}
    </div>
  );
};

export default Feed;
