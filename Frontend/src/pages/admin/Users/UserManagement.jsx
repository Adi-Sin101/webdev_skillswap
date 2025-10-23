import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const UserManagement = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [bannedFilter, setBannedFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [actionLoading, setActionLoading] = useState({});

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

    fetchUsers();
  }, [user, authLoading, navigate, currentPage, search, roleFilter, bannedFilter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const queryParams = new URLSearchParams({
        page: currentPage,
        search,
        ...(roleFilter && { role: roleFilter }),
        ...(bannedFilter !== '' && { isBanned: bannedFilter })
      });

      const response = await fetch(`http://localhost:5000/api/admin/users?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (response.ok) {
        setUsers(data.users);
        setTotalPages(data.totalPages);
      } else {
        console.error('Error fetching users:', data.error);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBanUser = async (userId, reason = '') => {
    if (!window.confirm('Are you sure you want to ban this user?')) return;

    setActionLoading(prev => ({ ...prev, [userId]: true }));

    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`http://localhost:5000/api/admin/users/${userId}/ban`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reason: reason || 'Violation of platform policies' })
      });

      const data = await response.json();

      if (response.ok) {
        alert('User banned successfully');
        fetchUsers();
      } else {
        alert('Error: ' + data.error);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Network error');
    } finally {
      setActionLoading(prev => ({ ...prev, [userId]: false }));
    }
  };

  const handleUnbanUser = async (userId) => {
    if (!window.confirm('Are you sure you want to unban this user?')) return;

    setActionLoading(prev => ({ ...prev, [userId]: true }));

    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`http://localhost:5000/api/admin/users/${userId}/unban`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (response.ok) {
        alert('User unbanned successfully');
        fetchUsers();
      } else {
        alert('Error: ' + data.error);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Network error');
    } finally {
      setActionLoading(prev => ({ ...prev, [userId]: false }));
    }
  };

  if (authLoading || (loading && users.length === 0)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-accent)]/20 flex items-center justify-center">
        <div className="text-xl font-bold text-white">Loading users...</div>
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
            <h1 className="text-3xl font-bold text-white">User Management</h1>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl p-6 shadow-lg mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
            />
            
            <select
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
            >
              <option value="">All Roles</option>
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>

            <select
              value={bannedFilter}
              onChange={(e) => {
                setBannedFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
            >
              <option value="">All Status</option>
              <option value="false">Active</option>
              <option value="true">Banned</option>
            </select>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">University</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map(u => (
                  <tr key={u._id} className={u.isBanned ? 'bg-red-50' : ''}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <img
                          src={u.profilePicture || u.avatar || "https://randomuser.me/api/portraits/men/1.jpg"}
                          alt={u.name}
                          className="w-10 h-10 rounded-full mr-3"
                        />
                        <div>
                          <div className="text-sm font-medium text-gray-900">{u.name}</div>
                          <div className="text-sm text-gray-500">{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {u.university || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        u.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {u.isBanned ? (
                        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                          Banned
                        </span>
                      ) : (
                        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          Active
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2">
                        <Link
                          to={`/profile/${u._id}`}
                          className="text-[var(--color-accent)] hover:underline"
                        >
                          View
                        </Link>
                        {u.role !== 'admin' && (
                          <>
                            {u.isBanned ? (
                              <button
                                onClick={() => handleUnbanUser(u._id)}
                                disabled={actionLoading[u._id]}
                                className="text-green-600 hover:underline disabled:opacity-50"
                              >
                                {actionLoading[u._id] ? 'Loading...' : 'Unban'}
                              </button>
                            ) : (
                              <button
                                onClick={() => handleBanUser(u._id)}
                                disabled={actionLoading[u._id]}
                                className="text-red-600 hover:underline disabled:opacity-50"
                              >
                                {actionLoading[u._id] ? 'Loading...' : 'Ban'}
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t border-gray-200">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              <span className="text-sm text-gray-700">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserManagement;
