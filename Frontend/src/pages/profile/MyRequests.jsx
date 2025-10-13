import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const MyRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, pending, completed

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/requests');
        const data = await response.json();
        
        // Add status to requests (for demo purposes, randomly assign)
        const requestsWithStatus = data.requests?.map(request => ({
          ...request,
          status: Math.random() > 0.5 ? 'completed' : 'pending',
          responses: Math.floor(Math.random() * 3),
          dateCreated: new Date(request.createdAt || Date.now()).toLocaleDateString()
        })) || [];
        
        setRequests(requestsWithStatus);
      } catch (error) {
        console.error('Error fetching requests:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

  const filteredRequests = requests.filter(request => {
    if (filter === 'all') return true;
    return request.status === filter;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--color-background)] flex items-center justify-center">
        <div className="text-xl font-bold text-[var(--color-primary)]">Loading your requests...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-background)] py-8 pt-24">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="bg-gradient-to-r from-indigo-500 to-blue-600 text-white px-6 py-4 rounded-lg flex-1 mr-4">
            <h1 className="text-3xl font-bold mb-2">
              My Skill Requests
            </h1>
            <p className="text-indigo-100">Track all your skill requests and learning opportunities</p>
          </div>
          <Link 
            to="/profile" 
            className="bg-white text-indigo-600 px-4 py-2 rounded-lg border border-indigo-200 hover:bg-indigo-50 transition-colors font-medium"
          >
            ← Back to Profile
          </Link>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'all' 
                ? 'bg-[var(--color-accent)] text-white' 
                : 'bg-[var(--color-surface)] text-[var(--color-primary)] border border-[var(--color-border)]'
            }`}
          >
            All ({requests.length})
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'pending' 
                ? 'bg-[var(--color-accent)] text-white' 
                : 'bg-[var(--color-surface)] text-[var(--color-primary)] border border-[var(--color-border)]'
            }`}
          >
            Pending ({requests.filter(r => r.status === 'pending').length})
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'completed' 
                ? 'bg-[var(--color-accent)] text-white' 
                : 'bg-[var(--color-surface)] text-[var(--color-primary)] border border-[var(--color-border)]'
            }`}
          >
            Completed ({requests.filter(r => r.status === 'completed').length})
          </button>
        </div>

        {/* Requests Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredRequests.map(request => (
            <div key={request.id || request._id} className="bg-[var(--color-surface)] rounded-xl p-6 border border-[var(--color-border)] shadow-sm hover:shadow-md transition-shadow">
              {/* Status Badge */}
              <div className="flex justify-between items-start mb-4">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  request.status === 'completed' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-orange-100 text-orange-800'
                }`}>
                  {request.status === 'completed' ? 'Completed' : 'Seeking Help'}
                </span>
                <span className="text-xs text-[var(--color-muted)]">{request.dateCreated}</span>
              </div>

              {/* Request Details */}
              <h3 className="text-xl font-bold text-[var(--color-primary)] mb-2">{request.title}</h3>
              <p className="text-[var(--color-muted)] text-sm mb-4 line-clamp-3">{request.description}</p>
              
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-[var(--color-accent)] font-medium">Category:</span>
                  <span className="bg-[var(--color-background)] px-2 py-1 rounded text-xs">{request.category}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-[var(--color-accent)] font-medium">Deadline:</span>
                  <span className={`px-2 py-1 rounded text-xs ${
                    request.deadline === 'Today' 
                      ? 'bg-red-100 text-red-800' 
                      : request.deadline === 'This Week' 
                        ? 'bg-yellow-100 text-yellow-800' 
                        : 'bg-green-100 text-green-800'
                  }`}>
                    {request.deadline}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-[var(--color-accent)] font-medium">Location:</span>
                  <span className="text-[var(--color-muted)]">{request.location}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-[var(--color-accent)] font-medium">Type:</span>
                  <span className={`px-2 py-1 rounded text-xs ${
                    request.type === 'Free' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {request.type}
                  </span>
                </div>
              </div>

              {/* Stats */}
              <div className="flex justify-between items-center pt-4 border-t border-[var(--color-border)]">
                <span className="text-sm text-[var(--color-muted)]">
                  {request.responses} offers received
                </span>
                <div className="flex gap-2">
                  <button className="text-[var(--color-accent)] text-sm font-medium hover:underline">
                    Edit
                  </button>
                  <button className="text-red-500 text-sm font-medium hover:underline">
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredRequests.length === 0 && (
          <div className="text-center py-12">
            <h3 className="text-xl font-bold text-[var(--color-primary)] mb-2">
              No {filter === 'all' ? '' : filter} requests found
            </h3>
            <p className="text-[var(--color-muted)] mb-4">
              {filter === 'all' 
                ? "You haven't made any skill requests yet." 
                : `You don't have any ${filter} requests.`}
            </p>
            <Link 
              to="/profile" 
              className="bg-[var(--color-accent)] text-white px-6 py-2 rounded-lg hover:opacity-90 transition-opacity"
            >
              Create Your First Request
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyRequests;