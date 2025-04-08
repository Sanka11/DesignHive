import { useParams, useNavigate, Link } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import axios from "../api/axios";
import { motion, AnimatePresence } from "framer-motion";
import { FiSend, FiMessageSquare, FiSearch, FiUser, FiHome, FiEdit2, FiTrash2, FiX, FiCheck } from "react-icons/fi";
import { GiHoneycomb } from "react-icons/gi";
import { FaUserCircle } from "react-icons/fa";

export default function ChatPage({ currentUser }) {
  const { chatId } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [userChats, setUserChats] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [otherUserEmail, setOtherUserEmail] = useState("");
  const [otherUserName, setOtherUserName] = useState("");
  const [isEditing, setIsEditing] = useState(null);
  const [editText, setEditText] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Convert Firestore timestamp to Date
  const firestoreTimestampToDate = (timestamp) => {
    if (!timestamp) return new Date();
    if (timestamp.seconds) {
      return new Date(timestamp.seconds * 1000 + (timestamp.nanos || 0) / 1000000);
    }
    return new Date(timestamp);
  };

  // Fetch messages for the current chat
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await axios.get(`/chats/${chatId}/messages`);
        const formattedMessages = Array.isArray(res.data) 
          ? res.data.map(msg => ({
              ...msg,
              timestamp: firestoreTimestampToDate(msg.timestamp)
            }))
          : [];
        setMessages(formattedMessages);
        
        // Get other user's details
        const otherEmail = chatId.split("_").find(email => email !== currentUser.email);
        if (otherEmail) {
          setOtherUserEmail(otherEmail);
          try {
            const userRes = await axios.get(`/user/email/${otherEmail}`);
            setOtherUserName(userRes.data.username || otherEmail.split('@')[0]);
          } catch {
            setOtherUserName(otherEmail);
          }
        }
      } catch (err) {
        console.error("Error fetching messages:", err);
      }
    };

    if (chatId) {
      fetchMessages();
    }
  }, [chatId, currentUser.email]);

  // Fetch all chats started by this user
  useEffect(() => {
    const fetchUserChats = async () => {
      try {
        const res = await axios.get(`/chats/started/${currentUser.email}`);
        setUserChats(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error("Error fetching user chats:", err);
      }
    };

    if (currentUser?.email) {
      fetchUserChats();
    }
  }, [currentUser]);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Send a message
  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      await axios.post(`/chats/${chatId}/messages`, {
        sender: currentUser.email,
        text: newMessage,
      });

      setMessages((prev) => [
        ...prev,
        {
          sender: currentUser.email,
          text: newMessage,
          timestamp: new Date(),
          messageId: Date.now(),
        },
      ]);
      setNewMessage("");
      inputRef.current.focus();
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  // Start editing a message
  const startEdit = (message) => {
    setIsEditing(message.messageId);
    setEditText(message.text);
  };

  // Cancel editing
  const cancelEdit = () => {
    setIsEditing(null);
    setEditText("");
  };

  // Save edited message
  const saveEdit = async () => {
    if (!editText.trim()) return;

    try {
      await axios.put(`/chats/${chatId}/messages/${isEditing}`, { 
        newText: editText 
      });
      setIsEditing(null);
      setEditText("");
      const res = await axios.get(`/chats/${chatId}/messages`);
      const formattedMessages = Array.isArray(res.data) 
        ? res.data.map(msg => ({
            ...msg,
            timestamp: firestoreTimestampToDate(msg.timestamp)
          }))
        : [];
      setMessages(formattedMessages);
    } catch (err) {
      console.error("Error updating message:", err);
    }
  };

  // Delete a message
  const handleDelete = async (messageId) => {
    try {
      await axios.delete(`/chats/${chatId}/messages/${messageId}`);
      setShowDeleteConfirm(null);
      const res = await axios.get(`/chats/${chatId}/messages`);
      const formattedMessages = Array.isArray(res.data) 
        ? res.data.map(msg => ({
            ...msg,
            timestamp: firestoreTimestampToDate(msg.timestamp)
          }))
        : [];
      setMessages(formattedMessages);
    } catch (err) {
      console.error("Error deleting message:", err);
    }
  };

  // Format timestamp
  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Format date header if needed
  const formatDateHeader = (timestamp, index) => {
    if (!timestamp || index === 0) return null;
    
    const currentDate = timestamp instanceof Date ? timestamp : new Date(timestamp);
    const prevDate = messages[index - 1].timestamp instanceof Date 
      ? messages[index - 1].timestamp 
      : new Date(messages[index - 1].timestamp);
    
    if (currentDate.toDateString() !== prevDate.toDateString()) {
      return (
        <div className="flex justify-center my-4">
          <div className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm">
            {currentDate.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })}
          </div>
        </div>
      );
    }
    return null;
  };

  // Filter chats based on search term
  const filteredChats = userChats.filter(chat => {
    if (!chat?.chatId) return false;
    const other = chat.chatId.split("_").find(email => email !== currentUser.email);
    return other.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col shadow-sm">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <GiHoneycomb className="text-2xl text-amber-600 mr-2" />
              <h2 className="text-xl font-bold text-gray-800">Your Chats</h2>
            </div>
            <Link 
              to="/home" 
              className="p-2 text-gray-500 hover:text-amber-600 rounded-full hover:bg-amber-50"
              title="Back to Home"
            >
              <FiHome size={20} />
            </Link>
          </div>
          <div className="relative">
            <FiSearch className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search chats..."
              className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-lg border-none focus:ring-2 focus:ring-amber-400"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredChats.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              {searchTerm ? "No matching chats found" : "No chats yet"}
            </div>
          ) : (
            <ul>
              {filteredChats.map((chat, index) => {
                if (!chat?.chatId) return null;
                const other = chat.chatId.split("_").find(email => email !== currentUser.email);
                const isActive = chatId === chat.chatId;

                return (
                  <li key={chat.chatId}>
                    <motion.button
                      whileHover={{ x: 5 }}
                      onClick={() => navigate(`/chat/${chat.chatId}`)}
                      className={`w-full text-left p-3 flex items-center transition-colors ${
                        isActive 
                          ? 'bg-amber-100 border-r-4 border-amber-500' 
                          : 'hover:bg-amber-50'
                      }`}
                    >
                      <FaUserCircle className="text-gray-400 text-xl mr-3" />
                      <div className="truncate">
                        <p className="font-medium text-gray-800 truncate">{other}</p>
                        <p className="text-xs text-gray-500 truncate">
                          {chat.lastMessage || "No messages yet"}
                        </p>
                      </div>
                    </motion.button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {chatId ? (
          <>
            {/* Chat Header */}
            <div className="bg-white p-4 border-b border-gray-200 shadow-sm">
              <div className="max-w-6xl mx-auto flex items-center justify-between">
                <div className="flex items-center">
                  <FiUser className="text-xl text-amber-600 mr-2" />
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">
                      Chat with {otherUserName || otherUserEmail}
                    </h2>
                    <p className="text-xs text-gray-500">{otherUserEmail}</p>
                  </div>
                </div>
                <Link 
                  to="/home" 
                  className="p-2 text-gray-500 hover:text-amber-600 rounded-full hover:bg-amber-50"
                  title="Back to Home"
                >
                  <FiHome size={20} />
                </Link>
              </div>
            </div>

            {/* Messages Container */}
            <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-500">
                  <FiMessageSquare className="text-4xl mb-2 opacity-50" />
                  <p>No messages yet. Start the conversation!</p>
                </div>
              ) : (
                <div className="max-w-4xl mx-auto space-y-4">
                  {messages.map((msg, index) => (
                    <div key={msg.messageId} className="relative">
                      {/* Date header if needed */}
                      {formatDateHeader(msg.timestamp, index)}
                      
                      {isEditing === msg.messageId ? (
                        <div className={`p-4 rounded-lg mb-4 ${msg.sender === currentUser.email ? 'bg-amber-100' : 'bg-white'} shadow-sm`}>
                          <textarea
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            className="w-full p-3 border border-amber-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400"
                            rows="3"
                            autoFocus
                          />
                          <div className="flex justify-end space-x-2 mt-2">
                            <button
                              onClick={cancelEdit}
                              className="px-3 py-1 bg-gray-200 text-gray-700 rounded-lg flex items-center"
                            >
                              <FiX className="mr-1" /> Cancel
                            </button>
                            <button
                              onClick={saveEdit}
                              className="px-3 py-1 bg-amber-600 text-white rounded-lg flex items-center"
                            >
                              <FiCheck className="mr-1" /> Save
                            </button>
                          </div>
                        </div>
                      ) : (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.2 }}
                          className={`flex ${
                            msg.sender === currentUser.email ? 'justify-end' : 'justify-start'
                          }`}
                        >
                          <div
                            className={`max-w-2xl rounded-xl p-4 ${
                              msg.sender === currentUser.email
                                ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-white rounded-br-none shadow-md'
                                : 'bg-white border border-gray-200 rounded-bl-none shadow-sm'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className={`text-sm font-medium ${
                                msg.sender === currentUser.email ? 'text-amber-100' : 'text-amber-600'
                              }`}>
                                {msg.sender === currentUser.email ? 'You' : otherUserName}
                              </span>
                              <span className={`text-xs ${
                                msg.sender === currentUser.email ? 'text-amber-100' : 'text-gray-500'
                              }`}>
                                {formatTime(msg.timestamp)}
                              </span>
                            </div>
                            <p className="text-sm mb-2">{msg.text}</p>
                            
                            {msg.sender === currentUser.email && (
                              <div className="flex justify-end space-x-2">
                                <button
                                  onClick={() => startEdit(msg)}
                                  className={`p-1.5 rounded-full ${
                                    msg.sender === currentUser.email 
                                      ? 'bg-amber-600 text-white hover:bg-amber-700' 
                                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                  }`}
                                >
                                  <FiEdit2 size={14} />
                                </button>
                                <button
                                  onClick={() => setShowDeleteConfirm(msg.messageId)}
                                  className={`p-1.5 rounded-full ${
                                    msg.sender === currentUser.email 
                                      ? 'bg-amber-600 text-white hover:bg-amber-700' 
                                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                  }`}
                                >
                                  <FiTrash2 size={14} />
                                </button>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* Message Input */}
            <div className="p-4 bg-white border-t border-gray-200 shadow-sm">
              <div className="max-w-4xl mx-auto flex items-center gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400"
                  placeholder="Type your message..."
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                  className={`p-3 rounded-lg ${
                    newMessage.trim()
                      ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-white hover:from-amber-600 hover:to-yellow-600'
                      : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  <FiSend size={20} />
                </motion.button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center p-6 max-w-md">
              <FiMessageSquare className="text-5xl text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-700 mb-2">No Chat Selected</h3>
              <p className="text-gray-500 mb-6">
                Select a chat from the sidebar or start a new conversation
              </p>
              <Link
                to="/home"
                className="inline-flex items-center px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
              >
                <FiHome className="mr-2" /> Back to Home
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div 
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className="bg-white rounded-xl shadow-xl p-6 max-w-sm w-full mx-4"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-800">Delete Message</h3>
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <FiX size={24} />
                </button>
              </div>
              <p className="text-gray-600 mb-6">Are you sure you want to delete this message? This action cannot be undone.</p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(showDeleteConfirm)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center"
                >
                  <FiTrash2 className="mr-2" /> Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}