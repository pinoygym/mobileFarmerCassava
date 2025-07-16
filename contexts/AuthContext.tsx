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
      
      console.log('Attempting login for:', username);
      console.log('Supabase URL:', process.env.EXPO_PUBLIC_SUPABASE_URL);
      console.log('Supabase Key exists:', !!process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY);
      
      // First, get the user by username
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id, username, role, password_hash')
        .eq('username', username)
        .limit(1);

      console.log('User query result:', userData, userError);
      console.log('Query executed successfully, data length:', userData?.length || 0);

      if (userError || !userData || userData.length === 0) {
        console.log('User not found or error:', userError);
        console.log('Available users check...');
        
        // Debug: Check if any users exist at all
        const { data: allUsers, error: allUsersError } = await supabase
          .from('users')
          .select('username')
          .limit(5);
        
        console.log('All users in database:', allUsers, allUsersError);
        throw new Error('Invalid credentials');
      }

      const user = userData[0];
      console.log('Found user:', { id: user.id, username: user.username, role: user.role });

      // Simple password verification (in production, use proper bcrypt)
      const hashedInput = await hashPassword(password);
      console.log('Password hash comparison:', { input: hashedInput, stored: user.password_hash });
      
      if (hashedInput !== user.password_hash) {
        console.log('Password mismatch');
        throw new Error('Invalid credentials');
      }

      console.log('Password verified, proceeding with auth');

      // Create or sign in with Supabase Auth
      const email = `${user.id}@farmer-app.local`;
      
      let authResult = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authResult.error) {
        console.log('Auth sign in failed, trying sign up:', authResult.error);
        // If user doesn't exist in auth, create them
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
        });

        if (signUpError) throw signUpError;
        console.log('Sign up successful, trying sign in again');

        // Try signing in again
        authResult = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (authResult.error) throw authResult.error;
      }

      console.log('Login successful');
      // Store credentials securely
      await SecureStore.setItemAsync('username', username);
      
    } catch (error) {
      console.error('Login error:', error);
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