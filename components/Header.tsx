
import React from 'react';
import { BrainCircuitIcon } from './icons/BrainCircuitIcon';

const Header: React.FC = () => {
  return (
    <header className="flex items-center p-4 bg-white/60 backdrop-blur-sm shadow-sm border-b border-gray-200">
      <BrainCircuitIcon className="h-8 w-8 text-teal-500" />
      <div className="ml-3">
        <h1 className="text-xl font-bold text-gray-800">AI Wellness Companion</h1>
        <p className="text-sm text-gray-500">Your space to reflect and grow</p>
      </div>
    </header>
  );
};

export default Header;
