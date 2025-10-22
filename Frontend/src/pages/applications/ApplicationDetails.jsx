import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const ApplicationDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchApplication();
  }, [id]);

  const fetchApplication = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:5000/api/responses/${id}`);
      const data = await response.json();
      
      if (response.ok) {
        setApplication(data.response);
      } else {
        setError(data.error || 'Failed to fetch application');
      }
    } catch (error) {
      console.error('Error fetching application:', error);
      setError('Failed to fetch application');
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteApplication = async () => {
    try {
      setCompleting(true);
      const response = await fetch(`http://localhost:5000/api/responses/${id}/complete-application`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: user._id }),
      });

      const data = await response.json();

      if (response.ok) {
        // Refresh application data
        await fetchApplication();
        
        // Show success message
        alert(data.message);
      } else {
        setError(data.error || 'Failed to complete application');
      }
    } catch (error) {
      console.error('Error completing application:', error);
      setError('Failed to complete application');
    } finally {
      setCompleting(false);
    }
  };

  const canComplete = () => {
    if (!application || !user || application.isCompleted) return false;
    
    if (application.responseType === 'offer') {
      // For offers: Only the applicant can complete
      return application.applicant._id === user._id;
    } else if (application.responseType === 'request') {
      // For requests: Only the request owner can complete
      return application.requestID?.user._id === user._id;
    }
    
    return false;
  };

  const getCompletionText = () => {
    if (application?.responseType === 'offer') {
      return 'Mark Application as Completed';
    } else {
      return 'Mark Request as Fulfilled';
    }
  };

  const getStatusBadge = (status) => {
    const statusColors = {
      pending: 'bg-yellow-100 text-yellow-800',
      accepted: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      completed: 'bg-blue-100 text-blue-800',
      withdrawn: 'bg-gray-100 text-gray-800'
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[status] || 'bg-gray-100 text-gray-800'}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-xl font-bold text-[var(--color-primary)]">Loading application...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="text-red-600 text-xl font-bold mb-4">{error}</div>
        <button
          onClick={() => navigate('/applications')}
          className="px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg hover:opacity-80"
        >
          Back to Applications
        </button>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="text-gray-600 text-xl font-bold mb-4">Application not found</div>
        <button
          onClick={() => navigate('/applications')}
          className="px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg hover:opacity-80"
        >
          Back to Applications
        </button>
      </div>
    );
  }

  const post = application.offerID || application.requestID;
  const postOwner = post?.user;
  const isOffer = !!application.offerID;

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/applications')}
          className="mb-4 text-[var(--color-primary)] hover:underline flex items-center gap-2"
        >
          ← Back to Applications
        </button>
        <h1 className="text-3xl font-bold text-[var(--color-primary)]">Application Details</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Application Info */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-xl font-bold text-[var(--color-primary)]">Application</h2>
            {getStatusBadge(application.status)}
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <p className="text-gray-900">
                {isOffer ? 'Application to Offer' : 'Offer to Help with Request'}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Applicant</label>
              <div className="flex items-center gap-3">
                <img
                  src={application.applicant.profilePicture || application.applicant.avatar || '/default-avatar.png'}
                  alt={application.applicant.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <p className="font-medium text-gray-900">{application.applicant.name}</p>
                  <p className="text-sm text-gray-600">{application.applicant.email}</p>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
              <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{application.message}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Availability</label>
              <p className="text-gray-900">{application.availability}</p>
            </div>

            {application.proposedTimeline && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Proposed Timeline</label>
                <p className="text-gray-900">{application.proposedTimeline}</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contact Information</label>
              <div className="text-gray-900">
                {application.contactInfo?.email && (
                  <p>Email: {application.contactInfo.email}</p>
                )}
                {application.contactInfo?.phone && (
                  <p>Phone: {application.contactInfo.phone}</p>
                )}
                <p>Preferred Contact: {application.contactInfo?.preferredContact || 'email'}</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Applied On</label>
              <p className="text-gray-900">{new Date(application.createdAt).toLocaleDateString()}</p>
            </div>

            {application.isCompleted && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-medium text-blue-900 mb-2">✅ Completed</h3>
                <p className="text-blue-800">
                  Completed on {new Date(application.completedAt).toLocaleDateString()}
                </p>
                {application.completedBy && (
                  <p className="text-blue-800 text-sm">
                    Marked complete by: {application.completedBy.name}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Post Info */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold text-[var(--color-primary)] mb-4">
            {isOffer ? 'Offer Details' : 'Request Details'}
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <p className="text-gray-900 font-medium">{post.title}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{post.description}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <p className="text-gray-900">{post.category}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Posted By</label>
              <div className="flex items-center gap-3">
                <img
                  src={postOwner?.profilePicture || postOwner?.avatar || '/default-avatar.png'}
                  alt={postOwner?.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <p className="font-medium text-gray-900">{postOwner?.name}</p>
                  <p className="text-sm text-gray-600">{postOwner?.email}</p>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              {getStatusBadge(post.status)}
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      {application.status === 'accepted' && !application.isCompleted && canComplete() && (
        <div className="mt-6 bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-bold text-[var(--color-primary)] mb-4">Complete Application</h3>
          
          {application.responseType === 'offer' ? (
            <div className="bg-blue-50 p-4 rounded-lg mb-4">
              <p className="text-blue-800">
                <strong>As the applicant:</strong> Mark this application as completed when you have finished 
                receiving help or completed the task. The original offer will remain available for others.
              </p>
            </div>
          ) : (
            <div className="bg-green-50 p-4 rounded-lg mb-4">
              <p className="text-green-800">
                <strong>As the request owner:</strong> Mark this request as fulfilled when you have received 
                the help you needed. This will complete the original request.
              </p>
            </div>
          )}

          <button
            onClick={handleCompleteApplication}
            disabled={completing}
            className="px-6 py-3 bg-[var(--color-accent)] text-white rounded-lg hover:opacity-80 disabled:opacity-50 font-medium"
          >
            {completing ? 'Completing...' : getCompletionText()}
          </button>
        </div>
      )}

      {error && (
        <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">{error}</p>
        </div>
      )}
    </div>
  );
};

export default ApplicationDetails;