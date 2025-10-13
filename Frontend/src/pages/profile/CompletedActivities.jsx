import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const CompletedActivities = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, helped, learned

  useEffect(() => {
    // Mock data for completed activities
    const mockActivities = [
      {id: 101, title: "Python Tutoring", student: "Amit Singh", status: "Completed", type: "helped", date: "2 days ago", description: "Helped with Python basics and data structures"},
      {id: 102, title: "React Help", student: "Priya Sharma", status: "Completed", type: "received", date: "1 week ago", description: "Learned React hooks and state management"},
      {id: 103, title: "JavaScript Debugging", student: "Rohit Kumar", status: "Completed", type: "helped", date: "3 days ago", description: "Assisted with debugging and best practices"},
      {id: 104, title: "UI/UX Design", student: "Sarah Wilson", status: "Completed", type: "received", date: "2 weeks ago", description: "Learned design principles and Figma usage"},
      {id: 105, title: "Database Design", student: "Mike Johnson", status: "Completed", type: "helped", date: "1 week ago", description: "Helped with MongoDB schema design"},
    ];

    setActivities(mockActivities);
    setLoading(false);
  }, []);

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
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-4 rounded-lg flex-1 mr-4">
            <h1 className="text-3xl font-bold mb-2">
              Completed Activities
            </h1>
            <p className="text-green-100">Your successful skill exchanges and learning journey</p>
          </div>
          <Link 
            to="/profile" 
            className="bg-white text-green-600 px-4 py-2 rounded-lg border border-green-200 hover:bg-green-50 transition-colors font-medium"
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
            All ({activities.length})
          </button>
          <button
            onClick={() => setFilter('helped')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'helped' 
                ? 'bg-[var(--color-accent)] text-white' 
                : 'bg-[var(--color-surface)] text-[var(--color-primary)] border border-[var(--color-border)]'
            }`}
          >
            You Helped ({activities.filter(a => a.type === 'helped').length})
          </button>
          <button
            onClick={() => setFilter('received')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'received' 
                ? 'bg-[var(--color-accent)] text-white' 
                : 'bg-[var(--color-surface)] text-[var(--color-primary)] border border-[var(--color-border)]'
            }`}
          >
            You Learned ({activities.filter(a => a.type === 'received').length})
          </button>
        </div>

        {/* Activities Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredActivities.map(activity => (
            <div key={activity.id} className="bg-[var(--color-surface)] rounded-xl p-6 border border-[var(--color-border)] shadow-sm hover:shadow-md transition-shadow">
              {/* Status and Type */}
              <div className="flex justify-between items-start mb-4">
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                  Completed
                </span>
                <span className="text-xs text-[var(--color-muted)]">{activity.date}</span>
              </div>

              {/* Activity Details */}
              <h3 className="text-xl font-bold text-[var(--color-primary)] mb-2">{activity.title}</h3>
              <p className="text-[var(--color-muted)] text-sm mb-4 line-clamp-3">{activity.description}</p>
              
              <div className="space-y-3 mb-4">
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-[var(--color-accent)] font-medium">Partner:</span>
                  <span className="text-[var(--color-muted)]">{activity.student}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-[var(--color-accent)] font-medium">Role:</span>
                  <span className={`px-2 py-1 rounded text-xs ${
                    activity.type === 'helped' 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'bg-purple-100 text-purple-800'
                  }`}>
                    {activity.type === 'helped' ? 'You helped' : 'You learned'}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-between items-center pt-4 border-t border-[var(--color-border)]">
                <span className="text-sm text-[var(--color-muted)]">
                  {activity.type === 'helped' ? 'Teaching session' : 'Learning session'}
                </span>
                <div className="flex gap-2">
                  <button className="text-[var(--color-accent)] text-sm font-medium hover:underline">
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredActivities.length === 0 && (
          <div className="text-center py-12">
            <h3 className="text-xl font-bold text-[var(--color-primary)] mb-2">
              No {filter === 'all' ? '' : filter === 'helped' ? 'teaching' : 'learning'} activities found
            </h3>
            <p className="text-[var(--color-muted)] mb-4">
              {filter === 'all' 
                ? "You haven't completed any skill exchanges yet." 
                : filter === 'helped'
                  ? "You haven't helped anyone yet."
                  : "You haven't learned any new skills yet."}
            </p>
            <Link 
              to="/profile" 
              className="bg-[var(--color-accent)] text-white px-6 py-2 rounded-lg hover:opacity-90 transition-opacity"
            >
              Start Your First Exchange
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default CompletedActivities;