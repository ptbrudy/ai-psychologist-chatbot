import React from 'react';
import { BrainCircuitIcon } from './icons/BrainCircuitIcon';

interface ConfigErrorProps {
  missingVars: string[];
}

const ConfigError: React.FC<ConfigErrorProps> = ({ missingVars }) => {
  return (
    <div className="flex items-center justify-center h-screen bg-red-50 font-sans">
      <div className="text-center bg-white p-8 sm:p-12 rounded-2xl shadow-xl max-w-2xl w-full mx-4 border-2 border-red-200">
        <div className="flex justify-center mb-6">
          <BrainCircuitIcon className="h-16 w-16 text-red-500" aria-hidden="true" />
        </div>
        <h1 id="config-error-heading" className="text-3xl font-bold text-red-800 mb-4">
          Application Configuration Error
        </h1>
        <p className="text-gray-700 mb-6 text-lg">
          The application cannot start because some required environment variables are missing.
        </p>
        <div className="text-left bg-red-100 p-4 rounded-lg">
          <p className="font-semibold text-red-900 mb-2">Please ensure the following environment variables are set in your execution environment:</p>
          <ul className="list-disc list-inside space-y-1">
            {missingVars.map(v => (
              <li key={v} className="font-mono text-red-800">{v}</li>
            ))}
          </ul>
        </div>
        <p className="text-xs text-gray-500 mt-8">
          These variables are required to connect to the AI model and the database for storing chat history.
        </p>
      </div>
    </div>
  );
};

export default ConfigError;
