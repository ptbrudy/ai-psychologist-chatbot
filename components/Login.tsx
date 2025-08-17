import React from 'react';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '../services/supabaseService';
import { BrainCircuitIcon } from './icons/BrainCircuitIcon';

const Login: React.FC = () => {
  return (
    <div className="flex items-center justify-center h-screen bg-gradient-to-br from-blue-100 via-teal-50 to-green-100 font-sans">
      <div 
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
          Sign in to begin your confidential session.
        </p>
        
        <Auth
          supabaseClient={supabase}
          appearance={{ theme: ThemeSupa }}
          providers={[]}
          theme="light"
        />

        <p className="text-xs text-gray-400 mt-6">
          This is not a substitute for professional medical advice. For crises, please contact a professional immediately.
        </p>
      </div>
    </div>
  );
};

export default Login;
