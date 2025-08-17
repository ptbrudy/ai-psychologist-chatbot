import React from 'react';
import { BrainCircuitIcon } from './icons/BrainCircuitIcon';
import { supabase } from '../services/supabaseService';

const Header: React.FC = () => {

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  }

  return (
    <header className="flex items-center justify-between p-4 bg-white/60 backdrop-blur-sm shadow-sm border-b border-gray-200">
      <div className="flex items-center">
        <BrainCircuitIcon className="h-8 w-8 text-teal-500" />
        <div className="ml-3">
          <h1 className="text-xl font-bold text-gray-800">AI Wellness Companion</h1>
          <p className="text-sm text-gray-500">Your space to reflect and grow</p>
        </div>
      </div>
      <button
        onClick={handleSignOut}
        className="py-2 px-4 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-200 text-sm"
      >
        Sign Out
      </button>
    </header>
  );
};

export default Header;
