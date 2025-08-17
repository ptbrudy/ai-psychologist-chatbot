import { createClient } from '@supabase/supabase-js';
import { ChatMessage, ChatRole } from '../types';

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string | null;
          name: string | null;
        };
        Insert: {
          id: string;
          email?: string | null;
          name?: string | null;
        };
        Update: {
          id?: string;
          email?: string | null;
          name?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'profiles_id_fkey';
            columns: ['id'];
            isOneToOne: true;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      sessions: {
        Row: {
          id: string;
          user_id: string;
          started_at: string;
          ended_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          started_at?: string;
          ended_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          started_at?: string;
          ended_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'sessions_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      chat_logs: {
        Row: {
          id: string;
          session_id: string;
          user_id: string;
          role: string;
          message: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          session_id: string;
          user_id: string;
          role: string;
          message?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          session_id?: string;
          user_id?: string;
          role?: string;
          message?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'chat_logs_session_id_fkey';
            columns: ['session_id'];
            isOneToOne: false;
            referencedRelation: 'sessions';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'chat_logs_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      moods: {
        Row: {
          id: string;
          user_id: string;
          date: string;
          mood: string | null;
          note: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          date: string;
          mood?: string | null;
          note?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          date?: string;
          mood?: string | null;
          note?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'moods_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
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
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * Creates a new chat session for a user.
 * @param userId The unique identifier for the user (from auth.uid()).
 * @returns A promise that resolves to the new session's ID.
 */
export const createNewSession = async (userId: string): Promise<string | null> => {
  const { data, error } = await supabase
    .from('sessions')
    .insert({ user_id: userId })
    .select('id')
    .single();

  // --- ERROR CONTROL: Log the detailed error but return null to signal failure to the caller. ---
  if (error) {
    console.error("Error creating new session:", error);
    return null;
  }
  return data.id;
};

/**
 * Saves a single chat message to the database.
 * @param userId The unique identifier for the user.
 * @param sessionId The unique identifier for the current chat session.
 * @param message The chat message object to save.
 */
export const saveChatMessage = async (userId: string, sessionId: string, message: ChatMessage): Promise<void> => {
  // Map our internal 'model' role to the database's 'ai' role.
  const dbRole = message.role === ChatRole.Model ? 'ai' : 'user';

  const { error } = await supabase
    .from('chat_logs')
    .insert({ 
      user_id: userId, 
      session_id: sessionId, 
      role: dbRole, 
      message: message.content 
    });
  
  // --- ERROR CONTROL: Throw the error so the calling function can handle it. ---
  if (error) {
    console.error("Error saving message:", error);
    // This allows the UI to catch the error and inform the user.
    throw new Error(error.message);
  }
};