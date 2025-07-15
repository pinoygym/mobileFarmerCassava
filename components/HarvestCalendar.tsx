import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Calendar } from 'lucide-react-native';

interface Farmer {
  id: string;
  first_name: string;
  last_name: string;
  harvest_date?: string;
}

interface HarvestCalendarProps {
  farmers: Farmer[];
}

export function HarvestCalendar({ farmers }: HarvestCalendarProps) {
  const getHarvestSchedule = () => {
    const schedule = farmers
      .filter(farmer => farmer.harvest_date)
      .map(farmer => ({
        ...farmer,
        harvestDate: new Date(farmer.harvest_date!),
      }))
      .sort((a, b) => a.harvestDate.getTime() - b.harvestDate.getTime());

    const today = new Date();
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    return schedule.filter(item => item.harvestDate >= today && item.harvestDate <= nextWeek);
  };

  const upcomingHarvests = getHarvestSchedule();

  if (upcomingHarvests.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Calendar size={20} color="#22C55E" />
        <Text style={styles.title}>Upcoming Harvests (Next 7 Days)</Text>
      </View>
      <View style={styles.schedule}>
        {upcomingHarvests.map(farmer => (
          <View key={farmer.id} style={styles.scheduleItem}>
            <View style={styles.dateContainer}>
              <Text style={styles.dateText}>
                {farmer.harvestDate.toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric' 
                })}
              </Text>
            </View>
            <View style={styles.farmerInfo}>
              <Text style={styles.farmerName}>
                {farmer.first_name} {farmer.last_name}
              </Text>
              <Text style={styles.farmerTime}>
                {farmer.harvestDate.toLocaleDateString('en-US', { 
                  weekday: 'long' 
                })}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    margin: 20,
    marginTop: 0,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginLeft: 8,
  },
  schedule: {
    gap: 12,
  },
  scheduleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  dateContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#f0fdf4',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  dateText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#22C55E',
  },
  farmerInfo: {
    flex: 1,
  },
  farmerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  farmerTime: {
    fontSize: 14,
    color: '#6b7280',
  },
});