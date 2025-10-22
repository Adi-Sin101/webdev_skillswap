import React, { useState, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import ImageUploadModal from './ImageUploadModal';

const ProfilePictureUpload = ({ user, onProfilePictureUpdate }) => {
  const [uploading, setUploading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const { user: currentUser } = useAuth();

  const uploadFile = async (file) => {
    setUploading(true);
    setShowModal(false);
    
    try {
      const formData = new FormData();
      formData.append('profilePicture', file);

      const response = await fetch(`http://localhost:5000/api/users/${user._id}/profile-picture`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        onProfilePictureUpdate(data.user);
        alert('Profile picture updated successfully!');
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.error || 'Failed to upload image'}`);
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Network error. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleDeletePicture = async () => {
    if (!user.profilePicture && !user.avatar) {
      alert('No profile picture to delete');
      return;
    }

    if (!confirm('Are you sure you want to delete your profile picture?')) {
      return;
    }

    setUploading(true);
    
    try {
      const response = await fetch(`http://localhost:5000/api/users/${user._id}/profile-picture`, {
        method: 'DELETE',
      });

      if (response.ok) {
        const data = await response.json();
        onProfilePictureUpdate(data.user);
        alert('Profile picture deleted successfully!');
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.error || 'Failed to delete image'}`);
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('Network error. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const currentProfilePicture = user.profilePicture || user.avatar || "https://randomuser.me/api/portraits/men/1.jpg";

  return (
    <div className="relative group">
      {/* Profile Picture Display */}
      <div className="w-28 h-28 rounded-full border-4 border-[var(--color-accent)] overflow-hidden relative">
        <img 
          src={currentProfilePicture} 
          alt="Profile" 
          className="w-full h-full object-cover" 
        />
        
        {/* Overlay for upload area - only show for profile owner */}
        {currentUser && currentUser._id === user._id && (
          <div 
            className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
            onClick={() => setShowModal(true)}
          >
            {uploading ? (
              <div className="text-white text-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mx-auto mb-1"></div>
                <div className="text-xs">Uploading...</div>
              </div>
            ) : (
              <div className="text-white text-center">
                <svg className="w-6 h-6 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <div className="text-xs">Change</div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Profile picture management buttons - only show for profile owner */}
      {currentUser && currentUser._id === user._id && (
        <div className="absolute -bottom-2 -right-2 flex gap-1">
          <button
            onClick={() => setShowModal(true)}
            disabled={uploading}
            className="bg-[var(--color-accent)] text-white p-2 rounded-full shadow-lg hover:opacity-80 transition-all disabled:opacity-50"
            title="Upload new picture"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </button>
          
          {(user.profilePicture || user.avatar) && (
            <button
              onClick={handleDeletePicture}
              disabled={uploading}
              className="bg-red-500 text-white p-2 rounded-full shadow-lg hover:opacity-80 transition-all disabled:opacity-50"
              title="Delete picture"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}
        </div>
      )}

      {/* Upload Modal */}
      <ImageUploadModal 
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onUpload={uploadFile}
        uploading={uploading}
      />
    </div>
  );
};

export default ProfilePictureUpload;