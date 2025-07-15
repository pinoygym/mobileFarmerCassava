import { useState, useEffect } from 'react';
import { router } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { Session, User as SupabaseUser } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';

interface User {
  id: string;
  username: string;
  role: string;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  session: Session | null;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    session: null,
  });

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchUserProfile(session.user);
      } else {
        setState({ user: null, isLoading: false, session: null });
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          await fetchUserProfile(session.user);
        } else {
          setState({ user: null, isLoading: false, session: null });
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

      setState({
        user: data,
        isLoading: false,
        session: await supabase.auth.getSession().then(({ data }) => data.session),
      });
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setState({ user: null, isLoading: false, session: null });
    }
  };

  const login = async (username: string, password: string) => {
    try {
      // First, get the user by username to get their email
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id, username, role')
        .eq('username', username)
        .single();

      if (userError || !userData) {
        throw new Error('Invalid credentials');
      }

      // Use the user ID as email for Supabase auth (workaround)
      const email = `${userData.id}@farmer-app.local`;
      
      // Try to sign in
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        // If user doesn't exist in auth, create them
        if (error.message.includes('Invalid login credentials')) {
          const { error: signUpError } = await supabase.auth.signUp({
            email,
            password,
          });

          if (signUpError) throw signUpError;

          // Try signing in again
          const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
            email,
            password,
          });

          if (signInError) throw signInError;
        } else {
          throw error;
        }
      }

      // Store credentials securely
      await SecureStore.setItemAsync('username', username);
      
    } catch (error) {
      console.error('Login error:', error);
      throw new Error('Invalid credentials');
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      await SecureStore.deleteItemAsync('username');
      setState({ user: null, isLoading: false, session: null });
      router.replace('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return {
    ...state,
    login,
    logout,
  };
}