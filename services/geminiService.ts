import { GoogleGenAI, Chat } from '@google/genai';
import { SYSTEM_PROMPT } from '../constants';
import { ChatMessage } from '../types';

// The App component now checks for this variable, so we can assume it exists here.
const API_KEY = process.env.API_KEY!;

const ai = new GoogleGenAI({ apiKey: API_KEY });

export const initializeChat = (history: ChatMessage[] = []): Chat => {
  const geminiHistory = history.map(msg => ({
    role: msg.role,
    parts: [{ text: msg.content }],
  }));

  const chat: Chat = ai.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction: SYSTEM_PROMPT,
    },
    history: geminiHistory,
  });
  return chat;
};
