import { createClient } from '@supabase/supabase-js';
import { ChatMessage, ChatRole } from '../types';

export interface Database {
  public: {
    Tables: {
      chat_history: {
        Row: {
          id: number;
          created_at: string;
          user_id: string;
          role: string;
          content: string;
        };
        Insert: {
          id?: number;
          created_at?: string;
          user_id: string;
          role: string;
          content: string;
        };
        Update: {
          id?: number;
          created_at?: string;
          user_id?: string;
          role?: string;
          content?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

// The App component now checks for these variables, so we can assume they exist here.
const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY!;

const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * Fetches chat history for a specific user.
 * @param userId The unique identifier for the user.
 * @returns A promise that resolves to an array of chat messages.
 */
export const fetchChatHistory = async (userId: string): Promise<ChatMessage[]> => {
  const { data, error } = await supabase
    .from('chat_history')
    .select('role, content')
    .eq('user_id', userId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error("Error fetching chat history:", error);
    // In case of error, return an empty array to allow the app to continue.
    return [];
  }
  // Supabase may return null, so default to an empty array.
  // We cast here because the DB schema uses a string for 'role', but our app uses the ChatRole enum.
  // This is safe as long as the database only contains 'user' or 'model'.
  return (data as ChatMessage[]) || [];
};

/**
 * Saves a single chat message to the database.
 * @param userId The unique identifier for the user.
 * @param message The chat message object to save.
 */
export const saveMessage = async (userId: string, message: ChatMessage) => {
  const { error } = await supabase
    .from('chat_history')
    .insert([{ user_id: userId, role: message.role, content: message.content }]);

  if (error) {
    console.error("Error saving message:", error);
  }
};
