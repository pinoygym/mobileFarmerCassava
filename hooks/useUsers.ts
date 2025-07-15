import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './useAuth';

export interface User {
  id: string;
  username: string;
  role: string;
  created_at?: string;
}

interface UsersState {
  users: User[];
  loading: boolean;
  error: string | null;
}

export function useUsers() {
  const { user, session } = useAuth();
  const [state, setState] = useState<UsersState>({
    users: [],
    loading: true,
    error: null,
  });

  useEffect(() => {
    if (session && user?.role === 'admin') {
      fetchUsers();
    }
  }, [session, user]);

  const fetchUsers = async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const { data, error } = await supabase
        .from('users')
        .select('id, username, role, created_at')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setState(prev => ({ 
        ...prev, 
        users: data || [], 
        loading: false 
      }));
    } catch (error) {
      console.error('Error fetching users:', error);
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: 'Failed to fetch users' 
      }));
    }
  };

  const refreshUsers = async () => {
    await fetchUsers();
  };

  const createUser = async (userData: { username: string; password: string; role: string }) => {
    try {
      // Hash password (in production, use proper password hashing)
      const passwordHash = await hashPassword(userData.password);

      const { data, error } = await supabase
        .from('users')
        .insert([{
          username: userData.username,
          password_hash: passwordHash,
          role: userData.role,
        }])
        .select('id, username, role, created_at')
        .single();

      if (error) throw error;

      // Create auth user
      const email = `${data.id}@farmer-app.local`;
      await supabase.auth.signUp({
        email,
        password: userData.password,
      });

      setState(prev => ({
        ...prev,
        users: [data, ...prev.users],
      }));

      return data;
    } catch (error) {
      console.error('Error creating user:', error);
      throw new Error('Failed to create user');
    }
  };

  const updateUser = async (id: string, userData: Partial<User & { password?: string }>) => {
    try {
      const updateData: any = {
        username: userData.username,
        role: userData.role,
      };

      if (userData.password) {
        updateData.password_hash = await hashPassword(userData.password);
      }

      const { data, error } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', id)
        .select('id, username, role, created_at')
        .single();

      if (error) throw error;

      setState(prev => ({
        ...prev,
        users: prev.users.map(user =>
          user.id === id ? { ...user, ...data } : user
        ),
      }));

      return data;
    } catch (error) {
      console.error('Error updating user:', error);
      throw new Error('Failed to update user');
    }
  };

  const deleteUser = async (id: string) => {
    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setState(prev => ({
        ...prev,
        users: prev.users.filter(user => user.id !== id),
      }));
    } catch (error) {
      console.error('Error deleting user:', error);
      throw new Error('Failed to delete user');
    }
  };

  return {
    ...state,
    refreshUsers,
    createUser,
    updateUser,
    deleteUser,
  };
}

// Simple password hashing (use bcrypt in production)
async function hashPassword(password: string): Promise<string> {
  // This is a simple hash for demo purposes
  // In production, use proper password hashing like bcrypt
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}