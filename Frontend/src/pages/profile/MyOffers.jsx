import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import StatusModal from '../../components/StatusModal';

const MyOffers = () => {
  const [offers, setOffers] = useState([]);
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
    const fetchOffers = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/offers');
        const data = await response.json();
        
        // Use actual status from database, add display properties
        const offers = data.offers || [];
        let offersWithDisplayData = offers.map(offer => ({
          ...offer,
          responses: 0, // Will be updated with real counts
          dateCreated: new Date(offer.createdAt || Date.now()).toLocaleDateString()
        }));
        
        // Fetch real response counts
        if (offers.length > 0) {
          try {
            const offerIDs = offers.map(offer => offer._id || offer.id);
            const countsResponse = await fetch('http://localhost:5000/api/responses/offers/response-counts', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ offerIDs })
            });
            
            if (countsResponse.ok) {
              const { responseCounts } = await countsResponse.json();
              offersWithDisplayData = offersWithDisplayData.map(offer => ({
                ...offer,
                responses: responseCounts[offer._id || offer.id] || 0
              }));
            }
          } catch (countError) {
            console.warn('Failed to fetch response counts:', countError);
          }
        }
        
        setOffers(offersWithDisplayData);
      } catch (error) {
        console.error('Error fetching offers:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOffers();
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

  const handleDeleteOffer = async (offerId) => {
    showModal(
      'confirm',
      'Are you sure you want to delete this offer? This action cannot be undone.',
      true,
      async () => {
        closeModal();
        try {
          const response = await fetch(`http://localhost:5000/api/offers/${offerId}`, {
            method: 'DELETE',
          });

          if (response.ok) {
            setOffers(prev => prev.filter(offer => (offer.id || offer._id) !== offerId));
            showModal('success', 'Offer deleted successfully!');
          } else {
            const data = await response.json();
            showModal('error', `Error: ${data.error || 'Failed to delete offer'}`);
          }
        } catch (error) {
          console.error('Error deleting offer:', error);
          showModal('error', 'Network error. Please try again.');
        }
      }
    );
  };

  const handleStatusUpdate = async (offerId, newStatus) => {
    try {
      const response = await fetch(`http://localhost:5000/api/offers/${offerId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        const data = await response.json();
        setOffers(prev => prev.map(offer => 
          (offer.id || offer._id) === offerId 
            ? { ...offer, status: newStatus }
            : offer
        ));
        showModal('success', `Offer marked as ${newStatus}!`);
      } else {
        const data = await response.json();
        showModal('error', `Error: ${data.error || 'Failed to update status'}`);
      }
    } catch (error) {
      console.error('Error updating status:', error);
      showModal('error', 'Network error. Please try again.');
    }
  };

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
              <span className="text-[var(--color-primary)] font-medium">My Offers</span>
            </div>
          </nav>
          
          {/* Main Header */}
          <div className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] text-white px-6 py-6 rounded-xl">
            <h1 className="text-3xl font-bold mb-2">
              My Skill Offers
            </h1>
            <p className="text-white/90">Manage all your skill offerings and track their status</p>
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
            <div key={offer.id || offer._id} className="bg-blue-50 rounded-xl p-6 border border-blue-200 shadow-sm hover:shadow-md transition-shadow">
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
                  <span className="bg-blue-100 px-2 py-1 rounded text-xs text-blue-800">{offer.category}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-[var(--color-accent)] font-medium">Skill Level:</span>
                  <span className={`px-2 py-1 rounded text-xs ${
                    offer.skillLevel === 'Beginner' ? 'bg-green-100 text-green-800' :
                    offer.skillLevel === 'Intermediate' ? 'bg-blue-100 text-blue-800' :
                    offer.skillLevel === 'Advanced' ? 'bg-orange-100 text-orange-800' :
                    'bg-purple-100 text-purple-800'
                  }`}>
                    {offer.skillLevel || 'Intermediate'}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-[var(--color-accent)] font-medium">Availability:</span>
                  <span className="text-[var(--color-muted)]">{offer.availability || 'Not specified'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-[var(--color-accent)] font-medium">Location:</span>
                  <span className="text-[var(--color-muted)]">{offer.location || 'Not specified'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-[var(--color-accent)] font-medium">Payment:</span>
                  <span className={`px-2 py-1 rounded text-xs ${
                    offer.isPaid ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                  }`}>
                    {offer.isPaid ? `Paid - $${offer.price || 'N/A'}` : 'Free'}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-[var(--color-accent)] font-medium">Max Students:</span>
                  <span className="text-[var(--color-muted)]">{offer.maxStudents || 1}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-[var(--color-accent)] font-medium">Delivery:</span>
                  <span className="text-[var(--color-muted)]">{offer.deliveryMethod || 'Both'}</span>
                </div>
              </div>

              {/* Status Toggle Button */}
              <div className="flex justify-center mb-3">
                <button
                  onClick={() => handleStatusUpdate(
                    offer.id || offer._id, 
                    offer.status === 'pending' ? 'completed' : 'pending'
                  )}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 flex items-center gap-1 ${
                    offer.status === 'completed'
                      ? 'bg-green-500 text-white hover:bg-green-600'
                      : 'bg-yellow-500 text-white hover:bg-yellow-600'
                  }`}
                >
                  <span>{offer.status === 'completed' ? '✅' : '⏳'}</span>
                  <span>{offer.status === 'completed' ? 'Completed' : 'Pending'}</span>
                </button>
              </div>

              {/* Stats */}
              <div className="flex justify-between items-center pt-4 border-t border-[var(--color-border)]">
                <span className="text-sm text-[var(--color-muted)]">
                  {offer.responses} responses
                </span>
                <div className="flex gap-2">
                  <Link 
                    to="/profile" 
                    state={{ editOffer: offer.id || offer._id }} 
                    className="text-[var(--color-accent)] text-sm font-medium hover:underline"
                  >
                    Edit
                  </Link>
                  <button 
                    onClick={() => handleDeleteOffer(offer.id || offer._id)}
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

export default MyOffers;