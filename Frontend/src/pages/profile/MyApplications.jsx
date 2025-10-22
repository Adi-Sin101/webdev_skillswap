import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

const MyApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('received'); // received, sent
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchApplications = async () => {
      if (!user?._id) {
        setLoading(false);
        return;
      }

      try {
        // For received applications, we need to get responses to user's offers and requests
        if (filter === 'received') {
          const [offersRes, requestsRes] = await Promise.all([
            fetch(`http://localhost:5000/api/offers/user/${user._id}`),
            fetch(`http://localhost:5000/api/requests/user/${user._id}`)
          ]);

          const offersData = offersRes.ok ? await offersRes.json() : { offers: [] };
          const requestsData = requestsRes.ok ? await requestsRes.json() : { requests: [] };

          // Get responses for each offer and request
          const allResponses = [];
          
          for (const offer of offersData.offers || []) {
            const responsesRes = await fetch(`http://localhost:5000/api/responses/offers/${offer._id}/responses`);
            if (responsesRes.ok) {
              const responsesData = await responsesRes.json();
              allResponses.push(...responsesData.responses.map(response => ({
                ...response,
                itemType: 'offer',
                itemTitle: offer.title,
                itemId: offer._id
              })));
            }
          }

          for (const request of requestsData.requests || []) {
            const responsesRes = await fetch(`http://localhost:5000/api/responses/requests/${request._id}/responses`);
            if (responsesRes.ok) {
              const responsesData = await responsesRes.json();
              allResponses.push(...responsesData.responses.map(response => ({
                ...response,
                itemType: 'request',
                itemTitle: request.title,
                itemId: request._id
              })));
            }
          }

          setApplications(allResponses);
        } else if (filter === 'sent') {
          // For sent applications, get all responses where user is the applicant
          const sentRes = await fetch(`http://localhost:5000/api/responses/user/${user._id}/sent`);
          if (sentRes.ok) {
            const sentData = await sentRes.json();
            setApplications(sentData.responses);
          } else {
            setApplications([]);
          }
        }
      } catch (error) {
        console.error('Error fetching applications:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, [user, filter]);

  const handleUpdateStatus = async (responseId, newStatus) => {
    try {
      console.log('Updating status for response:', responseId, 'to:', newStatus);
      
      const response = await fetch(`http://localhost:5000/api/responses/${responseId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus, ownerId: user._id }),
      });

      console.log('Response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('Success response:', data);
        
        setApplications(prev => prev.map(app => 
          app._id === responseId ? { ...app, status: newStatus } : app
        ));
        alert(`Application ${newStatus} successfully!`);
      } else {
        const errorData = await response.json();
        console.error('Error response:', errorData);
        alert(`Error: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Network error:', error);
      alert(`Network error: ${error.message}. Please check if the backend server is running.`);
    }
  };

  const handleEmailExchanged = async (responseId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/responses/${responseId}/email-exchanged`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: user._id }),
      });

      if (response.ok) {
        setApplications(prev => prev.map(app => 
          app._id === responseId ? { ...app, emailExchanged: true } : app
        ));
        alert('Email exchange confirmed! You can now proceed with the skill swap.');
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Network error:', error);
      alert(`Network error: ${error.message}`);
    }
  };

  const handleMarkComplete = async (responseId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/responses/${responseId}/complete`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: user._id }),
      });

      if (response.ok) {
        const data = await response.json();
        setApplications(prev => prev.map(app => 
          app._id === responseId ? { ...app, ...data.response } : app
        ));
        alert(data.message);
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Network error:', error);
      alert(`Network error: ${error.message}`);
    }
  };

  const handleStartConversation = async (applicationId) => {
    try {
      const response = await fetch('http://localhost:5000/api/messages/conversations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          applicationId,
          ownerId: user._id
        }),
      });

      if (response.ok) {
        const data = await response.json();
        // Navigate to the chat page with conversation ID
        navigate(`/chat/${data.conversation._id}`, {
          state: {
            otherUser: data.conversation.otherParticipant,
            itemTitle: data.conversation.itemTitle,
            itemType: data.conversation.itemType
          }
        });
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.error || 'Failed to start conversation'}`);
      }
    } catch (error) {
      console.error('Network error:', error);
      alert(`Network error: ${error.message}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-accent)]/20 flex items-center justify-center">
        <div className="text-xl font-bold text-white">Loading applications...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-accent)]/20 py-8 pt-24">
      <div className="max-w-screen-2xl mx-auto px-6 md:px-12">
        {/* Header */}
        <div className="mb-8">
          {/* Breadcrumb Navigation */}
          <nav className="mb-4">
            <div className="flex items-center space-x-2 text-sm">
              <Link 
                to="/profile" 
                className="text-white/70 hover:text-white transition-colors duration-200"
              >
                Profile
              </Link>
              <svg className="w-4 h-4 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              <span className="text-white font-medium">Applications</span>
            </div>
          </nav>
          
          {/* Main Header */}
          <div className="bg-[var(--color-primary)] text-white px-6 py-6 rounded-xl">
            <h1 className="text-3xl font-bold mb-2">
              My Applications
            </h1>
            <p className="text-white/90">
              {filter === 'received' 
                ? 'Manage applications received for your offers and requests'
                : 'View applications you have sent to others\' offers and requests'
              }
            </p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="mb-6">
          <div className="bg-white rounded-xl p-1 shadow-lg border border-[var(--color-accent)]/20">
            <div className="flex">
              <button
                onClick={() => setFilter('received')}
                className={`flex-1 px-6 py-3 rounded-lg font-medium transition-all ${
                  filter === 'received'
                    ? 'bg-[var(--color-primary)] text-white shadow-md'
                    : 'text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10'
                }`}
              >
                📥 Received Applications
              </button>
              <button
                onClick={() => setFilter('sent')}
                className={`flex-1 px-6 py-3 rounded-lg font-medium transition-all ${
                  filter === 'sent'
                    ? 'bg-[var(--color-primary)] text-white shadow-md'
                    : 'text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10'
                }`}
              >
                📤 Sent Applications
              </button>
            </div>
          </div>
        </div>

        {/* Applications List */}
        <div className="space-y-4">
          {applications.map(application => {
            // For sent applications, get the item details from the populated fields
            const itemTitle = filter === 'sent' 
              ? (application.offerID?.title || application.requestID?.title)
              : application.itemTitle;
            const itemType = filter === 'sent'
              ? (application.offerID ? 'offer' : 'request')
              : application.itemType;
            const itemOwner = filter === 'sent'
              ? (application.offerID?.user || application.requestID?.user)
              : application.itemOwner;
            const otherUser = filter === 'sent' ? itemOwner : application.applicant;

            return (
              <div key={application._id} className="bg-white rounded-xl p-6 border border-[var(--color-accent)]/20 shadow-lg hover:shadow-xl transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-bold text-lg text-[var(--color-primary)]">{otherUser?.name || 'Unknown User'}</h3>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        itemType === 'offer' 
                          ? 'bg-[var(--color-accent)]/20 text-[var(--color-accent)]' 
                          : 'bg-[var(--color-primary)]/20 text-[var(--color-primary)]'
                      }`}>
                        {filter === 'received' ? 'Applied to' : 'Your application to'} {itemType}
                      </span>
                    </div>
                    <p className="text-[var(--color-primary)]/80 mb-2 font-medium">{itemTitle}</p>
                    <p className="text-sm text-[var(--color-muted)] mb-3">{application.message}</p>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-[var(--color-primary)]">Availability:</span>
                        <span className="ml-2 text-[var(--color-muted)]">{application.availability || 'Not specified'}</span>
                      </div>
                      <div>
                        <span className="font-medium text-[var(--color-primary)]">Timeline:</span>
                        <span className="ml-2 text-[var(--color-muted)]">{application.proposedTimeline || 'Not specified'}</span>
                      </div>
                      <div className="col-span-2 md:col-span-1">
                        <span className="font-medium text-[var(--color-primary)]">Contact Email</span>
                        <div className="mt-1 flex items-center gap-2">
                          <input
                            readOnly
                            value={application.contactInfo?.email || application.applicant?.email || otherUser?.email || ''}
                            className="w-full border border-gray-200 rounded px-2 py-1 text-sm bg-gray-50"
                          />
                          <a
                            href={`mailto:${application.contactInfo?.email || application.applicant?.email || otherUser?.email || ''}`}
                            className="text-sm text-blue-600 hover:underline"
                          >
                            Send Email
                          </a>
                        </div>
                      </div>
                      <div>
                        <span className="font-medium text-[var(--color-primary)]">Applied:</span>
                        <span className="ml-2 text-[var(--color-muted)]">{new Date(application.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      application.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      application.status === 'accepted' ? 'bg-[var(--color-accent)]/20 text-[var(--color-accent)]' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                    </span>
                    
                    {/* Management buttons for received applications */}
                    {filter === 'received' && application.status === 'pending' && (
                      <div className="flex flex-col gap-2">
                        <Link
                          to={`/applications/${application._id}`}
                          className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:opacity-80 transition-all text-center"
                        >
                          📋 Review Application
                        </Link>
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleUpdateStatus(application._id, 'accepted')}
                            className="px-2 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700 transition-colors flex-1"
                          >
                            ✅ Accept
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(application._id, 'rejected')}
                            className="px-2 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700 transition-colors flex-1"
                          >
                            ❌ Reject
                          </button>
                        </div>
                      </div>
                    )}

                    {filter === 'received' && application.status === 'rejected' && (
                      <div className="text-center">
                        <div className="text-red-600 font-bold text-xs">❌ Rejected</div>
                        <Link
                          to={`/applications/${application._id}`}
                          className="text-blue-600 hover:underline text-xs"
                        >
                          View Details
                        </Link>
                      </div>
                    )}

                    {/* Show application management for different statuses */}
                    {application.status === 'accepted' && !application.isCompleted && (
                      <div className="flex flex-col gap-2">
                        <Link
                          to={`/applications/${application._id}`}
                          className="px-3 py-1 bg-[var(--color-accent)] text-white rounded text-xs hover:opacity-80 transition-all text-center"
                        >
                          📋 View Application
                        </Link>
                        
                        {/* Show completion button based on who can complete */}
                        {(
                          (itemType === 'offer' && filter === 'sent') || // Applicant can complete offer applications
                          (itemType === 'request' && filter === 'received') // Request owner can complete request applications
                        ) && (
                          <button
                            onClick={() => navigate(`/applications/${application._id}`)}
                            className="px-3 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700 transition-colors"
                          >
                            ✅ Complete
                          </button>
                        )}
                      </div>
                    )}

                    {application.status === 'completed' && (
                      <div className="text-center">
                        <div className="text-green-600 font-bold text-xs">✅ Completed</div>
                        <Link
                          to={`/applications/${application._id}`}
                          className="text-blue-600 hover:underline text-xs"
                        >
                          View Details
                        </Link>
                      </div>
                    )}

                    {application.status === 'pending' && filter === 'sent' && (
                      <Link
                        to={`/applications/${application._id}`}
                        className="px-3 py-1 bg-gray-500 text-white rounded text-xs hover:opacity-80 transition-all"
                      >
                        � View Status
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          
          {applications.length === 0 && (
            <div className="text-center py-12 bg-white/50 rounded-xl backdrop-blur-sm">
              <div className="text-[var(--color-accent)] mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2 2v-5m16 0H4m16 0l-2-2m2 2l-2 2M4 13l2-2m-2 2l2 2" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-[var(--color-primary)] mb-2">
                {filter === 'received' ? 'No Applications Yet' : 'No Applications Sent'}
              </h3>
              <p className="text-[var(--color-muted)] mb-4">
                {filter === 'received' 
                  ? "You haven't received any applications for your offers or requests."
                  : "You haven't sent any applications to others' offers or requests yet."
                }
              </p>
              <Link 
                to={filter === 'received' ? "/profile" : "/findskills"} 
                className="bg-[var(--color-accent)] text-white px-6 py-2 rounded-lg hover:opacity-80 transition-all"
              >
                {filter === 'received' ? 'Create an Offer or Request' : 'Browse Skills'}
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyApplications;