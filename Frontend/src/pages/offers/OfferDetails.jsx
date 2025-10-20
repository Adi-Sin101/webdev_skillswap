import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Clock, Users, MapPin, Calendar, Star, DollarSign, Phone, Mail, MessageCircle, BookOpen, Target, CheckCircle, TrendingUp } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import ResponseModal from '../../components/ResponseModal';

const OfferDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [offer, setOffer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [responseCount, setResponseCount] = useState(0);
  const [hasApplied, setHasApplied] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const fetchOfferDetails = async () => {
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:5000/api/offers/${id}`);
        const data = await response.json();
        
        if (response.ok) {
          setOffer(data.offer);
          
          // Fetch response count
          try {
            const countResponse = await fetch(`http://localhost:5000/api/responses/offers/${id}/responses`);
            if (countResponse.ok) {
              const countData = await countResponse.json();
              setResponseCount(countData.count || 0);
              
              // Check if current user has already applied
              if (user?._id) {
                const userHasApplied = countData.responses?.some(response => 
                  response.applicant._id === user._id || response.applicant === user._id
                );
                setHasApplied(userHasApplied);
              }
            }
          } catch (countError) {
            console.warn('Failed to fetch response count:', countError);
          }
        } else {
          setError(data.error || 'Failed to fetch offer details');
        }
      } catch (err) {
        setError('Network error occurred');
        console.error('Error fetching offer details:', err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchOfferDetails();
    }
  }, [id, user]);

  const handleApplyToOffer = async (formData) => {
    if (!user?._id) {
      alert('Please log in to apply to this offer');
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/responses/offers/${id}/apply`, {
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
        alert('Application submitted successfully!');
        setHasApplied(true);
        setResponseCount(prev => prev + 1);
        setShowResponseModal(false);
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error('Error applying to offer:', error);
      alert('Network error. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--color-primary)] flex items-center justify-center">
        <div className="text-xl font-bold text-white">Loading offer details...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[var(--color-primary)] flex items-center justify-center">
        <div className="text-center">
          <div className="text-xl font-bold text-white mb-4">Error: {error}</div>
          <button 
            onClick={() => navigate('/')}
            className="bg-[var(--color-accent)] text-white px-6 py-2 rounded-lg hover:opacity-90"
          >
            Back to Skills
          </button>
        </div>
      </div>
    );
  }

  if (!offer) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-accent)]/20 flex items-center justify-center">
        <div className="text-xl font-bold text-white">Offer not found</div>
      </div>
    );
  }

  const getSkillLevelColor = (level) => {
    switch (level) {
      case 'Beginner': return 'bg-green-100 text-green-800';
      case 'Intermediate': return 'bg-blue-100 text-blue-800';
      case 'Advanced': return 'bg-orange-100 text-orange-800';
      case 'Expert': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getAvailabilityColor = (availability) => {
    switch (availability) {
      case 'Morning': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Afternoon': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Evening': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Weekends': return 'bg-green-100 text-green-800 border-green-200';
      case 'Flexible': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getAvailabilityIcon = (availability) => {
    switch (availability) {
      case 'Morning': return <Clock size={16} className="text-blue-600" />;
      case 'Afternoon': return <Clock size={16} className="text-yellow-600" />;
      case 'Evening': return <Clock size={16} className="text-purple-600" />;
      case 'Weekends': return <Calendar size={16} className="text-green-600" />;
      case 'Flexible': return <Clock size={16} className="text-gray-600" />;
      default: return <Clock size={16} className="text-gray-600" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-accent)]/20 py-8 px-6 md:px-12">
      <div className="max-w-4xl mx-auto">
        {/* Breadcrumb Navigation */}
        <nav className="mb-6">
          <div className="flex items-center space-x-2 text-sm">
            <Link 
              to="/" 
              className="text-white/70 hover:text-white transition-colors duration-200"
            >
              Find Skills
            </Link>
            <svg className="w-4 h-4 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-white font-medium">Offer Details</span>
          </div>
        </nav>        {/* Main Content */}
        <div className="bg-white rounded-xl shadow-xl overflow-hidden">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] p-8 text-white">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-4">
                  <img
                    src={offer.user?.avatar || `https://ui-avatars.com/api/?name=${offer.user?.name}&background=0D8ABC&color=fff`}
                    alt={offer.user?.name}
                    className="w-16 h-16 rounded-full border-2 border-white"
                  />
                  <div>
                    <h2 className="text-xl font-bold">{offer.user?.name}</h2>
                    <p className="text-white/80">{offer.user?.university}</p>
                  </div>
                </div>
                <h1 className="text-3xl font-bold mb-2">{offer.title}</h1>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-medium">
                    {offer.category}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getAvailabilityColor(offer.availability || 'Flexible')}`}>
                    {getAvailabilityIcon(offer.availability)} {offer.availability || 'Flexible'} Availability
                  </span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    offer.isPaid ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                  }`}>
                    {offer.isPaid ? 'Paid' : 'Free'} {offer.isPaid && offer.price && `- $${offer.price}`}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Details Section */}
          <div className="p-8">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Left Column */}
              <div className="space-y-6">
                {/* Description */}
                <div>
                  <h3 className="text-xl font-bold text-[var(--color-primary)] mb-3 flex items-center gap-2">
                    <BookOpen size={20} />
                    About This Offer
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    {offer.description || 'No description provided.'}
                  </p>
                </div>

                {/* Prerequisites */}
                {offer.prerequisites && (
                  <div>
                    <h3 className="text-xl font-bold text-[var(--color-primary)] mb-3 flex items-center gap-2">
                      <BookOpen size={20} />
                      Prerequisites
                    </h3>
                    <p className="text-gray-700">{offer.prerequisites}</p>
                  </div>
                )}

                {/* What You Will Learn */}
                {offer.whatYouWillLearn && offer.whatYouWillLearn.length > 0 && (
                  <div>
                    <h3 className="text-xl font-bold text-[var(--color-primary)] mb-3 flex items-center gap-2">
                      <Target size={20} />
                      What You Will Learn
                    </h3>
                    <ul className="space-y-2">
                      {offer.whatYouWillLearn.map((item, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <CheckCircle size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Tags */}
                {offer.tags && offer.tags.length > 0 && (
                  <div>
                    <h3 className="text-xl font-bold text-[var(--color-primary)] mb-3">
                      Tags
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {offer.tags.map((tag, index) => (
                        <span key={index} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                {/* Offer Details */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-bold text-[var(--color-primary)] mb-4">
                    Offer Details
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <TrendingUp size={18} className="text-gray-600" />
                      <div>
                        <span className="font-medium">Skill Level:</span> 
                        <span className={`ml-2 px-2 py-1 rounded text-xs ${getSkillLevelColor(offer.skillLevel)}`}>
                          {offer.skillLevel || 'Intermediate'}
                        </span>
                      </div>
                    </div>
                    
                    {offer.sessionDuration && (
                      <div className="flex items-center gap-3">
                        <Clock size={18} className="text-gray-600" />
                        <div>
                          <span className="font-medium">Session Duration:</span> {offer.sessionDuration}
                        </div>
                      </div>
                    )}

                    {offer.totalDuration && (
                      <div className="flex items-center gap-3">
                        <Calendar size={18} className="text-gray-600" />
                        <div>
                          <span className="font-medium">Total Duration:</span> {offer.totalDuration}
                        </div>
                      </div>
                    )}
                    
                    {offer.sessionType && (
                      <div className="flex items-center gap-3">
                        <Users size={18} className="text-gray-600" />
                        <div>
                          <span className="font-medium">Session Type:</span> {offer.sessionType}
                        </div>
                      </div>
                    )}

                    {offer.maxStudents && (
                      <div className="flex items-center gap-3">
                        <Users size={18} className="text-gray-600" />
                        <div>
                          <span className="font-medium">Max Students:</span> {offer.maxStudents}
                        </div>
                      </div>
                    )}

                    {offer.deliveryMethod && (
                      <div className="flex items-center gap-3">
                        <MapPin size={18} className="text-gray-600" />
                        <div>
                          <span className="font-medium">Delivery Method:</span> {offer.deliveryMethod}
                        </div>
                      </div>
                    )}

                    {offer.availability && (
                      <div className="flex items-center gap-3">
                        <Calendar size={18} className="text-gray-600" />
                        <div>
                          <span className="font-medium">Availability:</span> {offer.availability}
                        </div>
                      </div>
                    )}

                    {offer.preferredSchedule && (
                      <div className="flex items-center gap-3">
                        <Clock size={18} className="text-gray-600" />
                        <div>
                          <span className="font-medium">Preferred Schedule:</span> {offer.preferredSchedule}
                        </div>
                      </div>
                    )}

                    {offer.location && (
                      <div className="flex items-center gap-3">
                        <MapPin size={18} className="text-gray-600" />
                        <div>
                          <span className="font-medium">Location:</span> {offer.location}
                        </div>
                      </div>
                    )}

                    {offer.isPaid && offer.price && (
                      <div className="flex items-center gap-3">
                        <DollarSign size={18} className="text-gray-600" />
                        <div>
                          <span className="font-medium">Price:</span> ${offer.price}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Book This Session */}
                <div className="bg-gradient-to-br from-[var(--color-accent)] to-blue-600 rounded-lg p-6 text-white">
                  <h3 className="text-lg font-bold mb-4">
                    Book This Session
                  </h3>
                  
                  <div className="space-y-3 mb-4">
                    {offer.availability && (
                      <p className="text-sm opacity-90">
                        Available: {offer.availability}
                      </p>
                    )}
                    {offer.isPaid && offer.price && (
                      <p className="text-sm opacity-90">
                        Price: ${offer.price}
                      </p>
                    )}
                    {offer.maxStudents && (
                      <p className="text-sm opacity-90">
                        Spots available: {offer.maxStudents} students max
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    {user?._id && user._id !== offer.user?._id ? (
                      <button 
                        onClick={() => setShowResponseModal(true)}
                        disabled={hasApplied}
                        className={`w-full py-3 px-4 rounded-lg font-bold transition-colors flex items-center justify-center gap-2 ${
                          hasApplied 
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                            : 'bg-white text-[var(--color-accent)] hover:bg-gray-100'
                        }`}
                      >
                        <MessageCircle size={18} />
                        {hasApplied ? 'Applied' : 'Apply for This Offer'}
                      </button>
                    ) : user?._id === offer.user?._id ? (
                      <div className="text-center text-white/80 py-3">
                        This is your offer
                      </div>
                    ) : (
                      <button 
                        onClick={() => navigate('/auth')}
                        className="w-full bg-white text-[var(--color-accent)] py-3 px-4 rounded-lg font-bold hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
                      >
                        <MessageCircle size={18} />
                        Login to Apply
                      </button>
                    )}
                    
                    <div className="text-center text-white/80 text-sm">
                      {responseCount} {responseCount === 1 ? 'application' : 'applications'} received
                    </div>
                    
                    {offer.user?.email && user?._id !== offer.user?._id && (
                      <button className="w-full bg-white/20 text-white py-2 px-4 rounded-lg font-medium hover:bg-white/30 transition-colors flex items-center justify-center gap-2">
                        <Mail size={16} />
                        Contact via Email
                      </button>
                    )}
                  </div>
                </div>

                {/* Posted Date */}
                <div className="text-sm text-gray-500 text-center">
                  Posted on {new Date(offer.createdAt).toLocaleDateString()}
                  {offer.updatedAt !== offer.createdAt && (
                    <span> • Updated {new Date(offer.updatedAt).toLocaleDateString()}</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Response Modal */}
      <ResponseModal
        isOpen={showResponseModal}
        onClose={() => setShowResponseModal(false)}
        item={offer}
        type="offer"
        onSubmit={handleApplyToOffer}
      />
    </div>
  );
};

export default OfferDetails;