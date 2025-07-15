import React, { createContext, useContext, useEffect, useState } from 'react';
import { router } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { Session, User as SupabaseUser } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';

interface User {
  id: string;
  username: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        fetchUserProfile(session.user);
      } else {
        setIsLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        if (session?.user) {
          await fetchUserProfile(session.user);
        } else {
          setUser(null);
          setIsLoading(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (supabaseUser: SupabaseUser) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, username, role')
        .eq('id', supabaseUser.id)
        .single();

      if (error) throw error;

      setUser(data);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (username: string, password: string) => {
    try {
      setIsLoading(true);
      
      // First, get the user by username
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id, username, role, password_hash')
        .eq('username', username)
        .single();

      if (userError || !userData) {
        throw new Error('Invalid credentials');
      }

      // Simple password verification (in production, use proper bcrypt)
      const hashedInput = await hashPassword(password);
      if (hashedInput !== userData.password_hash) {
        throw new Error('Invalid credentials');
      }

      // Create or sign in with Supabase Auth
      const email = `${userData.id}@farmer-app.local`;
      
      let authResult = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authResult.error) {
        // If user doesn't exist in auth, create them
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
        });

        if (signUpError) throw signUpError;

        // Try signing in again
        authResult = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (authResult.error) throw authResult.error;
      }

      // Store credentials securely
      await SecureStore.setItemAsync('username', username);
      
    } catch (error) {
      setIsLoading(false);
      throw new Error('Invalid credentials');
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      await SecureStore.deleteItemAsync('username');
      setUser(null);
      setSession(null);
      router.replace('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Simple password hashing (use bcrypt in production)
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}