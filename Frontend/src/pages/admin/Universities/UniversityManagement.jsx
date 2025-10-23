import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const UniversityManagement = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [universities, setUniversities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUniversity, setEditingUniversity] = useState(null);
  const [formData, setFormData] = useState({ name: '', location: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    
    if (!user) {
      navigate('/login');
      return;
    }

    if (user.role !== 'admin') {
      navigate('/');
      return;
    }

    fetchUniversities();
  }, [user, authLoading, navigate]);

  const fetchUniversities = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch('http://localhost:5000/api/admin/universities', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (response.ok) {
        setUniversities(data.universities);
      } else {
        console.error('Error fetching universities:', data.error);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.location.trim()) {
      alert('University name and location are required');
      return;
    }

    setSubmitting(true);

    try {
      const token = localStorage.getItem('token');
      const url = editingUniversity
        ? `http://localhost:5000/api/admin/universities/${editingUniversity._id}`
        : 'http://localhost:5000/api/admin/universities';
      
      const method = editingUniversity ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        alert(editingUniversity ? 'University updated successfully' : 'University created successfully');
        setShowAddModal(false);
        setEditingUniversity(null);
        setFormData({ name: '', location: '' });
        fetchUniversities();
      } else {
        alert('Error: ' + data.error);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Network error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (universityId) => {
    if (!window.confirm('Are you sure you want to delete this university? This action cannot be undone.')) return;

    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`http://localhost:5000/api/admin/universities/${universityId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (response.ok) {
        alert('University deleted successfully');
        fetchUniversities();
      } else {
        alert('Error: ' + data.error);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Network error');
    }
  };

  const openEditModal = (university) => {
    setEditingUniversity(university);
    setFormData({ name: university.name, location: university.location || '' });
    setShowAddModal(true);
  };

  const closeModal = () => {
    setShowAddModal(false);
    setEditingUniversity(null);
    setFormData({ name: '', location: '' });
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-accent)]/20 flex items-center justify-center">
        <div className="text-xl font-bold text-white">Loading universities...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-accent)]/20 py-8 pt-24">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <Link to="/admin" className="text-white/80 hover:text-white text-sm mb-2 inline-block">
              ← Back to Dashboard
            </Link>
            <h1 className="text-3xl font-bold text-white">University Management</h1>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-6 py-3 bg-[var(--color-accent)] text-white rounded-lg hover:bg-[var(--color-accent)]/90 transition font-medium"
          >
            + Add University
          </button>
        </div>

        {/* Universities Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {universities.map(university => (
            <div key={university._id} className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition">
              <h3 className="text-xl font-bold text-[var(--color-primary)] mb-2">{university.name}</h3>
              <p className="text-gray-600 text-sm mb-4 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {university.location || 'Location not provided'}
              </p>
              
              <div className="flex gap-2">
                <button
                  onClick={() => openEditModal(university)}
                  className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition text-sm"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(university._id)}
                  className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition text-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        {universities.length === 0 && (
          <div className="bg-white rounded-xl p-12 text-center shadow-lg">
            <p className="text-gray-500 mb-4">No universities found</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-6 py-3 bg-[var(--color-accent)] text-white rounded-lg hover:bg-[var(--color-accent)]/90 transition font-medium"
            >
              Add Your First University
            </button>
          </div>
        )}

        {/* Add/Edit Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full">
              <h2 className="text-2xl font-bold text-[var(--color-primary)] mb-6">
                {editingUniversity ? 'Edit University' : 'Add New University'}
              </h2>
              
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    University Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                    placeholder="e.g. University of Toronto"
                    required
                  />
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location *
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                    placeholder="e.g. Toronto, Ontario, Canada"
                    required
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 px-6 py-3 bg-[var(--color-accent)] text-white rounded-lg hover:bg-[var(--color-accent)]/90 transition font-medium disabled:opacity-50"
                  >
                    {submitting ? 'Saving...' : (editingUniversity ? 'Update' : 'Create')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UniversityManagement;
