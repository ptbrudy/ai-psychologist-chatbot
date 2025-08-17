import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage, ChatRole } from './types';
import { initializeChat } from './services/geminiService';
import { saveChatMessage, createNewSession, supabase } from './services/supabaseService';
import ChatWindow from './components/ChatWindow';
import MessageInput from './components/MessageInput';
import Header from './components/Header';
import Login from './components/Login';
import { Chat } from '@google/genai';
import ConfigError from './components/ConfigError';
import { Session } from '@supabase/supabase-js';

const App: React.FC = () => {
  const [missingVars, setMissingVars] = useState<string[]>([]);
  const [session, setSession] = useState<Session | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const chatRef = useRef<Chat | null>(null);
  // --- ERROR CONTROL: State to hold and display error messages to the user ---
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const requiredVars: { [key: string]: string | undefined } = {
      'API_KEY': process.env.API_KEY,
      'SUPABASE_URL': process.env.SUPABASE_URL,
      'SUPABASE_ANON_KEY': process.env.SUPABASE_ANON_KEY
    };
    
    const missing = Object.keys(requiredVars).filter(key => !requiredVars[key] || requiredVars[key] === '');
    
    if (missing.length > 0) {
      setMissingVars(missing);
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      if (_event === 'SIGNED_IN' && session) {
        setIsLoading(true);
        setError(null);
        // --- ERROR CONTROL: Wrap session creation in a try/catch block ---
        try {
          const newSessionId = await createNewSession(session.user.id);
          if (!newSessionId) {
            // Throw an error if session creation fails (e.g., DB connection issue)
            throw new Error("Failed to start a new session. Please try again.");
          }
          setSessionId(newSessionId);
          chatRef.current = initializeChat(); // Start with empty history for new session
          const welcomeMessage: ChatMessage = {
            role: ChatRole.Model,
            content: "Hello! I'm here to listen and support you. How are you feeling today? Remember, our conversation is a safe space, but I'm not a substitute for a real doctor.",
          };
          setMessages([welcomeMessage]);
        } catch (err: any) {
          console.error("Session creation failed:", err);
          setError(err.message || "An unexpected error occurred during setup.");
        } finally {
          setIsLoading(false);
        }
      } else if (_event === 'SIGNED_OUT') {
        setMessages([]);
        setSessionId(null);
        chatRef.current = null;
        setError(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSendMessage = async (userInput: string) => {
    if (!userInput.trim() || !chatRef.current || !session || !sessionId) return;
    
    // --- ERROR CONTROL: Clear previous errors on new message attempt ---
    setError(null);

    const userMessage: ChatMessage = { role: ChatRole.User, content: userInput };
    setMessages(prevMessages => [...prevMessages, userMessage]);
    
    // --- ERROR CONTROL: try to save the user message BEFORE sending to AI ---
    try {
      await saveChatMessage(session.user.id, sessionId, userMessage);
    } catch (err) {
      console.error("Failed to save user message:", err);
      setError("Failed to send your message. Please check your connection and try again.");
      // remove the optimistic message from the UI
      setMessages(prevMessages => prevMessages.slice(0, prevMessages.length - 1));
      return; // Stop processing if we can't save the message
    }
    
    setIsLoading(true);

    try {
      const stream = await chatRef.current.sendMessageStream({ message: userInput });
      
      let currentResponse = "";
      setMessages(prev => [...prev, { role: ChatRole.Model, content: "..." }]);

      for await (const chunk of stream) {
        currentResponse += chunk.text;
        setMessages(prev => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1] = { role: ChatRole.Model, content: currentResponse + "▌" };
          return newMessages;
        });
      }

      const finalModelMessage: ChatMessage = { role: ChatRole.Model, content: currentResponse };
      setMessages(prev => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1] = finalModelMessage;
          return newMessages;
      });

      // --- ERROR CONTROL: Try to save the final AI response ---
      try {
        await saveChatMessage(session.user.id, sessionId, finalModelMessage);
      } catch (saveError) {
        // This is not a critical failure for the user, as they've seen the message.
        // We will log it but not show a disruptive error.
        console.error("Failed to save AI response:", saveError);
      }

    } catch (error) {
      console.error("Error sending message to AI:", error);
      const errorMessage: ChatMessage = {
        role: ChatRole.Model,
        content: "I encountered an error trying to respond. Please try again.",
      };
      // Replace the loading indicator with an error message
      setMessages(prev => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1] = errorMessage;
          return newMessages;
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (missingVars.length > 0) {
    return <ConfigError missingVars={missingVars} />;
  }

  if (!session) {
    return <Login />;
  }

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-blue-100 via-teal-50 to-green-100 font-sans">
      <Header />
      {/* --- ERROR CONTROL: Display a persistent error message if one exists --- */}
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4" role="alert">
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </div>
      )}
      <main className="flex-1 overflow-hidden">
        <ChatWindow messages={messages} />
      </main>
      <footer className="p-4 bg-white/50 backdrop-blur-sm border-t border-gray-200">
        <MessageInput onSendMessage={handleSendMessage} isLoading={isLoading} />
      </footer>
    </div>
  );
};

export default App;