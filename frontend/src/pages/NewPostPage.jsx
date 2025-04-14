import NewPost from "./NewPost";

const NewPostPage = () => {
  const user = JSON.parse(localStorage.getItem("loggedInUser"));

  // You can decide later if you want a real refresh function here
  const dummyRefreshPosts = () => {};

  return (
    <div className="max-w-2xl mx-auto mt-10">
      {user ? (
        <NewPost user={user} refreshPosts={dummyRefreshPosts} />
      ) : (
        <p className="text-center text-red-500">⚠️ You must be logged in to post.</p>
      )}
    </div>
  );
};

export default NewPostPage;
