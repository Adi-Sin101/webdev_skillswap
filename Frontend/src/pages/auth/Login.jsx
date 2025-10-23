import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Get the redirect path if user was redirected here
  const from = location.state?.from?.pathname || '/';

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await login(formData.email, formData.password);
    
    if (result.success) {
      navigate(from, { replace: true }); // Redirect to intended page or home
    } else {
      // Handle banned user with custom modal/alert
      if (result.isBanned) {
        alert(`Account Banned!\n\n${result.message}\n\nBanned on: ${new Date(result.bannedAt).toLocaleDateString()}\n\nContact support if you believe this is an error.`);
      }
      setError(result.error);
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--color-primary)] via-[var(--color-primary)] to-[var(--color-accent)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-2">SkillSwap</h1>
          <h2 className="text-2xl font-semibold text-white mb-2">Welcome Back</h2>
          <p className="text-white/80">Sign in to your account to continue</p>
        </div>

        {/* Login Form */}
        <div className="bg-[var(--color-surface)] rounded-2xl shadow-xl p-8 border border-[var(--color-border)]">
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-lg">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[var(--color-primary)] mb-2">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-[var(--color-border)] rounded-lg focus:ring-2 focus:ring-[var(--color-accent)] focus:border-[var(--color-accent)] bg-white text-[var(--color-primary)] placeholder-[var(--color-muted)] transition-all duration-200"
                placeholder="Enter your email"
              />
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-[var(--color-primary)] mb-2">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-[var(--color-border)] rounded-lg focus:ring-2 focus:ring-[var(--color-accent)] focus:border-[var(--color-accent)] bg-white text-[var(--color-primary)] placeholder-[var(--color-muted)] transition-all duration-200"
                placeholder="Enter your password"
              />
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-[var(--color-accent)] focus:ring-[var(--color-accent)] border-[var(--color-border)] rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-[var(--color-muted)]">
                  Remember me
                </label>
              </div>
              <div className="text-sm">
                <a href="#" className="text-[var(--color-accent)] hover:text-[var(--color-primary)] font-medium transition-colors duration-200">
                  Forgot password?
                </a>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[var(--color-accent)] text-[var(--color-surface)] font-semibold py-3 px-4 rounded-lg hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:ring-offset-2 transition-all duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          {/* Sign Up Link */}
          <div className="mt-6 text-center">
            <p className="text-[var(--color-muted)]">
              Don't have an account?{' '}
              <Link to="/signup" className="text-[var(--color-accent)] hover:text-[var(--color-primary)] font-medium transition-colors duration-200">
                Sign up here
              </Link>
            </p>
          </div>
        </div>

        {/* Additional Info */}
        <div className="text-center">
          <p className="text-sm text-white/80">
            Connect with fellow students and exchange skills
          </p>
        </div>

        {/* Admin Access Info */}
        <div className="bg-yellow-500/10 backdrop-blur-sm border border-yellow-500/30 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-yellow-400 mb-1">Admin Access</h3>
              <p className="text-xs text-yellow-200/90 mb-2">
                Admin users can access the management dashboard to moderate users, posts, categories, and universities.
              </p>
              <details className="text-xs">
                <summary className="text-yellow-400 cursor-pointer hover:text-yellow-300 font-medium">
                  View admin credentials (for developers)
                </summary>
                <div className="mt-2 p-3 bg-black/20 rounded-lg border border-yellow-500/20">
                  <p className="text-yellow-200/90 mb-1">📧 Email: <span className="font-mono text-yellow-300">admin@skillswap.com</span></p>
                  <p className="text-yellow-200/90">🔑 Password: <span className="font-mono text-yellow-300">Admin@123</span></p>
                  <p className="text-yellow-200/70 mt-2 text-[10px]">⚠️ Change password after first login</p>
                </div>
              </details>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;