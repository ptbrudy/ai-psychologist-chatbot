import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ChatMessage, ChatRole } from './types';
import { initializeChat } from './services/geminiService';
import { fetchChatHistory, saveMessage } from './services/supabaseService';
import ChatWindow from './components/ChatWindow';
import MessageInput from './components/MessageInput';
import Header from './components/Header';
import Login from './components/Login';
import { Chat } from '@google/genai';
import ConfigError from './components/ConfigError';

const App: React.FC = () => {
  const [missingVars, setMissingVars] = useState<string[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const chatRef = useRef<Chat | null>(null);

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
  }, []);

  const loadChat = useCallback(async (currentUserId: string) => {
    setIsLoading(true);
    try {
      const history = await fetchChatHistory(currentUserId);
      chatRef.current = initializeChat(history);
      
      if (history.length > 0) {
        setMessages(history);
      } else {
        const welcomeMessage: ChatMessage = {
          role: ChatRole.Model,
          content: "Hello! I'm here to listen and support you. How are you feeling today? Remember, our conversation is a safe space, but I'm not a substitute for a real doctor.",
        };
        setMessages([welcomeMessage]);
      }
    } catch (error) {
      console.error("Failed to load chat history:", error);
      const errorMessage: ChatMessage = {
        role: ChatRole.Model,
        content: "Sorry, I'm having trouble connecting or loading your history. Please try again later.",
      };
      setMessages([errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (userId) {
      loadChat(userId);
    }
  }, [userId, loadChat]);

  const handleSendMessage = async (userInput: string) => {
    if (!userInput.trim() || !chatRef.current || !userId) return;

    const userMessage: ChatMessage = { role: ChatRole.User, content: userInput };
    setMessages(prevMessages => [...prevMessages, userMessage]);
    await saveMessage(userId, userMessage);
    
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
      await saveMessage(userId, finalModelMessage);

    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage: ChatMessage = {
        role: ChatRole.Model,
        content: "I encountered an error trying to respond. Please try again.",
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = (username: string) => {
    // Basic validation, trim and convert to lowercase for consistency
    const formattedUsername = username.trim().toLowerCase();
    if (formattedUsername) {
      setUserId(formattedUsername);
    }
  };

  if (missingVars.length > 0) {
    return <ConfigError missingVars={missingVars} />;
  }

  if (!userId) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-blue-100 via-teal-50 to-green-100 font-sans">
      <Header />
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