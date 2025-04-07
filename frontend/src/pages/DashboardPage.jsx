// src/pages/DashboardPage.jsx
import React from "react";
import FeedCard from "../components/FeedCard";

const DashboardPage = () => {
  // Dummy data - will be replaced with real posts later
  const posts = [
    {
      id: 1,
      user: {
        name: "Jane Doe",
        avatar: "https://i.pravatar.cc/150?img=5"
      },
      content: "Just finished a UI redesign for a mobile app! 💡✨",
      media: "https://source.unsplash.com/800x400/?ui,design"
    },
    {
      id: 2,
      user: {
        name: "Pramod Ravisanka",
        avatar: "https://i.pravatar.cc/150?img=11"
      },
      content: "Working on an animation for DesignHive's dashboard. Feedback welcome!",
      media: ""
    }
  ];

  return (
    <div className="flex justify-center px-4 py-6 gap-6">
      {/* Optional Left Sidebar */}
      <aside className="hidden lg:block w-64"> {/* Add Sidebar component if needed */}</aside>

      {/* Main Feed */}
      <main className="w-full max-w-2xl">
        <h1 className="text-2xl font-semibold mb-4">News Feed</h1>
        <div className="space-y-6">
          {posts.map((post) => (
            <FeedCard key={post.id} post={post} />
          ))}
        </div>
      </main>

      {/* Optional Right Sidebar */}
      <aside className="hidden xl:block w-72">{/* Suggestions / Trending / Ads */}</aside>
    </div>
  );
};

export default DashboardPage;