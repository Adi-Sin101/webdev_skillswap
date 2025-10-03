import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Signup = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    university: '',
    password: '',
    confirmPassword: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle signup logic here
    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match!');
      return;
    }
    console.log('Signup data:', formData);
  };

  return (
    <div className="min-h-screen bg-[var(--color-background)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-[var(--color-primary)] mb-2">SkillSwap</h1>
          <h2 className="text-2xl font-semibold text-[var(--color-primary)] mb-2">Join Our Community</h2>
          <p className="text-[var(--color-muted)]">Create your account to start exchanging skills</p>
        </div>

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
            <div>
              <label htmlFor="university" className="block text-sm font-medium text-[var(--color-primary)] mb-2">
                University
              </label>
              <input
                id="university"
                name="university"
                type="text"
                required
                value={formData.university}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-[var(--color-border)] rounded-lg focus:ring-2 focus:ring-[var(--color-accent)] focus:border-[var(--color-accent)] bg-white text-[var(--color-primary)] placeholder-[var(--color-muted)] transition-all duration-200"
                placeholder="Enter your university"
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
              className="w-full bg-[var(--color-accent)] text-[var(--color-surface)] font-semibold py-3 px-4 rounded-lg hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:ring-offset-2 transition-all duration-200 shadow-lg"
            >
              Create Account
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