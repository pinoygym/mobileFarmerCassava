import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { UserCard } from '@/components/UserCard';
import { FloatingActionButton } from '@/components/FloatingActionButton';
import { useAuth } from '@/hooks/useAuth';
import { useUsers } from '@/hooks/useUsers';
import { UserPlus, Shield, Users, Settings } from 'lucide-react-native';

export default function AdminScreen() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const { users, loading, refreshUsers, deleteUser } = useUsers();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'admin')) {
      router.replace('/login');
    }
  }, [user, authLoading]);

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshUsers();
    setRefreshing(false);
  };

  const handleDeleteUser = async (id: string) => {
    Alert.alert(
      'Delete User',
      'Are you sure you want to delete this user?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteUser(id);
              Alert.alert('Success', 'User deleted successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to delete user');
            }
          },
        },
      ]
    );
  };

  if (authLoading || !user || user.role !== 'admin') {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  const adminUsers = users.filter(u => u.role === 'admin');
  const regularUsers = users.filter(u => u.role === 'user');

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }>
        <View style={styles.header}>
          <Text style={styles.title}>Admin Panel</Text>
          <Text style={styles.subtitle}>Manage users and system settings</Text>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Shield size={24} color="#22C55E" />
            <Text style={styles.statValue}>{adminUsers.length}</Text>
            <Text style={styles.statLabel}>Administrators</Text>
          </View>
          <View style={styles.statCard}>
            <Users size={24} color="#16A34A" />
            <Text style={styles.statValue}>{regularUsers.length}</Text>
            <Text style={styles.statLabel}>Regular Users</Text>
          </View>
          <View style={styles.statCard}>
            <Settings size={24} color="#EAB308" />
            <Text style={styles.statValue}>{users.length}</Text>
            <Text style={styles.statLabel}>Total Users</Text>
          </View>
        </View>

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Administrators</Text>
          {adminUsers.map((adminUser) => (
            <UserCard
              key={adminUser.id}
              user={adminUser}
              onEdit={() => router.push(`/user-form?id=${adminUser.id}`)}
              onDelete={() => handleDeleteUser(adminUser.id)}
              canDelete={adminUser.id !== user?.id}
            />
          ))}
        </View>

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Regular Users</Text>
          {regularUsers.map((regularUser) => (
            <UserCard
              key={regularUser.id}
              user={regularUser}
              onEdit={() => router.push(`/user-form?id=${regularUser.id}`)}
              onDelete={() => handleDeleteUser(regularUser.id)}
              canDelete={true}
            />
          ))}
          {regularUsers.length === 0 && (
            <View style={styles.emptyState}>
              <Users size={48} color="#9ca3af" />
              <Text style={styles.emptyText}>No regular users</Text>
              <Text style={styles.emptySubtext}>Add users to get started</Text>
            </View>
          )}
        </View>
      </ScrollView>

      <FloatingActionButton
        icon={UserPlus}
        onPress={() => router.push('/user-form')}
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
  scrollView: {
    flex: 1,
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
  statsContainer: {
    flexDirection: 'row',
    padding: 20,
    paddingTop: 10,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
    textAlign: 'center',
  },
  sectionContainer: {
    padding: 20,
    paddingTop: 0,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
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
  },
});