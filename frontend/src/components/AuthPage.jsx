import React, { useState } from 'react';
import { LogIn } from 'lucide-react';

export default function AuthPage({ onLogin }) {
  const [userId, setUserId] = useState('');
  const [isSignup, setIsSignup] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!userId.trim()) {
      alert('Please enter a user ID');
      return;
    }
    if (isSignup && password !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    if (isSignup && !password.trim()) {
      alert('Please enter a password');
      return;
    }

    if (isSignup) {
      // After signup, redirect to login page
      alert('Account created successfully! Please login with your credentials.');
      setIsSignup(false);
      setUserId('');
      setPassword('');
      setConfirmPassword('');
    } else {
      // On login, authenticate and redirect to main page
      onLogin(userId);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="bg-black rounded-lg p-8 border border-[#76B900]/30 shadow-2xl shadow-[#76B900]/20">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <LogIn className="w-12 h-12 text-[#76B900]" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">
              GPU Cluster
            </h1>
            <p className="text-gray-400">
              {isSignup ? 'Create your account' : 'Welcome back'}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* User ID */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                User ID
              </label>
              <input
                type="text"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                className="w-full px-4 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#76B900] focus:border-[#76B900] transition shadow-lg shadow-[#76B900]/20"
                placeholder="Enter your user ID"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#76B900] focus:border-[#76B900] transition shadow-lg shadow-[#76B900]/20"
                placeholder={isSignup ? 'Create a password' : 'Enter your password'}
              />
            </div>

            {/* Confirm Password */}
            {isSignup && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#76B900] focus:border-[#76B900] transition shadow-lg shadow-[#76B900]/20"
                  placeholder="Confirm your password"
                />
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full mt-6 px-4 py-3 bg-[#76B900] text-black hover:bg-[#5a8a00] rounded-lg font-medium transition-all duration-200 transform hover:scale-105 shadow-lg shadow-[#76B900]/50"
            >
              {isSignup ? 'Sign Up' : 'Login'}
            </button>
          </form>

          {/* Toggle Auth Mode */}
          <div className="mt-6 text-center text-gray-400">
            <p className="text-sm">
              {isSignup ? 'Already have an account?' : "Don't have an account?"}{' '}
              <button
                type="button"
                onClick={() => {
                  setIsSignup(!isSignup);
                  setUserId('');
                  setPassword('');
                  setConfirmPassword('');
                }}
                className="text-[#76B900] hover:text-[#5a8a00] font-medium transition"
              >
                {isSignup ? 'Login' : 'Sign Up'}
              </button>
            </p>
          </div>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-gray-700">
            <p className="text-xs text-gray-600 text-center">
              This is a demo. No actual authentication required.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
