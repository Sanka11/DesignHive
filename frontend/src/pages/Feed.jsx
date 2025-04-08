import { useEffect, useState } from "react";
import axios from "axios";
import Post from "./Post";
import NewPost from "./NewPost"; // ✅ Import NewPost

const Feed = () => {
  const [posts, setPosts] = useState([]);

  const fetchPosts = () => {
    axios.get("http://localhost:9090/api/posts")
      .then(response => setPosts(response.data))
      .catch(error => console.error("Error fetching posts", error));
  };

  useEffect(() => {
    fetchPosts(); // ✅ Initial fetch
  }, []);

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold my-4 text-center">News Feed</h2>

      <NewPost refreshPosts={fetchPosts} /> {/* ✅ Render post creator */}

      {posts.length > 0 ? (
        posts.map(post => <Post key={post.id} post={post} />)
      ) : (
        <p className="text-center text-gray-500">No posts yet.</p>
      )}
    </div>
  );
};

export default Feed;
