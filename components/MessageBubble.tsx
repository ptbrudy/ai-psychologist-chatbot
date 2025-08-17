
import React from 'react';
import { ChatMessage, ChatRole } from '../types';
import { UserIcon } from './icons/UserIcon';
import { BrainCircuitIcon } from './icons/BrainCircuitIcon';

interface MessageBubbleProps {
  message: ChatMessage;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.role === ChatRole.User;

  const wrapperClasses = `flex items-start gap-3 ${isUser ? 'justify-end' : 'justify-start'}`;
  const bubbleClasses = `max-w-xl p-4 rounded-2xl shadow-sm ${
    isUser
      ? 'bg-blue-500 text-white rounded-br-lg'
      : 'bg-white text-gray-800 rounded-bl-lg border border-gray-200'
  }`;
  const contentClasses = "whitespace-pre-wrap break-words";

  const Icon = isUser ? UserIcon : BrainCircuitIcon;
  const iconClasses = `h-8 w-8 p-1.5 rounded-full ${isUser ? 'bg-blue-100 text-blue-600' : 'bg-teal-100 text-teal-600'}`;

  return (
    <div className={wrapperClasses}>
      {!isUser && <Icon className={iconClasses} />}
      <div className={bubbleClasses}>
        <p className={contentClasses}>{message.content}</p>
      </div>
      {isUser && <Icon className={iconClasses} />}
    </div>
  );
};

export default MessageBubble;
