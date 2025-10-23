import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const AdminDashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Wait for auth to load
    if (authLoading) return;

    // Check if user is logged in
    if (!user) {
      navigate('/login');
      return;
    }

    // Check if user is admin
    if (user.role !== 'admin') {
      alert('Access denied. Admin privileges required.');
      navigate('/');
      return;
    }

    fetchStats();
  }, [user, authLoading, navigate]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        alert('No authentication token found. Please login again.');
        navigate('/login');
        return;
      }
      
      const response = await fetch('http://localhost:5000/api/admin/stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (response.ok) {
        setStats(data.stats);
      } else {
        console.error('Error fetching stats:', data.error);
        
        // If token is invalid, clear it and redirect to login
        if (response.status === 401) {
          alert('Your session has expired or is invalid. Please login again.');
          localStorage.removeItem('token');
          navigate('/login');
          return;
        }
        
        if (response.status === 403) {
          alert('Access denied. Admin privileges required.');
          navigate('/');
        }
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to connect to server. Please check if the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-accent)]/20 flex items-center justify-center">
        <div className="text-xl font-bold text-white">Loading dashboard...</div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-accent)]/20 flex items-center justify-center pt-20">
        <div className="text-center">
          <div className="text-xl font-bold text-white mb-4">Failed to load dashboard</div>
          <button 
            onClick={fetchStats}
            className="px-6 py-3 bg-white text-[var(--color-primary)] rounded-lg hover:bg-gray-100 transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const chartData = {
    labels: stats.userGrowth.map(item => item.month),
    datasets: [
      {
        label: 'New Users',
        data: stats.userGrowth.map(item => item.count),
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top'
      },
      title: {
        display: true,
        text: 'User Growth (Last 6 Months)'
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-accent)]/20 py-8 pt-24">
      <div className="max-w-7xl mx-auto px-6">
        <h1 className="text-3xl font-bold text-white mb-8">Admin Dashboard</h1>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Users */}
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Users</p>
                <p className="text-3xl font-bold text-[var(--color-primary)]">{stats.totalUsers}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-2">Active: {stats.activeUsers}</p>
          </div>

          {/* Total Posts */}
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Posts</p>
                <p className="text-3xl font-bold text-[var(--color-accent)]">{stats.totalPosts}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-2">Offers: {stats.totalOffers} | Requests: {stats.totalRequests}</p>
          </div>

          {/* Total Applications */}
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Applications</p>
                <p className="text-3xl font-bold text-purple-600">{stats.totalApplications}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-2">Accepted: {stats.acceptedApplications}</p>
          </div>

          {/* Completed Swaps */}
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Completed Swaps</p>
                <p className="text-3xl font-bold text-green-600">{stats.completedSwaps}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-2">Success rate: {stats.totalApplications > 0 ? ((stats.completedSwaps / stats.totalApplications) * 100).toFixed(1) : 0}%</p>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <h3 className="text-lg font-bold text-[var(--color-primary)] mb-4">Recent Activity (7 days)</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">New Users</span>
                <span className="font-bold text-[var(--color-primary)]">{stats.recentActivity.users}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">New Offers</span>
                <span className="font-bold text-[var(--color-accent)]">{stats.recentActivity.offers}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">New Requests</span>
                <span className="font-bold text-[var(--color-accent)]">{stats.recentActivity.requests}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg">
            <h3 className="text-lg font-bold text-[var(--color-primary)] mb-4">Moderation</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Banned Users</span>
                <span className="font-bold text-red-600">{stats.bannedUsers}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Hidden Posts</span>
                <span className="font-bold text-yellow-600">{stats.hiddenPosts}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg">
            <h3 className="text-lg font-bold text-[var(--color-primary)] mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <button
                onClick={() => navigate('/admin/users')}
                className="w-full px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg hover:opacity-80 transition text-sm"
              >
                Manage Users
              </button>
              <button
                onClick={() => navigate('/admin/posts')}
                className="w-full px-4 py-2 bg-[var(--color-accent)] text-white rounded-lg hover:opacity-80 transition text-sm"
              >
                Manage Posts
              </button>
              <button
                onClick={() => navigate('/admin/categories')}
                className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:opacity-80 transition text-sm"
              >
                Manage Categories
              </button>
              <button
                onClick={() => navigate('/admin/universities')}
                className="w-full px-4 py-2 bg-orange-600 text-white rounded-lg hover:opacity-80 transition text-sm"
              >
                Manage Universities
              </button>
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <Bar data={chartData} options={chartOptions} />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
