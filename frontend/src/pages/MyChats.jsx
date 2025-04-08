import { useEffect, useState } from "react";
import axios from "../api/axios";
import { Link } from "react-router-dom";
import { useAuth } from "../auth/useAuth";

export default function MyChats() {
  const { user } = useAuth();
  const [chatIds, setChatIds] = useState([]);

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const res = await axios.get(`/chats/user/${user.email}`);
        setChatIds(res.data);
      } catch (err) {
        console.error("Error fetching chats", err);
      }
    };

    fetchChats();
  }, [user.email]);

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">💬 Your Chats</h2>
      {chatIds.length === 0 ? (
        <p className="text-gray-500">No chats yet.</p>
      ) : (
        <ul className="space-y-2">
          {chatIds.map((id) => {
            const otherUser = id
              .split("_")
              .find((email) => email !== user.email);
            return (
              <li key={id} className="flex justify-between items-center p-2 bg-white shadow rounded">
                <span>Chat with: <strong>{otherUser}</strong></span>
                <Link
                  to={`/chat/${id}`}
                  className="bg-blue-600 text-white px-3 py-1 rounded"
                >
                  Open Chat
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
