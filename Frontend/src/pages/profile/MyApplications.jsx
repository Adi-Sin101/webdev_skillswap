import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';

const MyApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('received'); // received, sent
  const { user } = useAuth();

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
            <p className="text-white/90">Manage applications received for your offers and requests</p>
          </div>
        </div>

        {/* Applications List */}
        <div className="space-y-4">
          {applications.map(application => (
            <div key={application._id} className="bg-white rounded-xl p-6 border border-[var(--color-accent)]/20 shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-bold text-lg text-[var(--color-primary)]">{application.applicant.name}</h3>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      application.itemType === 'offer' 
                        ? 'bg-[var(--color-accent)]/20 text-[var(--color-accent)]' 
                        : 'bg-[var(--color-primary)]/20 text-[var(--color-primary)]'
                    }`}>
                      Applied to {application.itemType}
                    </span>
                  </div>
                  <p className="text-[var(--color-primary)]/80 mb-2 font-medium">{application.itemTitle}</p>
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
                          value={application.contactInfo?.email || application.applicant.email || ''}
                          className="w-full border border-gray-200 rounded px-2 py-1 text-sm bg-gray-50"
                        />
                        <a
                          href={`mailto:${application.contactInfo?.email || application.applicant.email || ''}`}
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
                  
                  {application.status === 'pending' && (
                    <div className="flex gap-2 items-center">
                      {/* Email exchange UI shown before accept/reject */}
                      <div className="text-xs text-[var(--color-muted)] mr-2">
                        Share your contact and confirm via email before accepting.
                      </div>
                      <button
                        onClick={() => handleEmailExchanged(application._id)}
                        className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 transition-colors"
                      >
                        Confirm Email
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(application._id, 'accepted')}
                        className="px-3 py-1 bg-[var(--color-accent)] text-white rounded text-xs hover:opacity-80 transition-all"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(application._id, 'rejected')}
                        className="px-3 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700 transition-colors"
                      >
                        Reject
                      </button>
                    </div>
                  )}

                  {application.status === 'accepted' && (
                    <div className="flex flex-col gap-2 text-xs">
                      {/* Step 1: Email Communication */}
                      {!application.emailExchanged ? (
                        <div className="flex flex-col items-end gap-2">
                          <div className="text-right text-[var(--color-muted)]">
                            📧 Contact via email: {application.contactInfo?.email || application.applicant.email}
                          </div>
                          <button
                            onClick={() => handleEmailExchanged(application._id)}
                            className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                          >
                            ✅ Confirm Email Exchange
                          </button>
                        </div>
                      ) : (
                        /* Step 2: Mark as Complete */
                        !application.isSwapCompleted ? (
                          <div className="flex flex-col items-end gap-2">
                            <div className="text-right text-green-600 font-medium">
                              ✅ Email exchanged
                            </div>
                            {!application.isOwnerCompleted && (
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleMarkComplete(application._id)}
                                  className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition-colors text-xs"
                                >
                                  🎉 Mark as Complete
                                </button>
                                <button
                                  onClick={async () => {
                                    try {
                                      const resp = await fetch(`http://localhost:5000/api/responses/${application._id}/undo-complete`, {
                                        method: 'PUT',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({ userId: user._id })
                                      });
                                      if (resp.ok) {
                                        const data = await resp.json();
                                        setApplications(prev => prev.map(app => app._id === application._id ? { ...app, ...data.response } : app));
                                        alert('Undo successful');
                                      } else {
                                        const err = await resp.json();
                                        alert(`Error: ${err.error || 'Unknown error'}`);
                                      }
                                    } catch (e) {
                                      console.error('Network error:', e);
                                      alert('Network error');
                                    }
                                  }}
                                  className="px-3 py-1 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors text-xs"
                                >
                                  ↩️ Undo Complete
                                </button>
                              </div>
                            )}
                            {!application.isOwnerCompleted && (
                              <button
                                onClick={() => handleMarkComplete(application._id)}
                                className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                              >
                                🎉 Mark as Complete
                              </button>
                            )}
                          </div>
                        ) : (
                          /* Step 3: Completed */
                          <div className="text-right">
                            <div className="text-green-600 font-bold">🎉 Skill Swap Completed!</div>
                            <div className="text-xs text-[var(--color-muted)]">
                              Completed on {new Date(application.swapCompletedAt).toLocaleDateString()}
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          
          {applications.length === 0 && (
            <div className="text-center py-12 bg-white/50 rounded-xl backdrop-blur-sm">
              <div className="text-[var(--color-accent)] mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2 2v-5m16 0H4m16 0l-2-2m2 2l-2 2M4 13l2-2m-2 2l2 2" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-[var(--color-primary)] mb-2">No Applications Yet</h3>
              <p className="text-[var(--color-muted)] mb-4">You haven't received any applications for your offers or requests.</p>
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

export default MyApplications;