import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const PostManagement = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [hiddenFilter, setHiddenFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [actionLoading, setActionLoading] = useState({});

  useEffect(() => {
    if (authLoading) return;
    
    if (!user) {
      navigate('/login');
      return;
    }

    if (user.role !== 'admin') {
      navigate('/');
      return;
    }

    fetchPosts();
  }, [user, authLoading, navigate, currentPage, search, typeFilter, hiddenFilter]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const queryParams = new URLSearchParams({
        page: currentPage,
        search,
        ...(typeFilter && { type: typeFilter }),
        ...(hiddenFilter !== '' && { isHidden: hiddenFilter })
      });

      const response = await fetch(`http://localhost:5000/api/admin/posts?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (response.ok) {
        setPosts(data.posts);
        setTotalPages(data.totalPages);
      } else {
        console.error('Error fetching posts:', data.error);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleHidePost = async (postId, type, reason = '') => {
    if (!window.confirm('Are you sure you want to hide this post?')) return;

    setActionLoading(prev => ({ ...prev, [postId]: true }));

    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`http://localhost:5000/api/admin/posts/${postId}/hide`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          type,
          reason: reason || 'Inappropriate content' 
        })
      });

      const data = await response.json();

      if (response.ok) {
        alert('Post hidden successfully');
        fetchPosts();
      } else {
        alert('Error: ' + data.error);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Network error');
    } finally {
      setActionLoading(prev => ({ ...prev, [postId]: false }));
    }
  };

  const handleUnhidePost = async (postId, type) => {
    if (!window.confirm('Are you sure you want to unhide this post?')) return;

    setActionLoading(prev => ({ ...prev, [postId]: true }));

    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`http://localhost:5000/api/admin/posts/${postId}/unhide`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ type })
      });

      const data = await response.json();

      if (response.ok) {
        alert('Post unhidden successfully');
        fetchPosts();
      } else {
        alert('Error: ' + data.error);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Network error');
    } finally {
      setActionLoading(prev => ({ ...prev, [postId]: false }));
    }
  };

  const handleDeletePost = async (postId, type) => {
    if (!window.confirm('Are you sure you want to permanently delete this post? This action cannot be undone.')) return;

    setActionLoading(prev => ({ ...prev, [postId]: true }));

    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`http://localhost:5000/api/admin/posts/${postId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ type })
      });

      const data = await response.json();

      if (response.ok) {
        alert('Post deleted successfully');
        fetchPosts();
      } else {
        alert('Error: ' + data.error);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Network error');
    } finally {
      setActionLoading(prev => ({ ...prev, [postId]: false }));
    }
  };

  if (authLoading || (loading && posts.length === 0)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-accent)]/20 flex items-center justify-center">
        <div className="text-xl font-bold text-white">Loading posts...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-accent)]/20 py-8 pt-24">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <Link to="/admin" className="text-white/80 hover:text-white text-sm mb-2 inline-block">
              ← Back to Dashboard
            </Link>
            <h1 className="text-3xl font-bold text-white">Post Management</h1>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl p-6 shadow-lg mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="text"
              placeholder="Search by title or description..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
            />
            
            <select
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
            >
              <option value="">All Types</option>
              <option value="offer">Offers</option>
              <option value="request">Requests</option>
            </select>

            <select
              value={hiddenFilter}
              onChange={(e) => {
                setHiddenFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
            >
              <option value="">All Status</option>
              <option value="false">Visible</option>
              <option value="true">Hidden</option>
            </select>
          </div>
        </div>

        {/* Posts List */}
        <div className="space-y-4">
          {posts.map(post => (
            <div key={post._id} className={`bg-white rounded-xl p-6 shadow-lg ${post.isHidden ? 'border-l-4 border-red-500' : ''}`}>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-xl font-bold text-[var(--color-primary)]">{post.title}</h3>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      post.type === 'offer' 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {post.type}
                    </span>
                    {post.isHidden && (
                      <span className="px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-800">
                        HIDDEN
                      </span>
                    )}
                  </div>
                  
                  <p className="text-gray-600 mb-3">{post.description?.substring(0, 150)}{post.description?.length > 150 ? '...' : ''}</p>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                      <img
                        src={post.user?.profilePicture || post.user?.avatar || "https://randomuser.me/api/portraits/men/1.jpg"}
                        alt={post.user?.name}
                        className="w-6 h-6 rounded-full"
                      />
                      <span>{post.user?.name}</span>
                    </div>
                    <span>•</span>
                    <span>{post.category}</span>
                    <span>•</span>
                    <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                  </div>
                  
                  {post.isHidden && post.hiddenReason && (
                    <div className="mt-3 p-3 bg-red-50 rounded-lg">
                      <p className="text-sm text-red-800">
                        <strong>Hidden reason:</strong> {post.hiddenReason}
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-2 ml-4">
                  <Link
                    to={post.type === 'offer' ? `/offer-details/${post._id}` : `/request-details/${post._id}`}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition text-sm text-center"
                  >
                    View
                  </Link>
                  
                  {post.isHidden ? (
                    <button
                      onClick={() => handleUnhidePost(post._id, post.type)}
                      disabled={actionLoading[post._id]}
                      className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition text-sm disabled:opacity-50"
                    >
                      {actionLoading[post._id] ? 'Loading...' : 'Unhide'}
                    </button>
                  ) : (
                    <button
                      onClick={() => handleHidePost(post._id, post.type)}
                      disabled={actionLoading[post._id]}
                      className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition text-sm disabled:opacity-50"
                    >
                      {actionLoading[post._id] ? 'Loading...' : 'Hide'}
                    </button>
                  )}
                  
                  <button
                    onClick={() => handleDeletePost(post._id, post.type)}
                    disabled={actionLoading[post._id]}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition text-sm disabled:opacity-50"
                  >
                    {actionLoading[post._id] ? 'Loading...' : 'Delete'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {posts.length === 0 && !loading && (
          <div className="bg-white rounded-xl p-12 text-center shadow-lg">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-gray-500 text-lg">No posts found</p>
            <p className="text-gray-400 text-sm mt-2">Posts will appear here once users start creating offers and requests</p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white rounded-xl px-6 py-4 flex items-center justify-between shadow-lg mt-6">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-sm text-gray-700">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PostManagement;
