import NewPost from "./NewPost";
import { GiBee, GiHoneycomb } from "react-icons/gi";

const NewPostPage = () => {
  const user = JSON.parse(localStorage.getItem("loggedInUser"));

  const dummyRefreshPosts = () => {};

  return (
    <div className="min-h-screen bg-amber-50 bg-opacity-50 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiBvcGFjaXR5PSIwLjEiPjxkZWZzPjxwYXR0ZXJuIGlkPSJkaWFnb25hbF9oYXRjaCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgd2lkdGg9IjEwIiBoZWlnaHQ9IjEwIiBwYXR0ZXJuVHJhbnNmb3JtPSJyb3RhdGUoNDUpIj48cmVjdCB3aWR0aD0iMSIgaGVpZ2h0PSIxIiBmaWxsPSIjMDAwIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2RpYWdvbmFsX2hhdGNoKSIvPjwvc3ZnPg==')] py-10">
      <div className="max-w-[87rem] mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center my-6 gap-2">
          <GiHoneycomb className="text-3xl text-amber-500" />
          <h2 className="text-3xl font-bold text-amber-900 font-serif">
            Create a New Post
          </h2>
          <GiBee className="text-3xl text-amber-500" />
        </div>

        {user ? (
          <NewPost user={user} refreshPosts={dummyRefreshPosts} />
        ) : (
          <p className="text-center text-red-500 text-lg font-medium">
            ⚠️ You must be logged in to post.
          </p>
        )}
      </div>
    </div>
  );
};

export default NewPostPage;
