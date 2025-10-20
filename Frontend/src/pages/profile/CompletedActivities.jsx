import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const CompletedActivities = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, offered, requested
  const { user: authUser } = useAuth();

  useEffect(() => {
    const fetchCompletedActivities = async () => {
      if (!authUser?._id) {
        setLoading(false);
        return;
      }

      try {
        const [offersRes, requestsRes] = await Promise.all([
          fetch(`http://localhost:5000/api/offers/user/${authUser._id}`),
          fetch(`http://localhost:5000/api/requests/user/${authUser._id}`)
        ]);

        const offersData = offersRes.ok ? await offersRes.json() : { offers: [] };
        const requestsData = requestsRes.ok ? await requestsRes.json() : { requests: [] };

        // Combine completed offers and requests
        const completedActivities = [
          ...offersData.offers.filter(offer => offer.status === 'completed').map(offer => ({
            id: offer._id,
            title: offer.title,
            type: 'offered',
            category: offer.category,
            date: new Date(offer.updatedAt || offer.createdAt).toLocaleDateString(),
            description: offer.description,
            originalData: offer
          })),
          ...requestsData.requests.filter(request => request.status === 'completed').map(request => ({
            id: request._id,
            title: request.title,
            type: 'requested',
            category: request.category,
            date: new Date(request.updatedAt || request.createdAt).toLocaleDateString(),
            description: request.description,
            originalData: request
          }))
        ].sort((a, b) => new Date(b.originalData.updatedAt || b.originalData.createdAt) - new Date(a.originalData.updatedAt || a.originalData.createdAt));

        setActivities(completedActivities);
      } catch (error) {
        console.error('Error fetching completed activities:', error);
        setActivities([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCompletedActivities();
  }, [authUser]);

  const filteredActivities = activities.filter(activity => {
    if (filter === 'all') return true;
    return activity.type === filter;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--color-background)] flex items-center justify-center">
        <div className="text-xl font-bold text-[var(--color-primary)]">Loading completed activities...</div>
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
              <span className="text-[var(--color-primary)] font-medium">Completed Activities</span>
            </div>
          </nav>
          
          {/* Main Header */}
          <div className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] text-white px-6 py-6 rounded-xl">
            <h1 className="text-3xl font-bold mb-2">
              Completed Activities
            </h1>
            <p className="text-white/90">Your successful skill exchanges and learning journey</p>
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
            All ({activities.length})
          </button>
          <button
            onClick={() => setFilter('offered')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'offered' 
                ? 'bg-[var(--color-accent)] text-white' 
                : 'bg-[var(--color-surface)] text-[var(--color-primary)] border border-[var(--color-border)]'
            }`}
          >
            You Offered ({activities.filter(a => a.type === 'offered').length})
          </button>
          <button
            onClick={() => setFilter('requested')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'requested' 
                ? 'bg-[var(--color-accent)] text-white' 
                : 'bg-[var(--color-surface)] text-[var(--color-primary)] border border-[var(--color-border)]'
            }`}
          >
            You Requested ({activities.filter(a => a.type === 'requested').length})
          </button>
        </div>

        {/* Activities Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredActivities.map(activity => (
            <div key={activity.id} className="bg-blue-50 rounded-xl p-6 border border-blue-200 shadow-sm hover:shadow-md transition-shadow">
              {/* Status Badge */}
              <div className="flex justify-between items-start mb-4">
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                  Completed
                </span>
                <span className="text-xs text-[var(--color-muted)]">{activity.date}</span>
              </div>

              {/* Activity Details */}
              <h3 className="text-xl font-bold text-[var(--color-primary)] mb-2">{activity.title}</h3>
              <p className="text-[var(--color-muted)] text-sm mb-4 line-clamp-3">{activity.description}</p>
              
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-[var(--color-accent)] font-medium">Category:</span>
                  <span className="bg-blue-100 px-2 py-1 rounded text-xs text-blue-800">{activity.category}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-[var(--color-accent)] font-medium">Availability:</span>
                  <span className="text-[var(--color-muted)]">{activity.originalData?.availability || 'Not specified'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-[var(--color-accent)] font-medium">Location:</span>
                  <span className="text-[var(--color-muted)]">{activity.originalData?.location || 'Not specified'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-[var(--color-accent)] font-medium">Type:</span>
                  <span className={`px-2 py-1 rounded text-xs ${
                    activity.type === 'offered' 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'bg-purple-100 text-purple-800'
                  }`}>
                    {activity.type === 'offered' ? 'You offered' : 'You requested'}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-[var(--color-accent)] font-medium">Payment:</span>
                  <span className={`px-2 py-1 rounded text-xs ${
                    activity.originalData?.isPaid ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                  }`}>
                    {activity.originalData?.isPaid ? `Paid - $${activity.originalData?.price || 'N/A'}` : 'Free'}
                  </span>
                </div>
              </div>

              {/* Completion Badge */}
              <div className="flex justify-center mb-3">
                <div className="px-3 py-1 rounded-full text-xs font-medium bg-green-500 text-white flex items-center gap-1">
                  <span>✅</span>
                  <span>Completed</span>
                </div>
              </div>

              {/* Stats */}
              <div className="flex justify-between items-center pt-4 border-t border-[var(--color-border)]">
                <span className="text-sm text-[var(--color-muted)]">
                  {activity.type === 'offered' ? 'Skill offering' : 'Learning request'}
                </span>
                <div className="flex gap-2">
                  <Link 
                    to={activity.type === 'offered' ? `/offer-details/${activity.id}` : `/request-details/${activity.id}`}
                    className="text-[var(--color-accent)] text-sm font-medium hover:underline"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredActivities.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-[var(--color-primary)] mb-2">
              No {filter === 'all' ? 'completed' : filter === 'offered' ? 'completed offers' : 'completed requests'} found
            </h3>
            <p className="text-[var(--color-muted)] mb-4">
              {filter === 'all' 
                ? "You haven't completed any skill exchanges yet." 
                : filter === 'offered'
                  ? "You haven't completed any of your offers yet."
                  : "You haven't completed any of your requests yet."}
            </p>
            <Link 
              to="/profile" 
              className="bg-[var(--color-accent)] text-white px-6 py-2 rounded-lg hover:opacity-90 transition-opacity"
            >
              {filter === 'all' ? 'Start Your First Exchange' : 'Go to Profile'}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default CompletedActivities;