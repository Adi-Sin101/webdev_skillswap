import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from '../contexts/AuthContext';
import ResponseModal from './ResponseModal';


const ListingCard = ({ post }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showResponseModal, setShowResponseModal] = useState(false);

  const handleViewProfile = () => {
    if (post.posterId) {
      navigate(`/profile/${post.posterId}`);
    } else {
      console.warn("No user ID available for profile navigation");
    }
  };

  const handleQuickApply = async (formData) => {
    if (!user?._id) {
      alert('Please log in to apply');
      return;
    }

    const isOffer = post.type?.toLowerCase() === 'offer';
    const endpoint = isOffer 
      ? `http://localhost:5000/api/responses/offers/${post.id}/apply`
      : `http://localhost:5000/api/responses/requests/${post.id}/apply`;

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          applicant: user._id,
          ...formData
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert(isOffer ? 'Application submitted successfully!' : 'Offer to help submitted successfully!');
        setShowResponseModal(false);
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error('Error submitting application:', error);
      alert('Network error. Please try again.');
    }
  };

  const canApply = user?._id && user._id !== post.posterId;

  return (
  <div className="bg-white rounded-xl shadow-2xl flex flex-row overflow-hidden p-4 w-full mb-4 border border-[var(--color-border)]" style={{ boxShadow: '0 4px 24px 0 rgba(60,80,120,0.10)' }}>
      {/* Profile Left */}
  <div className="w-1/4 min-w-[100px] bg-[#29406b] p-4 flex flex-col items-center justify-center rounded-lg mr-4" style={{ background: 'linear-gradient(135deg, #29406b 80%, #3b5998 100%)' }}>
        <div className="w-14 h-14 rounded-full border-2 border-[var(--color-accent)] overflow-hidden mb-2">
          <img src={`https://ui-avatars.com/api/?name=${post.poster}&background=0D8ABC&color=fff`} alt="Profile" className="w-full h-full object-cover" />
        </div>
  <h2 className="text-base font-bold text-white mb-1">{post.poster}</h2>
  <p className="text-white text-center mb-1 text-xs">{post.university}</p>
        <div className="flex gap-1 flex-wrap">
          <span className="bg-blue-400/80 text-gray-900 px-2 py-0.5 rounded-lg text-xs font-semibold shadow">{post.category}</span>
        </div>
      </div>
      {/* Post Details Right */}
  <div className="flex-1 p-2 flex flex-col gap-2 justify-center bg-gray-100 rounded-lg border border-[var(--color-border)] shadow-lg" style={{ boxShadow: '0 2px 12px 0 rgba(60,80,120,0.12)' }}>
        <h3 className="text-base font-bold text-[var(--color-primary)] mb-1">{post.title}</h3>
        <div className="flex flex-wrap gap-2 mb-1">
          <span className="px-2 py-0.5 rounded-lg bg-orange-100 text-orange-800 text-xs font-semibold">{post.type}</span>
          {post.deadline && (
            <span className="px-2 py-0.5 rounded-lg bg-gray-100 text-gray-800 text-xs font-semibold">{post.deadline}</span>
          )}
          {post.availability && (
            <span className="px-2 py-0.5 rounded-lg bg-teal-100 text-teal-800 text-xs font-semibold">{post.availability}</span>
          )}
          <span className={`px-2 py-0.5 rounded-lg text-xs font-semibold ${post.free ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>{post.free ? "Free" : "Paid"}</span>
        </div>
        {/* Details of the work */}
        <div className="mb-2">
          <span className="block text-xs text-gray-600 font-semibold mb-1">Details:</span>
          <span className="block text-xs text-gray-700">{post.details || "No additional details provided."}</span>
        </div>
        <div className="flex gap-2 mt-2 flex-wrap">
          {canApply && (
            <button 
              onClick={() => setShowResponseModal(true)}
              className="px-4 py-1 rounded-lg font-bold shadow bg-[var(--color-accent)] text-[var(--color-surface)] hover:opacity-80 transition text-xs"
            >
              {post.type?.toLowerCase() === 'offer' ? 'Apply Now' : 'Offer Help'}
            </button>
          )}
          <button 
            onClick={() => navigate(`/${post.type.toLowerCase()}-details/${post.id}`)}
            className="px-4 py-1 rounded-lg font-bold shadow bg-[var(--color-primary)] text-white hover:opacity-80 transition text-xs"
          >
            View Details
          </button>
          <button 
            onClick={handleViewProfile}
            className="px-4 py-1 rounded-lg font-bold shadow border border-[var(--color-accent)] text-[var(--color-accent)] bg-[var(--color-surface)] hover:bg-[var(--color-accent)] hover:text-[var(--color-surface)] transition text-xs"
          >
            View Profile
          </button>
        </div>
      </div>
      
      {/* Response Modal */}
      <ResponseModal
        isOpen={showResponseModal}
        onClose={() => setShowResponseModal(false)}
        item={post}
        type={post.type?.toLowerCase()}
        onSubmit={handleQuickApply}
      />
    </div>
  );
};

export default ListingCard;