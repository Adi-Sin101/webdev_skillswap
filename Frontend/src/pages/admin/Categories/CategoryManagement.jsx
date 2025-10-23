import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const CategoryManagement = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '' });
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

    fetchCategories();
  }, [user, authLoading, navigate]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch('http://localhost:5000/api/admin/categories', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (response.ok) {
        setCategories(data.categories);
      } else {
        console.error('Error fetching categories:', data.error);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      alert('Category name is required');
      return;
    }

    setSubmitting(true);

    try {
      const token = localStorage.getItem('token');
      const url = editingCategory
        ? `http://localhost:5000/api/admin/categories/${editingCategory._id}`
        : 'http://localhost:5000/api/admin/categories';
      
      const method = editingCategory ? 'PUT' : 'POST';

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
        alert(editingCategory ? 'Category updated successfully' : 'Category created successfully');
        setShowAddModal(false);
        setEditingCategory(null);
        setFormData({ name: '', description: '' });
        fetchCategories();
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

  const handleDelete = async (categoryId) => {
    if (!window.confirm('Are you sure you want to delete this category? This action cannot be undone.')) return;

    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`http://localhost:5000/api/admin/categories/${categoryId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (response.ok) {
        alert('Category deleted successfully');
        fetchCategories();
      } else {
        alert('Error: ' + data.error);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Network error');
    }
  };

  const openEditModal = (category) => {
    setEditingCategory(category);
    setFormData({ name: category.name, description: category.description || '' });
    setShowAddModal(true);
  };

  const closeModal = () => {
    setShowAddModal(false);
    setEditingCategory(null);
    setFormData({ name: '', description: '' });
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-accent)]/20 flex items-center justify-center">
        <div className="text-xl font-bold text-white">Loading categories...</div>
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
            <h1 className="text-3xl font-bold text-white">Category Management</h1>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-6 py-3 bg-[var(--color-accent)] text-white rounded-lg hover:bg-[var(--color-accent)]/90 transition font-medium"
          >
            + Add Category
          </button>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map(category => (
            <div key={category._id} className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition">
              <h3 className="text-xl font-bold text-[var(--color-primary)] mb-2">{category.name}</h3>
              <p className="text-gray-600 text-sm mb-4 min-h-[60px]">
                {category.description || 'No description provided'}
              </p>
              
              <div className="flex gap-2">
                <button
                  onClick={() => openEditModal(category)}
                  className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition text-sm"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(category._id)}
                  className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition text-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        {categories.length === 0 && (
          <div className="bg-white rounded-xl p-12 text-center shadow-lg">
            <p className="text-gray-500 mb-4">No categories found</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-6 py-3 bg-[var(--color-accent)] text-white rounded-lg hover:bg-[var(--color-accent)]/90 transition font-medium"
            >
              Add Your First Category
            </button>
          </div>
        )}

        {/* Add/Edit Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full">
              <h2 className="text-2xl font-bold text-[var(--color-primary)] mb-6">
                {editingCategory ? 'Edit Category' : 'Add New Category'}
              </h2>
              
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                    placeholder="e.g. Programming, Design, Music"
                    required
                  />
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] h-24 resize-none"
                    placeholder="Brief description of this category..."
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
                    {submitting ? 'Saving...' : (editingCategory ? 'Update' : 'Create')}
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

export default CategoryManagement;
