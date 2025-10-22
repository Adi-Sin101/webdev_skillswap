import React, { useState, useEffect, useRef } from 'react';
import { useParams, useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Chat = () => {
  const { conversationId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [conversation, setConversation] = useState(null);
  const [otherUser, setOtherUser] = useState(null);
  
  const messagesEndRef = useRef(null);
  const messageInputRef = useRef(null);

  // Get other user and item details from navigation state or fetch
  useEffect(() => {
    if (location.state) {
      setOtherUser(location.state.otherUser);
    }
  }, [location.state]);

  // Fetch messages
  useEffect(() => {
    const fetchMessages = async () => {
      if (!conversationId || !user?._id) return;

      try {
        const response = await fetch(
          `http://localhost:5000/api/messages/conversations/${conversationId}/messages?userId=${user._id}`
        );
        
        if (response.ok) {
          const data = await response.json();
          setMessages(data.messages || []);
          setConversation(data.conversation);
          
          // If we don't have other user from state, get it from conversation
          if (!otherUser && data.conversation) {
            const participants = data.conversation.participants;
            const other = participants.find(p => p._id !== user._id);
            setOtherUser(other);
          }
        } else {
          console.error('Failed to fetch messages');
        }
      } catch (error) {
        console.error('Error fetching messages:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [conversationId, user, otherUser]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Focus input on mount
  useEffect(() => {
    if (messageInputRef.current) {
      messageInputRef.current.focus();
    }
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim() || sending || !user?._id) return;

    setSending(true);
    
    try {
      const response = await fetch('http://localhost:5000/api/messages/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          conversationId,
          senderId: user._id,
          content: newMessage.trim()
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setMessages(prev => [...prev, data.message]);
        setNewMessage('');
        
        // Focus back to input
        if (messageInputRef.current) {
          messageInputRef.current.focus();
        }
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.error || 'Failed to send message'}`);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Network error. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 24 * 7) {
      return date.toLocaleDateString([], { weekday: 'short', hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-accent)]/20 flex items-center justify-center">
        <div className="text-xl font-bold text-white">Loading conversation...</div>
      </div>
    );
  }

  if (!conversation || !otherUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-accent)]/20 flex items-center justify-center">
        <div className="text-center">
          <div className="text-xl font-bold text-white mb-4">Conversation not found</div>
          <Link 
            to="/my-applications" 
            className="bg-white text-[var(--color-primary)] px-6 py-2 rounded-lg hover:opacity-90 transition"
          >
            Back to Applications
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-accent)]/20 flex flex-col">
      {/* Header */}
      <div className="bg-white shadow-lg border-b border-gray-200 px-6 py-4 mt-16">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Back Button */}
            <button
              onClick={() => navigate('/my-applications')}
              className="text-[var(--color-primary)] hover:text-[var(--color-accent)] transition-colors"
              title="Back to Applications"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            {/* User Info */}
            <div className="flex items-center gap-3">
              <img
                src={otherUser.profilePicture || otherUser.avatar || "https://randomuser.me/api/portraits/men/1.jpg"}
                alt={otherUser.name}
                className="w-10 h-10 rounded-full border-2 border-[var(--color-accent)]"
              />
              <div>
                <h1 className="text-lg font-bold text-[var(--color-primary)]">
                  {otherUser.name}
                </h1>
                <p className="text-sm text-[var(--color-muted)]">
                  About: {conversation.itemTitle}
                </p>
              </div>
            </div>
          </div>
          
          {/* Conversation Info */}
          <div className="text-right">
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
              conversation.itemType === 'offer' 
                ? 'bg-blue-100 text-blue-800' 
                : 'bg-green-100 text-green-800'
            }`}>
              {conversation.itemType === 'offer' ? 'Skill Offer' : 'Skill Request'}
            </span>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-hidden">
        <div className="max-w-4xl mx-auto h-full flex flex-col">
          {/* Messages List */}
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
            {messages.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-white/70 mb-4">
                  <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Start the conversation!</h3>
                <p className="text-white/80">Send a message to begin discussing the skill swap.</p>
              </div>
            ) : (
              messages.map((message) => {
                const isMyMessage = message.sender._id === user._id;
                return (
                  <div
                    key={message._id}
                    className={`flex ${isMyMessage ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className="flex items-end gap-2 max-w-xs md:max-w-md">
                      {!isMyMessage && (
                        <img
                          src={message.sender.profilePicture || message.sender.avatar || "https://randomuser.me/api/portraits/men/1.jpg"}
                          alt={message.sender.name}
                          className="w-8 h-8 rounded-full flex-shrink-0"
                        />
                      )}
                      
                      <div
                        className={`px-4 py-3 rounded-2xl shadow-md ${
                          isMyMessage
                            ? 'bg-[var(--color-accent)] text-white rounded-br-md'
                            : 'bg-white text-[var(--color-primary)] rounded-bl-md'
                        }`}
                      >
                        <p className="text-sm leading-relaxed break-words">
                          {message.content}
                        </p>
                        <p
                          className={`text-xs mt-1 ${
                            isMyMessage ? 'text-white/70' : 'text-gray-500'
                          }`}
                        >
                          {formatTime(message.createdAt)}
                        </p>
                      </div>
                      
                      {isMyMessage && (
                        <img
                          src={user.profilePicture || user.avatar || "https://randomuser.me/api/portraits/men/1.jpg"}
                          alt={user.name}
                          className="w-8 h-8 rounded-full flex-shrink-0"
                        />
                      )}
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <div className="bg-white/90 backdrop-blur-sm border-t border-white/20 px-6 py-4">
            <form onSubmit={handleSendMessage} className="flex gap-3 items-end">
              <div className="flex-1">
                <textarea
                  ref={messageInputRef}
                  value={newMessage}
                  onChange={(e) => {
                    setNewMessage(e.target.value);
                    // Auto-resize textarea
                    e.target.style.height = 'auto';
                    e.target.style.height = Math.min(e.target.scrollHeight, 128) + 'px';
                  }}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage(e);
                    }
                  }}
                  placeholder="Type your message... (Press Enter to send, Shift+Enter for new line)"
                  className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:border-transparent resize-none max-h-32 overflow-y-auto"
                  rows="1"
                  style={{ minHeight: '48px' }}
                  disabled={sending}
                />
              </div>
              <button
                type="submit"
                disabled={!newMessage.trim() || sending}
                className="bg-[var(--color-accent)] text-white p-3 rounded-full hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                title="Send message"
              >
                {sending ? (
                  <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;