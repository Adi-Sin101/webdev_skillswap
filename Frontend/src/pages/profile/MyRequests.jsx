import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import StatusModal from '../../components/StatusModal';

const MyRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, pending, completed
  
  // Modal states
  const [modal, setModal] = useState({
    isOpen: false,
    type: 'success',
    message: '',
    showConfirm: false,
    onConfirm: null
  });

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/requests');
        const data = await response.json();
        
        // Use actual status from database, add display properties
        const requests = data.requests || [];
        let requestsWithDisplayData = requests.map(request => ({
          ...request,
          responses: 0, // Will be updated with real counts
          dateCreated: new Date(request.createdAt || Date.now()).toLocaleDateString()
        }));
        
        // Fetch real response counts
        if (requests.length > 0) {
          try {
            const requestIDs = requests.map(request => request._id || request.id);
            const countsResponse = await fetch('http://localhost:5000/api/responses/requests/response-counts', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ requestIDs })
            });
            
            if (countsResponse.ok) {
              const { responseCounts } = await countsResponse.json();
              requestsWithDisplayData = requestsWithDisplayData.map(request => ({
                ...request,
                responses: responseCounts[request._id || request.id] || 0
              }));
            }
          } catch (countError) {
            console.warn('Failed to fetch response counts:', countError);
          }
        }
        
        setRequests(requestsWithDisplayData);
      } catch (error) {
        console.error('Error fetching requests:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

  const showModal = (type, message, showConfirm = false, onConfirm = null) => {
    setModal({
      isOpen: true,
      type,
      message,
      showConfirm,
      onConfirm
    });
  };

  const closeModal = () => {
    setModal({
      isOpen: false,
      type: 'success',
      message: '',
      showConfirm: false,
      onConfirm: null
    });
  };

  const handleDeleteRequest = async (requestId) => {
    showModal(
      'confirm',
      'Are you sure you want to delete this request? This action cannot be undone.',
      true,
      async () => {
        closeModal();
        try {
          const response = await fetch(`http://localhost:5000/api/requests/${requestId}`, {
            method: 'DELETE',
          });

          if (response.ok) {
            setRequests(prev => prev.filter(request => (request.id || request._id) !== requestId));
            showModal('success', 'Request deleted successfully!');
          } else {
            const data = await response.json();
            showModal('error', `Error: ${data.error || 'Failed to delete request'}`);
          }
        } catch (error) {
          console.error('Error deleting request:', error);
          showModal('error', 'Network error. Please try again.');
        }
      }
    );
  };

  const handleStatusUpdate = async (requestId, newStatus) => {
    try {
      const response = await fetch(`http://localhost:5000/api/requests/${requestId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        const data = await response.json();
        setRequests(prev => prev.map(request => 
          (request.id || request._id) === requestId 
            ? { ...request, status: newStatus }
            : request
        ));
        showModal('success', `Request marked as ${newStatus}!`);
      } else {
        const data = await response.json();
        showModal('error', `Error: ${data.error || 'Failed to update status'}`);
      }
    } catch (error) {
      console.error('Error updating status:', error);
      showModal('error', 'Network error. Please try again.');
    }
  };

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
      <div className="max-w-screen-2xl mx-auto px-6 md:px-12">
        {/* Header */}
        <div className="mb-8">
          {/* Breadcrumb Navigation */}
          <nav className="mb-4">
            <div className="flex items-center space-x-2 text-sm">
              <Link 
                to="/profile" 
                className="text-[var(--color-muted)] hover:text-[var(--color-primary)] transition-colors duration-200"
              >
                Profile
              </Link>
              <svg className="w-4 h-4 text-[var(--color-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              <span className="text-[var(--color-primary)] font-medium">My Requests</span>
            </div>
          </nav>
          
          {/* Main Header */}
          <div className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] text-white px-6 py-6 rounded-xl">
            <h1 className="text-3xl font-bold mb-2">
              My Skill Requests
            </h1>
            <p className="text-white/90">Track all your skill requests and learning opportunities</p>
          </div>
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
            <div key={request.id || request._id} className="bg-blue-50 rounded-xl p-6 border border-blue-200 shadow-sm hover:shadow-md transition-shadow">
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
                  <span className="bg-blue-100 px-2 py-1 rounded text-xs text-blue-800">{request.category}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-[var(--color-accent)] font-medium">Skill Level:</span>
                  <span className={`px-2 py-1 rounded text-xs ${
                    request.skillLevel === 'Complete Beginner' ? 'bg-red-100 text-red-800' :
                    request.skillLevel === 'Beginner' ? 'bg-green-100 text-green-800' :
                    request.skillLevel === 'Intermediate' ? 'bg-blue-100 text-blue-800' :
                    'bg-purple-100 text-purple-800'
                  }`}>
                    {request.skillLevel || 'Beginner'}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-[var(--color-accent)] font-medium">Availability:</span>
                  <span className="text-[var(--color-muted)]">{request.availability || 'Not specified'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-[var(--color-accent)] font-medium">Location:</span>
                  <span className="text-[var(--color-muted)]">{request.location || 'Not specified'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-[var(--color-accent)] font-medium">Payment:</span>
                  <span className={`px-2 py-1 rounded text-xs ${
                    request.isPaid ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                  }`}>
                    {request.isPaid ? `Paid - $${request.price || 'N/A'}` : 'Free'}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-[var(--color-accent)] font-medium">Delivery:</span>
                  <span className="text-[var(--color-muted)]">{request.deliveryMethod || 'Both'}</span>
                </div>
              </div>

              {/* Status Toggle Button */}
              <div className="flex justify-center mb-3">
                <button
                  onClick={() => handleStatusUpdate(
                    request.id || request._id, 
                    request.status === 'pending' ? 'completed' : 'pending'
                  )}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 flex items-center gap-1 ${
                    request.status === 'completed'
                      ? 'bg-green-500 text-white hover:bg-green-600'
                      : 'bg-orange-500 text-white hover:bg-orange-600'
                  }`}
                >
                  <span>{request.status === 'completed' ? '✅' : '🔍'}</span>
                  <span>{request.status === 'completed' ? 'Completed' : 'Seeking Help'}</span>
                </button>
              </div>

              {/* Stats */}
              <div className="flex justify-between items-center pt-4 border-t border-[var(--color-border)]">
                <span className="text-sm text-[var(--color-muted)]">
                  {request.responses} offers received
                </span>
                <div className="flex gap-2">
                  <Link 
                    to="/profile" 
                    state={{ editRequest: request.id || request._id }} 
                    className="text-[var(--color-accent)] text-sm font-medium hover:underline"
                  >
                    Edit
                  </Link>
                  <button 
                    onClick={() => handleDeleteRequest(request.id || request._id)}
                    className="text-red-500 text-sm font-medium hover:underline"
                  >
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

      {/* Status Modal */}
      <StatusModal
        isOpen={modal.isOpen}
        onClose={closeModal}
        type={modal.type}
        message={modal.message}
        showConfirm={modal.showConfirm}
        onConfirm={modal.onConfirm}
      />
    </div>
  );
};

export default MyRequests;