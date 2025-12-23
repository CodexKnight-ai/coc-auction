import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';

const RequireAuth = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);


  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    const correctPassword = import.meta.env.VITE_ADMIN_PASSWORD;
    
    if (password === correctPassword) {
      setIsAuthenticated(true);
      setError("");
    } else {
      setError("Incorrect password. You are not authorized.");
      setPassword("");
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#010815] flex items-center justify-center p-4 ">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 max-w-md w-full">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-6 text-center">
            Admin Authentication
          </h2>
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
<div className="relative">
  <input
    type={showPassword ? "text" : "password"}
    value={password}
    onChange={(e) => setPassword(e.target.value)}
    placeholder="Enter admin password"
    className="w-full px-4 py-2 pr-12 border rounded-lg 
               dark:bg-gray-800 dark:text-gray-200 
               dark:border-gray-700 focus:ring-2 focus:ring-blue-500"
  />

  <button
    type="button"
    onClick={() => setShowPassword((v) => !v)}
    className="absolute right-3 top-1/2 -translate-y-1/2 
               text-gray-500 hover:text-gray-700 
               dark:text-gray-400 dark:hover:text-gray-200"
    aria-label={showPassword ? "Hide password" : "Show password"}
  >
    {showPassword ? "🙈" : "👁️"}
  </button>
</div>

            {error && (
              <p className="text-red-500 dark:text-red-400 text-sm">{error}</p>
            )}
            <button
              type="submit"
              className="w-full p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 
                       transition-colors font-bold"
            >
              Login
            </button>
          </form>
        </div>
      </div>
    );
  }

  return children;
};

export default RequireAuth; 