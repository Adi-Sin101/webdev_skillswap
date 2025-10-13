import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const MyOffers = () => {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, pending, completed

  useEffect(() => {
    const fetchOffers = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/offers');
        const data = await response.json();
        
        // Add status to offers (for demo purposes, randomly assign)
        const offersWithStatus = data.offers?.map(offer => ({
          ...offer,
          status: Math.random() > 0.5 ? 'completed' : 'pending',
          responses: Math.floor(Math.random() * 5),
          dateCreated: new Date(offer.createdAt || Date.now()).toLocaleDateString()
        })) || [];
        
        setOffers(offersWithStatus);
      } catch (error) {
        console.error('Error fetching offers:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOffers();
  }, []);

  const filteredOffers = offers.filter(offer => {
    if (filter === 'all') return true;
    return offer.status === filter;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--color-background)] flex items-center justify-center">
        <div className="text-xl font-bold text-[var(--color-primary)]">Loading your offers...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-background)] py-8 pt-24">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white px-6 py-4 rounded-lg flex-1 mr-4">
            <h1 className="text-3xl font-bold mb-2">
              My Skill Offers
            </h1>
            <p className="text-blue-100">Manage all your skill offerings and track their status</p>
          </div>
          <Link 
            to="/profile" 
            className="bg-white text-blue-600 px-4 py-2 rounded-lg border border-blue-200 hover:bg-blue-50 transition-colors font-medium"
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
            All ({offers.length})
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'pending' 
                ? 'bg-[var(--color-accent)] text-white' 
                : 'bg-[var(--color-surface)] text-[var(--color-primary)] border border-[var(--color-border)]'
            }`}
          >
            Pending ({offers.filter(o => o.status === 'pending').length})
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'completed' 
                ? 'bg-[var(--color-accent)] text-white' 
                : 'bg-[var(--color-surface)] text-[var(--color-primary)] border border-[var(--color-border)]'
            }`}
          >
            Completed ({offers.filter(o => o.status === 'completed').length})
          </button>
        </div>

        {/* Offers Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredOffers.map(offer => (
            <div key={offer.id || offer._id} className="bg-[var(--color-surface)] rounded-xl p-6 border border-[var(--color-border)] shadow-sm hover:shadow-md transition-shadow">
              {/* Status Badge */}
              <div className="flex justify-between items-start mb-4">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  offer.status === 'completed' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {offer.status === 'completed' ? 'Completed' : 'Pending'}
                </span>
                <span className="text-xs text-[var(--color-muted)]">{offer.dateCreated}</span>
              </div>

              {/* Offer Details */}
              <h3 className="text-xl font-bold text-[var(--color-primary)] mb-2">{offer.title}</h3>
              <p className="text-[var(--color-muted)] text-sm mb-4 line-clamp-3">{offer.description}</p>
              
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-[var(--color-accent)] font-medium">Category:</span>
                  <span className="bg-[var(--color-background)] px-2 py-1 rounded text-xs">{offer.category}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-[var(--color-accent)] font-medium">Availability:</span>
                  <span className="text-[var(--color-muted)]">{offer.availability}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-[var(--color-accent)] font-medium">Location:</span>
                  <span className="text-[var(--color-muted)]">{offer.location}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-[var(--color-accent)] font-medium">Type:</span>
                  <span className={`px-2 py-1 rounded text-xs ${
                    offer.type === 'Free' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {offer.type}
                  </span>
                </div>
              </div>

              {/* Stats */}
              <div className="flex justify-between items-center pt-4 border-t border-[var(--color-border)]">
                <span className="text-sm text-[var(--color-muted)]">
                  {offer.responses} responses
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
        {filteredOffers.length === 0 && (
          <div className="text-center py-12">
            <h3 className="text-xl font-bold text-[var(--color-primary)] mb-2">
              No {filter === 'all' ? '' : filter} offers found
            </h3>
            <p className="text-[var(--color-muted)] mb-4">
              {filter === 'all' 
                ? "You haven't created any offers yet." 
                : `You don't have any ${filter} offers.`}
            </p>
            <Link 
              to="/profile" 
              className="bg-[var(--color-accent)] text-white px-6 py-2 rounded-lg hover:opacity-90 transition-opacity"
            >
              Create Your First Offer
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyOffers;