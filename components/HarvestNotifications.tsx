import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Bell, Calendar, TriangleAlert as AlertTriangle } from 'lucide-react-native';
import { useFarmers } from '@/hooks/useFarmers';
import { getDaysUntilHarvest, formatDate } from '@/utils/dateHelpers';

export function HarvestNotifications() {
  const { farmers } = useFarmers();

  const getNotifications = () => {
    const notifications = [];
    const today = new Date();

    farmers.forEach(farmer => {
      if (!farmer.harvest_date) return;

      const days = getDaysUntilHarvest(farmer.harvest_date);
      
      if (days < 0) {
        notifications.push({
          id: farmer.id,
          type: 'overdue',
          farmer: `${farmer.first_name} ${farmer.last_name}`,
          message: `Harvest was due ${Math.abs(days)} days ago`,
          date: farmer.harvest_date,
          priority: 'high',
        });
      } else if (days <= 3) {
        notifications.push({
          id: farmer.id,
          type: 'urgent',
          farmer: `${farmer.first_name} ${farmer.last_name}`,
          message: `Harvest due in ${days} day${days !== 1 ? 's' : ''}`,
          date: farmer.harvest_date,
          priority: 'high',
        });
      } else if (days <= 7) {
        notifications.push({
          id: farmer.id,
          type: 'upcoming',
          farmer: `${farmer.first_name} ${farmer.last_name}`,
          message: `Harvest due this week`,
          date: farmer.harvest_date,
          priority: 'medium',
        });
      }
    });

    return notifications.sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  };

  const notifications = getNotifications();

  if (notifications.length === 0) {
    return null;
  }

  const showAllNotifications = () => {
    const message = notifications
      .map(n => `• ${n.farmer}: ${n.message}`)
      .join('\n');
    
    Alert.alert('Harvest Notifications', message);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.header} onPress={showAllNotifications}>
        <Bell size={20} color="#F59E0B" />
        <Text style={styles.title}>
          Harvest Notifications ({notifications.length})
        </Text>
      </TouchableOpacity>
      
      <View style={styles.notificationsList}>
        {notifications.slice(0, 3).map(notification => (
          <View key={notification.id} style={styles.notificationItem}>
            <View style={[
              styles.iconContainer,
              { backgroundColor: notification.type === 'overdue' ? '#FEF2F2' : '#FEF3C7' }
            ]}>
              {notification.type === 'overdue' ? (
                <AlertTriangle size={16} color="#EF4444" />
              ) : (
                <Calendar size={16} color="#F59E0B" />
              )}
            </View>
            <View style={styles.notificationContent}>
              <Text style={styles.farmerName}>{notification.farmer}</Text>
              <Text style={styles.notificationMessage}>{notification.message}</Text>
              <Text style={styles.notificationDate}>
                {formatDate(notification.date)}
              </Text>
            </View>
          </View>
        ))}
        
        {notifications.length > 3 && (
          <TouchableOpacity style={styles.showMoreButton} onPress={showAllNotifications}>
            <Text style={styles.showMoreText}>
              Show {notifications.length - 3} more notifications
            </Text>
          </TouchableOpacity>
        )}
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginLeft: 8,
  },
  notificationsList: {
    padding: 16,
    paddingTop: 0,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f9fafb',
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
  },
  farmerName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  notificationMessage: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 2,
  },
  notificationDate: {
    fontSize: 12,
    color: '#9ca3af',
  },
  showMoreButton: {
    paddingVertical: 8,
    alignItems: 'center',
  },
  showMoreText: {
    fontSize: 14,
    color: '#22C55E',
    fontWeight: '600',
  },
});