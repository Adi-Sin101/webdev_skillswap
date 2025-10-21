import React, { useState } from 'react';

const ResponseModal = ({ isOpen, onClose, item, type, onSubmit }) => {
  const [formData, setFormData] = useState({
    message: '',
    availability: '',
    proposedTimeline: '',
    contactInfo: {
      email: '',
      phone: '',
      preferredContact: 'email'
    }
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('contactInfo.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        contactInfo: {
          ...prev.contactInfo,
          [field]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    console.log('=== RESPONSE MODAL SUBMIT DEBUG ===');
    console.log('Form data:', formData);
    
    if (!formData.message.trim()) {
      alert('Please enter a message');
      return;
    }

    if (!formData.availability.trim()) {
      alert('Please specify your availability');
      return;
    }

    console.log('✅ Validation passed, calling onSubmit...');
    
    setLoading(true);
    try {
      await onSubmit(formData);
      console.log('✅ onSubmit completed without throwing error');
      // Only close and reset if successful
      onClose();
      setFormData({
        message: '',
        availability: '',
        proposedTimeline: '',
        contactInfo: {
          email: '',
          phone: '',
          preferredContact: 'email'
        }
      });
    } catch (error) {
      console.error('❌ Error in handleSubmit:', error);
      // Don't close modal on error, let user see the error and try again
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800">
              {type === 'offer' ? 'Apply for Offer' : 'Offer to Help'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ×
            </button>
          </div>

          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-800">{item?.title}</h3>
            <p className="text-sm text-gray-600">{item?.category}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Message *
              </label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder={type === 'offer' 
                  ? "Why are you interested in this offer? What's your experience level?"
                  : "How can you help with this request? What's your relevant experience?"
                }
                rows={4}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Your Availability *
              </label>
              <input
                type="text"
                name="availability"
                value={formData.availability}
                onChange={handleChange}
                placeholder="e.g., Weekends, Mon-Wed evenings, Flexible"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Proposed Timeline
              </label>
              <input
                type="text"
                name="proposedTimeline"
                value={formData.proposedTimeline}
                onChange={handleChange}
                placeholder="e.g., Can start this week, 2-3 weeks, Immediate"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contact Email
              </label>
              <input
                type="email"
                name="contactInfo.email"
                value={formData.contactInfo.email}
                onChange={handleChange}
                placeholder="your.email@example.com"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Submitting...' : (type === 'offer' ? 'Apply' : 'Offer Help')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResponseModal;