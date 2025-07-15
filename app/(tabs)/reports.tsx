import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ReportCard } from '@/components/ReportCard';
import { StatCard } from '@/components/StatCard';
import { LocationBreakdown } from '@/components/LocationBreakdown';
import { HarvestCalendar } from '@/components/HarvestCalendar';
import { useAuth } from '@/hooks/useAuth';
import { useFarmers } from '@/hooks/useFarmers';
import { ChartBar as BarChart3, TrendingUp, Calendar, MapPin, Users, Sprout } from 'lucide-react-native';

export default function ReportsScreen() {
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

  // Calculate statistics
  const totalFarmers = farmers.length;
  const totalLandArea = farmers.reduce((sum, farmer) => sum + (farmer.land_area || 0), 0);
  const avgLandArea = totalFarmers > 0 ? totalLandArea / totalFarmers : 0;
  
  // Group by town
  const townGroups = farmers.reduce((acc, farmer) => {
    acc[farmer.town] = (acc[farmer.town] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Group by barangay
  const barangayGroups = farmers.reduce((acc, farmer) => {
    acc[farmer.barangay] = (acc[farmer.barangay] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Calculate harvest statistics
  const currentDate = new Date();
  const upcomingHarvests = farmers.filter(farmer => {
    if (!farmer.harvest_date) return false;
    const harvestDate = new Date(farmer.harvest_date);
    const diffTime = harvestDate.getTime() - currentDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 30;
  });

  const overdueHarvests = farmers.filter(farmer => {
    if (!farmer.harvest_date) return false;
    const harvestDate = new Date(farmer.harvest_date);
    return harvestDate < currentDate;
  });

  const harvestableFarmers = farmers.filter(farmer => {
    if (!farmer.harvest_date) return false;
    const harvestDate = new Date(farmer.harvest_date);
    const diffTime = harvestDate.getTime() - currentDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= -7 && diffDays <= 7; // Within a week
  });

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }>
        <View style={styles.header}>
          <Text style={styles.title}>Reports & Analytics</Text>
          <Text style={styles.subtitle}>Comprehensive farm management insights</Text>
        </View>

        <View style={styles.statsContainer}>
          <StatCard
            title="Total Farmers"
            value={totalFarmers.toString()}
            icon={Users}
            color="#22C55E"
          />
          <StatCard
            title="Total Land Area"
            value={`${totalLandArea.toFixed(1)} ha`}
            icon={MapPin}
            color="#16A34A"
          />
          <StatCard
            title="Average Land Size"
            value={`${avgLandArea.toFixed(1)} ha`}
            icon={TrendingUp}
            color="#EAB308"
          />
          <StatCard
            title="Upcoming Harvests"
            value={upcomingHarvests.length.toString()}
            icon={Calendar}
            color="#F59E0B"
          />
        </View>

        <View style={styles.reportsContainer}>
          <ReportCard
            title="Location Analysis"
            description={`Distribution across ${Object.keys(townGroups).length} towns`}
            icon={MapPin}
            color="#22C55E"
          />
          <ReportCard
            title="Harvest Timeline"
            description={`${overdueHarvests.length} overdue, ${upcomingHarvests.length} upcoming`}
            icon={Calendar}
            color="#F59E0B"
          />
          <ReportCard
            title="Production Metrics"
            description={`${harvestableFarmers.length} farms ready for harvest`}
            icon={Sprout}
            color="#16A34A"
          />
        </View>

        <LocationBreakdown
          title="Distribution by Town"
          data={townGroups}
          color="#22C55E"
        />

        <LocationBreakdown
          title="Distribution by Barangay"
          data={barangayGroups}
          color="#16A34A"
        />

        <HarvestCalendar farmers={farmers} />

        <View style={styles.summaryContainer}>
          <Text style={styles.summaryTitle}>Summary</Text>
          <View style={styles.summaryGrid}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Active Farmers</Text>
              <Text style={styles.summaryValue}>{totalFarmers}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Total Hectares</Text>
              <Text style={styles.summaryValue}>{totalLandArea.toFixed(1)}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Towns Covered</Text>
              <Text style={styles.summaryValue}>{Object.keys(townGroups).length}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Barangays Covered</Text>
              <Text style={styles.summaryValue}>{Object.keys(barangayGroups).length}</Text>
            </View>
          </View>
        </View>
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
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 20,
    paddingTop: 10,
    gap: 12,
  },
  reportsContainer: {
    padding: 20,
    paddingTop: 10,
    gap: 12,
  },
  summaryContainer: {
    margin: 20,
    padding: 20,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  summaryItem: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#22C55E',
  },
});