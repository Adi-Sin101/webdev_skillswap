import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Conversations = () => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchConversations = async () => {
      if (!user?._id) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`http://localhost:5000/api/messages/conversations/${user._id}`);
        
        if (response.ok) {
          const data = await response.json();
          setConversations(data.conversations || []);
        } else {
          console.error('Failed to fetch conversations');
        }
      } catch (error) {
        console.error('Error fetching conversations:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, [user]);

  const formatLastMessageTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else if (diffInHours < 24 * 7) {
      const days = Math.floor(diffInHours / 24);
      return `${days}d ago`;
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-accent)]/20 flex items-center justify-center">
        <div className="text-xl font-bold text-white">Loading conversations...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-accent)]/20 py-8 pt-24">
      <div className="max-w-4xl mx-auto px-6">
        {/* Header */}
        <div className="mb-8">
          <div className="bg-[var(--color-primary)] text-white px-6 py-6 rounded-xl">
            <h1 className="text-3xl font-bold mb-2">
              Messages
            </h1>
            <p className="text-white/90">All your conversations about skill swaps</p>
          </div>
        </div>

        {/* Conversations List */}
        <div className="space-y-3">
          {conversations.map(conversation => (
            <Link
              key={conversation._id}
              to={`/chat/${conversation._id}`}
              state={{
                otherUser: conversation.otherParticipant,
                itemTitle: conversation.itemTitle,
                itemType: conversation.itemType
              }}
              className="block bg-white rounded-xl p-4 border border-gray-200 hover:shadow-lg hover:border-[var(--color-accent)]/30 transition-all duration-200"
            >
              <div className="flex items-center gap-4">
                {/* Avatar */}
                <div className="relative">
                  <img
                    src={conversation.otherParticipant?.profilePicture || conversation.otherParticipant?.avatar || "https://randomuser.me/api/portraits/men/1.jpg"}
                    alt={conversation.otherParticipant?.name || 'User'}
                    className="w-12 h-12 rounded-full border-2 border-gray-200"
                  />
                  {conversation.unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                      {conversation.unreadCount > 9 ? '9+' : conversation.unreadCount}
                    </span>
                  )}
                </div>

                {/* Conversation Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold text-[var(--color-primary)] truncate">
                      {conversation.otherParticipant?.name || 'Unknown User'}
                    </h3>
                    <span className="text-xs text-gray-500 flex-shrink-0">
                      {formatLastMessageTime(conversation.lastMessageAt)}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      conversation.itemType === 'offer' 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {conversation.itemType === 'offer' ? 'Offer' : 'Request'}
                    </span>
                    <span className="text-sm text-gray-600 truncate">
                      {conversation.itemTitle}
                    </span>
                  </div>
                  
                  {conversation.lastMessage && (
                    <p className="text-sm text-gray-500 truncate">
                      {conversation.lastMessage.content}
                    </p>
                  )}
                </div>

                {/* Arrow Icon */}
                <div className="text-gray-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </Link>
          ))}
          
          {conversations.length === 0 && (
            <div className="text-center py-12 bg-white/50 rounded-xl backdrop-blur-sm">
              <div className="text-[var(--color-accent)] mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-[var(--color-primary)] mb-2">No conversations yet</h3>
              <p className="text-[var(--color-muted)] mb-4">Start chatting when you receive applications for your offers or requests.</p>
              <Link 
                to="/profile" 
                className="bg-[var(--color-accent)] text-white px-6 py-2 rounded-lg hover:opacity-80 transition-all"
              >
                Create an Offer or Request
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Conversations;