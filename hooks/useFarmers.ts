import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './useAuth';

export interface Farmer {
  id: string;
  first_name: string;
  last_name: string;
  middle_initial?: string;
  location_group: string;
  barangay: string;
  town: string;
  contact_number: string;
  land_area?: number;
  planted_date?: string;
  harvest_date?: string;
  created_at?: string;
  user_id?: string;
}

interface FarmersState {
  farmers: Farmer[];
  loading: boolean;
  error: string | null;
}

export function useFarmers() {
  const { user, session } = useAuth();
  const [state, setState] = useState<FarmersState>({
    farmers: [],
    loading: true,
    error: null,
  });

  useEffect(() => {
    if (session) {
      fetchFarmers();
    }
  }, [session]);

  const fetchFarmers = async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const { data, error } = await supabase
        .from('farmers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setState(prev => ({ 
        ...prev, 
        farmers: data || [], 
        loading: false 
      }));
    } catch (error) {
      console.error('Error fetching farmers:', error);
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: 'Failed to fetch farmers' 
      }));
    }
  };

  const refreshFarmers = async () => {
    await fetchFarmers();
  };

  const createFarmer = async (farmerData: Omit<Farmer, 'id' | 'created_at' | 'user_id'>) => {
    try {
      if (!user?.id) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('farmers')
        .insert([{
          ...farmerData,
          user_id: user.id,
        }])
        .select()
        .single();

      if (error) throw error;

      setState(prev => ({
        ...prev,
        farmers: [data, ...prev.farmers],
      }));

      return data;
    } catch (error) {
      console.error('Error creating farmer:', error);
      throw new Error('Failed to create farmer');
    }
  };

  const updateFarmer = async (id: string, farmerData: Partial<Farmer>) => {
    try {
      const { data, error } = await supabase
        .from('farmers')
        .update(farmerData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setState(prev => ({
        ...prev,
        farmers: prev.farmers.map(farmer =>
          farmer.id === id ? { ...farmer, ...data } : farmer
        ),
      }));

      return data;
    } catch (error) {
      console.error('Error updating farmer:', error);
      throw new Error('Failed to update farmer');
    }
  };

  const deleteFarmer = async (id: string) => {
    try {
      const { error } = await supabase
        .from('farmers')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setState(prev => ({
        ...prev,
        farmers: prev.farmers.filter(farmer => farmer.id !== id),
      }));
    } catch (error) {
      console.error('Error deleting farmer:', error);
      throw new Error('Failed to delete farmer');
    }
  };

  return {
    ...state,
    refreshFarmers,
    createFarmer,
    updateFarmer,
    deleteFarmer,
  };
}