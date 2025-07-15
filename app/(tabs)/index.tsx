import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { DashboardCard } from '@/components/DashboardCard';
import { KPICard } from '@/components/KPICard';
import { RecentActivity } from '@/components/RecentActivity';
import { useAuth } from '@/hooks/useAuth';
import { useFarmers } from '@/hooks/useFarmers';
import { Users, Sprout, Calendar, MapPin, TrendingUp, TriangleAlert as AlertTriangle, ChartBar as BarChart3 } from 'lucide-react-native';

export default function DashboardScreen() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const { farmers, loading, refreshFarmers } = useFarmers();
  const [refreshing, setRefreshing] = useState(false);

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

  if (authLoading || !user) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  // Calculate KPIs
  const totalFarmers = farmers.length;
  const totalHectares = farmers.reduce((sum, farmer) => sum + (farmer.land_area || 0), 0);
  const avgLandSize = totalFarmers > 0 ? totalHectares / totalFarmers : 0;
  
  // Get upcoming harvests (within 30 days)
  const upcomingHarvests = farmers.filter(farmer => {
    if (!farmer.harvest_date) return false;
    const harvestDate = new Date(farmer.harvest_date);
    const today = new Date();
    const diffTime = harvestDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 30;
  }).length;

  // Get overdue harvests
  const overdueHarvests = farmers.filter(farmer => {
    if (!farmer.harvest_date) return false;
    const harvestDate = new Date(farmer.harvest_date);
    const today = new Date();
    return harvestDate < today;
  }).length;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }>
        <View style={styles.header}>
          <Text style={styles.title}>Dashboard</Text>
          <Text style={styles.subtitle}>Welcome back, {user.username}!</Text>
        </View>

        <View style={styles.kpiContainer}>
          <KPICard
            title="Total Farmers"
            value={totalFarmers.toString()}
            icon={Users}
            color="#22C55E"
          />
          <KPICard
            title="Total Land Area"
            value={`${totalHectares.toFixed(1)} ha`}
            icon={MapPin}
            color="#16A34A"
          />
          <KPICard
            title="Avg Land Size"
            value={`${avgLandSize.toFixed(1)} ha`}
            icon={TrendingUp}
            color="#EAB308"
          />
          <KPICard
            title="Upcoming Harvests"
            value={upcomingHarvests.toString()}
            icon={Calendar}
            color="#F59E0B"
          />
        </View>

        <View style={styles.dashboardGrid}>
          <DashboardCard
            title="Manage Farmers"
            description="Add, edit, and view farmer information"
            icon={Users}
            color="#22C55E"
            onPress={() => router.push('/(tabs)/farmers')}
          />
          <DashboardCard
            title="View Reports"
            description="Generate and view detailed reports"
            icon={BarChart3}
            color="#16A34A"
            onPress={() => router.push('/(tabs)/reports')}
          />
          <DashboardCard
            title="Plant Calendar"
            description="Track planting and harvest dates"
            icon={Sprout}
            color="#EAB308"
            onPress={() => router.push('/(tabs)/farmers')}
          />
        </View>

        {overdueHarvests > 0 && (
          <View style={styles.alertContainer}>
            <AlertTriangle size={20} color="#EF4444" />
            <Text style={styles.alertText}>
              {overdueHarvests} harvest(s) are overdue
            </Text>
          </View>
        )}

        <RecentActivity farmers={farmers} />
      </ScrollView>
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
  kpiContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 20,
    paddingTop: 10,
    gap: 12,
  },
  dashboardGrid: {
    padding: 20,
    paddingTop: 10,
    gap: 12,
  },
  alertContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    margin: 20,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  alertText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#DC2626',
    fontWeight: '600',
  },
});