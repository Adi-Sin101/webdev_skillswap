import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const Notifications = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all', 'unread', 'read'
  const [actionLoading, setActionLoading] = useState({});

  // Helper to set loading state for specific notification actions
  const setNotificationLoading = (notificationId, isLoading) => {
    setActionLoading(prev => ({
      ...prev,
      [notificationId]: isLoading
    }));
  };

  // Dummy notifications data (replace with API call later)
  const dummyNotifications = [
    {
      id: 1,
      type: 'offer_response',
      title: 'New response to your offer',
      message: 'John Doe responded to your "React Tutoring" offer. He\'s interested in learning React fundamentals.',
      time: '2 minutes ago',
      timestamp: new Date(Date.now() - 2 * 60000),
      isRead: false,
      actionUrl: '/my-offers',
      relatedUser: {
        name: 'John Doe',
        avatar: 'https://randomuser.me/api/portraits/men/32.jpg'
      }
    },
    {
      id: 2,
      type: 'request_response',
      title: 'Someone wants to help',
      message: 'Sarah Khan offered to help with your "Python Data Science" request. She has 3 years of experience.',
      time: '1 hour ago',
      timestamp: new Date(Date.now() - 60 * 60000),
      isRead: false,
      actionUrl: '/my-requests',
      relatedUser: {
        name: 'Sarah Khan',
        avatar: 'https://randomuser.me/api/portraits/women/44.jpg'
      }
    },
    {
      id: 3,
      type: 'session_scheduled',
      title: 'Session scheduled',
      message: 'Your tutoring session with Mike Wilson is scheduled for tomorrow at 3:00 PM. Location: Library Study Room 202.',
      time: '3 hours ago',
      timestamp: new Date(Date.now() - 3 * 60 * 60000),
      isRead: true,
      actionUrl: '/sessions',
      relatedUser: {
        name: 'Mike Wilson',
        avatar: 'https://randomuser.me/api/portraits/men/45.jpg'
      }
    },
    {
      id: 4,
      type: 'session_completed',
      title: 'Session completed',
      message: 'You completed a tutoring session with Emma Thompson. Don\'t forget to leave a review!',
      time: '1 day ago',
      timestamp: new Date(Date.now() - 24 * 60 * 60000),
      isRead: true,
      actionUrl: '/completed-activities',
      relatedUser: {
        name: 'Emma Thompson',
        avatar: 'https://randomuser.me/api/portraits/women/68.jpg'
      }
    },
    {
      id: 5,
      type: 'badge_earned',
      title: 'New badge earned!',
      message: 'Congratulations! You\'ve earned the "Helpful Tutor" badge for completing 5 successful tutoring sessions.',
      time: '2 days ago',
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60000),
      isRead: true,
      actionUrl: '/profile'
    },
    {
      id: 6,
      type: 'new_message',
      title: 'New message',
      message: 'Alex Kumar sent you a message about the upcoming JavaScript workshop.',
      time: '3 days ago',
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60000),
      isRead: true,
      actionUrl: '/messages',
      relatedUser: {
        name: 'Alex Kumar',
        avatar: 'https://randomuser.me/api/portraits/men/22.jpg'
      }
    }
  ];

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:5000/api/notifications/user/${user._id}`);
        const data = await response.json();
        
        if (response.ok) {
          setNotifications(data.notifications || []);
        } else {
          console.error('Error fetching notifications:', data.error);
          setNotifications(dummyNotifications); // Fallback to dummy data
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching notifications:', error);
        setNotifications(dummyNotifications); // Fallback to dummy data
        setLoading(false);
      }
    };

    if (user && user._id) {
      fetchNotifications();
      
      // Auto-refresh every 30 seconds
      const intervalId = setInterval(fetchNotifications, 30000);
      
      // Cleanup interval on unmount
      return () => clearInterval(intervalId);
    }
  }, [user]);

  const markAsRead = async (notificationId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/notifications/${notificationId}/read`, { 
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        setNotifications(prev => 
          prev.map(notif => 
            notif._id === notificationId ? { ...notif, isRead: true } : notif
          )
        );
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/notifications/user/${user._id}/mark-all-read`, { 
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        setNotifications(prev => 
          prev.map(notif => ({ ...notif, isRead: true }))
        );
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/notifications/${notificationId}`, { 
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        setNotifications(prev => 
          prev.filter(notif => notif._id !== notificationId)
        );
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  // Connection request handlers
  const handleAcceptConnection = async (notification) => {
    const connectionId = notification.actionUrl?.split('connection=')[1];
    if (!connectionId) {
      alert('Connection information not found');
      return;
    }

    setNotificationLoading(notification._id, true);
    try {
      const response = await fetch(`http://localhost:5000/api/connections/${connectionId}/accept`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user._id })
      });

      if (response.ok) {
        // Mark notification as read and update its type
        setNotifications(prev =>
          prev.map(notif =>
            notif._id === notification._id
              ? { ...notif, isRead: true, type: 'connection_accepted_by_me' }
              : notif
          )
        );
        alert('Connection request accepted!');
      } else {
        const data = await response.json();
        alert(`Error: ${data.error || 'Failed to accept connection'}`);
      }
    } catch (error) {
      console.error('Error accepting connection:', error);
      alert('Network error. Please try again.');
    } finally {
      setNotificationLoading(notification._id, false);
    }
  };

  const handleIgnoreConnection = async (notification) => {
    const connectionId = notification.actionUrl?.split('connection=')[1];
    if (!connectionId) {
      alert('Connection information not found');
      return;
    }

    setNotificationLoading(notification._id, true);
    try {
      const response = await fetch(`http://localhost:5000/api/connections/${connectionId}/ignore`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user._id })
      });

      if (response.ok) {
        // Mark notification as read and update its type
        setNotifications(prev =>
          prev.map(notif =>
            notif._id === notification._id
              ? { ...notif, isRead: true, type: 'connection_ignored_by_me' }
              : notif
          )
        );
        alert('Connection request ignored.');
      } else {
        const data = await response.json();
        alert(`Error: ${data.error || 'Failed to ignore connection'}`);
      }
    } catch (error) {
      console.error('Error ignoring connection:', error);
      alert('Network error. Please try again.');
    } finally {
      setNotificationLoading(notification._id, false);
    }
  };

  // Handle viewing connection notification details (navigate to sender's profile)
  const handleViewConnectionDetails = (notification) => {
    // Mark as read
    if (!notification.isRead) {
      markAsRead(notification._id);
    }
    
    // Extract sender ID and navigate to their profile
    const senderId = notification.sender?._id || notification.sender;
    if (senderId) {
      navigate(`/profile/${senderId}`);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'new_offer':
        return (
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24ght24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
        );
      case 'new_request':
        return (
          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
      case 'offer_response':
        return (
          <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
        );
      case 'request_response':
        return (
          <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
      case 'session_scheduled':
        return (
          <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        );
      case 'session_completed':
        return (
          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
      case 'badge_earned':
        return (
          <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
        );
      case 'connection_request':
        return (
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
        );
      case 'connection_accepted':
        return (
          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
      case 'new_message':
        return (
          <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-3.405-3.405A2.032 2.032 0 0116 12.414V11a6.01 6.01 0 00-2-4.473 6.003 6.003 0 00-8 0A6.01 6.01 0 004 11v1.414c0 .529-.211 1.036-.595 1.405L0 17h5m10 0v1a3 3 0 11-6 0v-1" />
            </svg>
          </div>
        );
    }
  };

  const filteredNotifications = notifications.filter(notif => {
    if (filter === 'unread') return !notif.isRead;
    if (filter === 'read') return notif.isRead;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-accent)]/20 flex items-center justify-center">
        <div className="text-xl font-bold text-white">Loading notifications...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-accent)]/20 py-8 px-6 md:px-12">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Notifications</h1>
          <p className="text-white/80">Stay updated with your skill exchange activities</p>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            {/* Filter Tabs */}
            <div className="flex gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                  filter === 'all'
                    ? 'bg-[var(--color-accent)] text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                All ({notifications.length})
              </button>
              <button
                onClick={() => setFilter('unread')}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                  filter === 'unread'
                    ? 'bg-[var(--color-accent)] text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Unread ({unreadCount})
              </button>
              <button
                onClick={() => setFilter('read')}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                  filter === 'read'
                    ? 'bg-[var(--color-accent)] text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Read ({notifications.length - unreadCount})
              </button>
            </div>

            {/* Actions */}
            <div className="flex gap-3 items-center">
              <button
                onClick={() => {
                  setLoading(true);
                  fetch(`http://localhost:5000/api/notifications/user/${user._id}`)
                    .then(res => res.json())
                    .then(data => {
                      if (data.notifications) {
                        setNotifications(data.notifications);
                      }
                      setLoading(false);
                    })
                    .catch(error => {
                      console.error('Error refreshing notifications:', error);
                      setLoading(false);
                    });
                }}
                className="text-sm text-gray-600 hover:text-gray-800 font-medium flex items-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </button>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  Mark all as read
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Notifications List */}
        <div className="space-y-4">
          {filteredNotifications.length > 0 ? (
            filteredNotifications.map(notification => (
              <div
                key={notification._id || notification.id}
                className={`bg-white rounded-xl shadow-lg p-6 transition-all hover:shadow-xl ${
                  !notification.isRead ? 'border-l-4 border-blue-500' : ''
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  {getIcon(notification.type)}

                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-[var(--color-primary)] mb-1">
                          {notification.title}
                        </h3>
                        <p className="text-gray-600 mb-2 leading-relaxed">
                          {notification.message}
                        </p>
                        
                        {/* User info if available */}
                        {(notification.sender || notification.relatedUser) && (
                          <div className="flex items-center gap-2 mb-2">
                            <img
                              src={(notification.sender?.profilePicture || notification.sender?.avatar || notification.relatedUser?.profilePicture || notification.relatedUser?.avatar) || 'https://randomuser.me/api/portraits/lego/1.jpg'}
                              alt={(notification.sender?.name || notification.relatedUser?.name) || 'User'}
                              className="w-6 h-6 rounded-full"
                            />
                            <span className="text-sm text-gray-500">
                              {notification.sender?.name || notification.relatedUser?.name || 'Unknown User'}
                            </span>
                          </div>
                        )}

                        <div className="flex items-center gap-4 text-sm text-gray-400">
                          <span>{notification.time || new Date(notification.createdAt).toLocaleString()}</span>
                          {!notification.isRead && (
                            <span className="flex items-center gap-1">
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                              Unread
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 ml-4">
                        {!notification.isRead && (
                          <button
                            onClick={() => markAsRead(notification._id || notification.id)}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                          >
                            Mark as read
                          </button>
                        )}
                        <button
                          onClick={() => deleteNotification(notification._id || notification.id)}
                          className="text-red-600 hover:text-red-800 p-1"
                          title="Delete notification"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-3">
                      {/* Special handling for connection requests */}
                      {notification.type === 'connection_request' && !notification.isRead ? (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleAcceptConnection(notification)}
                            disabled={actionLoading[notification._id]}
                            className="px-4 py-2 bg-green-500 text-white text-sm font-medium rounded-lg hover:bg-green-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {actionLoading[notification._id] ? 'Loading...' : 'Accept'}
                          </button>
                          <button
                            onClick={() => handleIgnoreConnection(notification)}
                            disabled={actionLoading[notification._id]}
                            className="px-4 py-2 bg-gray-500 text-white text-sm font-medium rounded-lg hover:bg-gray-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {actionLoading[notification._id] ? 'Loading...' : 'Ignore'}
                          </button>
                          <button
                            onClick={() => handleViewConnectionDetails(notification)}
                            className="px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition"
                          >
                            View Profile
                          </button>
                        </div>
                      ) : (notification.type === 'connection_request' || notification.type === 'connection_accepted') ? (
                        <button
                          onClick={() => handleViewConnectionDetails(notification)}
                          className="inline-flex items-center gap-2 text-sm font-medium text-[var(--color-accent)] hover:text-blue-800"
                        >
                          View Profile
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      ) : notification.actionUrl ? (
                        <a
                          href={notification.actionUrl}
                          className="inline-flex items-center gap-2 text-sm font-medium text-[var(--color-accent)] hover:text-blue-800"
                        >
                          View Details
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </a>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white rounded-xl shadow-lg p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-3.405-3.405A2.032 2.032 0 0116 12.414V11a6.01 6.01 0 00-2-4.473 6.003 6.003 0 00-8 0A6.01 6.01 0 004 11v1.414c0 .529-.211 1.036-.595 1.405L0 17h5m10 0v1a3 3 0 11-6 0v-1" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">No notifications found</h3>
              <p className="text-gray-600">
                {filter === 'unread' 
                  ? "You're all caught up! No unread notifications."
                  : filter === 'read'
                    ? "No read notifications yet."
                    : "You don't have any notifications yet. Start skill swapping to get updates!"
                }
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Notifications;