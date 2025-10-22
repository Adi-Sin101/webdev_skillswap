import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Signup = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    university: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [universities, setUniversities] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [isUniversityOpen, setIsUniversityOpen] = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();

  // Fetch universities on component mount
  React.useEffect(() => {
    const fetchUniversities = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/universities');
        const data = await response.json();
        if (data.universities) {
          setUniversities(data.universities);
        }
      } catch (error) {
        console.error('Error fetching universities:', error);
      }
    };
    fetchUniversities();
  }, []);

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('#university-container')) {
        setShowDropdown(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter universities based on search term
  const filteredUniversities = universities.filter(uni =>
    uni.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    uni.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleUniversitySearch = (e) => {
    setSearchTerm(e.target.value);
    setShowDropdown(true);
  };

  const selectUniversity = (university) => {
    setFormData({
      ...formData,
      university: university.name
    });
    setSearchTerm(university.name);
    setShowDropdown(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Client-side validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match!');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long!');
      setLoading(false);
      return;
    }

    const result = await register({
      name: formData.name,
      email: formData.email,
      university: formData.university,
      password: formData.password
    });
    
    if (result.success) {
      navigate('/'); // Redirect to home page
    } else {
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
          <h2 className="text-2xl font-semibold text-white mb-2">Join Our Community</h2>
          <p className="text-white/80">Create your account to start exchanging skills</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded relative mb-4">
            {error}
          </div>
        )}

        {/* Signup Form */}
        <div className="bg-[var(--color-surface)] rounded-2xl shadow-xl p-8 border border-[var(--color-border)]">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name Field */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-[var(--color-primary)] mb-2">
                Full Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-[var(--color-border)] rounded-lg focus:ring-2 focus:ring-[var(--color-accent)] focus:border-[var(--color-accent)] bg-white text-[var(--color-primary)] placeholder-[var(--color-muted)] transition-all duration-200"
                placeholder="Enter your full name"
              />
            </div>

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

            {/* University Field */}
            <div id="university-container" className="relative">
              <label htmlFor="university" className="block text-sm font-medium text-[var(--color-primary)] mb-2">
                University
              </label>
              {/* Collapsible University Selector */}
              <div className="w-full">
                <div
                  onClick={() => setIsUniversityOpen(!isUniversityOpen)}
                  className="cursor-pointer rounded-xl px-4 py-3 flex justify-between items-center transition-all duration-200 hover:shadow-lg border border-[var(--color-border)]"
                  style={{
                    background: 'var(--color-surface)',
                    color: 'var(--color-primary)',
                    boxShadow: '0 2px 8px 0 rgba(0,0,0,0.04)',
                  }}
                >
                  <span className="font-medium tracking-wide">
                    {searchTerm || formData.university || 'Select University'}
                  </span>
                  <div className="flex items-center gap-2">
                    {(searchTerm || formData.university) && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSearchTerm('');
                          setFormData({
                            ...formData,
                            university: ''
                          });
                        }}
                        className="text-xs text-red-400 hover:text-red-600 underline"
                      >
                        ✕
                      </button>
                    )}
                    <span className="text-gray-400 text-xs">
                      {isUniversityOpen ? "▲" : "▼"}
                    </span>
                  </div>
                </div>

                {/* University Options (shown when open) */}
                {isUniversityOpen && (
                  <div className="mt-2 relative">
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setShowDropdown(true);
                      }}
                      onFocus={() => setShowDropdown(true)}
                      placeholder="Search for your university"
                      className="w-full px-4 py-3 border border-[var(--color-border)] rounded-lg focus:ring-2 focus:ring-[var(--color-accent)] focus:border-[var(--color-accent)] bg-white text-[var(--color-primary)] placeholder-[var(--color-muted)] transition-all duration-200"
                      autoComplete="off"
                    />

                    {/* Dropdown */}
                    {showDropdown && filteredUniversities.length > 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-[var(--color-border)] rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        {filteredUniversities.slice(0, 50).map((uni) => (
                          <div
                            key={uni._id}
                            onClick={() => {
                              selectUniversity(uni);
                              setIsUniversityOpen(false);
                            }}
                            className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                          >
                            <div className="font-medium text-[var(--color-primary)]">{uni.name}</div>
                            <div className="text-sm text-[var(--color-muted)]">{uni.location}</div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* No results message */}
                    {showDropdown && searchTerm && filteredUniversities.length === 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-[var(--color-border)] rounded-lg shadow-lg p-4">
                        <p className="text-sm text-[var(--color-muted)]">No universities found. Try a different search term.</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
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
                placeholder="Create a password"
              />
            </div>

            {/* Confirm Password Field */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-[var(--color-primary)] mb-2">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-[var(--color-border)] rounded-lg focus:ring-2 focus:ring-[var(--color-accent)] focus:border-[var(--color-accent)] bg-white text-[var(--color-primary)] placeholder-[var(--color-muted)] transition-all duration-200"
                placeholder="Confirm your password"
              />
            </div>

            {/* Terms and Conditions */}
            <div className="flex items-center">
              <input
                id="terms"
                name="terms"
                type="checkbox"
                required
                className="h-4 w-4 text-[var(--color-accent)] focus:ring-[var(--color-accent)] border-[var(--color-border)] rounded"
              />
              <label htmlFor="terms" className="ml-2 block text-sm text-[var(--color-muted)]">
                I agree to the{' '}
                <a href="#" className="text-[var(--color-accent)] hover:text-[var(--color-primary)] font-medium transition-colors duration-200">
                  Terms and Conditions
                </a>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[var(--color-accent)] text-[var(--color-surface)] font-semibold py-3 px-4 rounded-lg hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:ring-offset-2 transition-all duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          {/* Sign In Link */}
          <div className="mt-6 text-center">
            <p className="text-[var(--color-muted)]">
              Already have an account?{' '}
              <Link to="/login" className="text-[var(--color-accent)] hover:text-[var(--color-primary)] font-medium transition-colors duration-200">
                Sign in here
              </Link>
            </p>
          </div>
        </div>

        {/* Additional Info */}
        <div className="text-center">
          <p className="text-sm text-[var(--color-muted)]">
            Join thousands of students sharing knowledge and skills
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;