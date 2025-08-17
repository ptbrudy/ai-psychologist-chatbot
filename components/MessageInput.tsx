
import React, { useState } from 'react';
import { SendIcon } from './icons/SendIcon';

interface MessageInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
}

const MessageInput: React.FC<MessageInputProps> = ({ onSendMessage, isLoading }) => {
  const [inputValue, setInputValue] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && !isLoading) {
      onSendMessage(inputValue);
      setInputValue('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center space-x-3 max-w-4xl mx-auto">
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        placeholder="Type your message here..."
        disabled={isLoading}
        className="flex-1 p-3 border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-400 focus:outline-none transition duration-200 disabled:opacity-50"
        autoFocus
      />
      <button
        type="submit"
        disabled={isLoading || !inputValue.trim()}
        className="p-3 bg-blue-500 text-white rounded-full hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300 disabled:cursor-not-allowed transition-all duration-200 transform active:scale-95"
      >
        <SendIcon className="h-6 w-6" />
      </button>
    </form>
  );
};

export default MessageInput;
