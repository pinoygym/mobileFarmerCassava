import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Calendar, Sprout, TriangleAlert as AlertTriangle } from 'lucide-react-native';

interface Farmer {
  id: string;
  first_name: string;
  last_name: string;
  harvest_date?: string;
  planted_date?: string;
}

interface RecentActivityProps {
  farmers: Farmer[];
}

export function RecentActivity({ farmers }: RecentActivityProps) {
  const getRecentActivity = () => {
    const activities = [];
    const today = new Date();
    
    farmers.forEach(farmer => {
      if (farmer.harvest_date) {
        const harvestDate = new Date(farmer.harvest_date);
        const diffTime = harvestDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays < 0) {
          activities.push({
            id: `harvest-${farmer.id}`,
            type: 'overdue',
            title: `${farmer.first_name} ${farmer.last_name}`,
            description: `Harvest was due ${Math.abs(diffDays)} days ago`,
            icon: AlertTriangle,
            color: '#EF4444',
            time: `${Math.abs(diffDays)} days ago`,
          });
        } else if (diffDays <= 7) {
          activities.push({
            id: `harvest-${farmer.id}`,
            type: 'upcoming',
            title: `${farmer.first_name} ${farmer.last_name}`,
            description: `Harvest due in ${diffDays} days`,
            icon: Calendar,
            color: '#F59E0B',
            time: `In ${diffDays} days`,
          });
        }
      }
    });
    
    return activities.slice(0, 5);
  };

  const activities = getRecentActivity();

  if (activities.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Recent Activity</Text>
      <View style={styles.activitiesList}>
        {activities.map(activity => (
          <View key={activity.id} style={styles.activityItem}>
            <View style={[styles.iconContainer, { backgroundColor: activity.color + '20' }]}>
              <activity.icon size={16} color={activity.color} />
            </View>
            <View style={styles.activityContent}>
              <Text style={styles.activityTitle}>{activity.title}</Text>
              <Text style={styles.activityDescription}>{activity.description}</Text>
            </View>
            <Text style={styles.activityTime}>{activity.time}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    margin: 20,
    marginTop: 0,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  activitiesList: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  activityDescription: {
    fontSize: 12,
    color: '#6b7280',
  },
  activityTime: {
    fontSize: 12,
    color: '#9ca3af',
  },
});