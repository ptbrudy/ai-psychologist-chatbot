import React, { useState } from 'react';
import { BrainCircuitIcon } from './icons/BrainCircuitIcon';

interface LoginProps {
  onLogin: (username: string) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim()) {
      onLogin(username);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gradient-to-br from-blue-100 via-teal-50 to-green-100 font-sans">
      <form
        onSubmit={handleSubmit}
        className="text-center bg-white/60 backdrop-blur-sm p-8 sm:p-12 rounded-2xl shadow-xl max-w-md w-full mx-4"
        aria-labelledby="login-heading"
      >
        <div className="flex justify-center mb-6">
          <BrainCircuitIcon className="h-16 w-16 text-teal-500" aria-hidden="true" />
        </div>
        <h1 id="login-heading" className="text-3xl font-bold text-gray-800 mb-2">
          AI Wellness Companion
        </h1>
        <p className="text-gray-600 mb-8">
          Your confidential space to reflect, understand your thoughts, and find a moment of calm.
        </p>
        
        <div className="mb-6">
          <label htmlFor="username" className="sr-only">Username</label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter your username"
            required
            className="w-full p-3 border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-400 focus:outline-none transition duration-200"
            autoFocus
          />
        </div>

        <button
          type="submit"
          disabled={!username.trim()}
          className="w-full py-3 px-6 bg-blue-500 text-white font-semibold rounded-full hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 transform active:scale-95 shadow-md hover:shadow-lg disabled:bg-blue-300 disabled:cursor-not-allowed"
        >
          Begin Your Session
        </button>
        <p className="text-xs text-gray-400 mt-6">
          This is not a substitute for professional medical advice. For crises, please contact a professional immediately.
        </p>
      </form>
    </div>
  );
};

export default Login;