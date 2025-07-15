import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { FarmerCard } from '@/components/FarmerCard';
import { SearchBar } from '@/components/SearchBar';
import { FloatingActionButton } from '@/components/FloatingActionButton';
import { useAuth } from '@/hooks/useAuth';
import { useFarmers } from '@/hooks/useFarmers';
import { Plus, Filter, Calendar, MapPin } from 'lucide-react-native';

export default function FarmersScreen() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const { farmers, loading, refreshFarmers, deleteFarmer } = useFarmers();
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/login');
    }
  }, [user, authLoading]);

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshFarmers();
    setRefreshing(false);
  };

  const handleDeleteFarmer = async (id: string) => {
    Alert.alert(
      'Delete Farmer',
      'Are you sure you want to delete this farmer?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteFarmer(id);
              Alert.alert('Success', 'Farmer deleted successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to delete farmer');
            }
          },
        },
      ]
    );
  };

  if (authLoading || !user) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  const filteredFarmers = farmers.filter(farmer => {
    const matchesSearch = 
      farmer.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      farmer.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      farmer.town.toLowerCase().includes(searchQuery.toLowerCase()) ||
      farmer.barangay.toLowerCase().includes(searchQuery.toLowerCase());

    if (filterType === 'all') return matchesSearch;
    
    if (filterType === 'upcoming') {
      if (!farmer.harvest_date) return false;
      const harvestDate = new Date(farmer.harvest_date);
      const today = new Date();
      const diffTime = harvestDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return matchesSearch && diffDays >= 0 && diffDays <= 30;
    }
    
    if (filterType === 'overdue') {
      if (!farmer.harvest_date) return false;
      const harvestDate = new Date(farmer.harvest_date);
      const today = new Date();
      return matchesSearch && harvestDate < today;
    }
    
    return matchesSearch;
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Farmers</Text>
        <Text style={styles.subtitle}>{filteredFarmers.length} farmers found</Text>
      </View>

      <View style={styles.searchContainer}>
        <SearchBar
          placeholder="Search farmers..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
          <TouchableOpacity
            style={[styles.filterButton, filterType === 'all' && styles.activeFilter]}
            onPress={() => setFilterType('all')}>
            <Text style={[styles.filterText, filterType === 'all' && styles.activeFilterText]}>
              All
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, filterType === 'upcoming' && styles.activeFilter]}
            onPress={() => setFilterType('upcoming')}>
            <Calendar size={16} color={filterType === 'upcoming' ? '#ffffff' : '#6b7280'} />
            <Text style={[styles.filterText, filterType === 'upcoming' && styles.activeFilterText]}>
              Upcoming Harvest
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, filterType === 'overdue' && styles.activeFilter]}
            onPress={() => setFilterType('overdue')}>
            <Text style={[styles.filterText, filterType === 'overdue' && styles.activeFilterText]}>
              Overdue
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }>
        <View style={styles.farmersList}>
          {filteredFarmers.map((farmer) => (
            <FarmerCard
              key={farmer.id}
              farmer={farmer}
              onEdit={() => router.push(`/farmer-form?id=${farmer.id}`)}
              onDelete={() => handleDeleteFarmer(farmer.id)}
            />
          ))}
          {filteredFarmers.length === 0 && (
            <View style={styles.emptyState}>
              <MapPin size={48} color="#9ca3af" />
              <Text style={styles.emptyText}>No farmers found</Text>
              <Text style={styles.emptySubtext}>
                {searchQuery ? 'Try adjusting your search' : 'Add your first farmer to get started'}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      <FloatingActionButton
        icon={Plus}
        onPress={() => router.push('/farmer-form')}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
  },
  header: {
    padding: 20,
    paddingBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  filterContainer: {
    paddingBottom: 10,
  },
  filterScroll: {
    paddingHorizontal: 20,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  activeFilter: {
    backgroundColor: '#22C55E',
    borderColor: '#22C55E',
  },
  filterText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '600',
    marginLeft: 4,
  },
  activeFilterText: {
    color: '#ffffff',
  },
  scrollView: {
    flex: 1,
  },
  farmersList: {
    padding: 20,
    paddingTop: 10,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6b7280',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 8,
    textAlign: 'center',
  },
});