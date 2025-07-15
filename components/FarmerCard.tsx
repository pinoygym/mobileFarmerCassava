import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MapPin, Phone, Calendar, CreditCard as Edit, Trash2 } from 'lucide-react-native';

interface Farmer {
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
}

interface FarmerCardProps {
  farmer: Farmer;
  onEdit: () => void;
  onDelete: () => void;
}

export function FarmerCard({ farmer, onEdit, onDelete }: FarmerCardProps) {
  const getHarvestStatus = () => {
    if (!farmer.harvest_date) return null;
    
    const harvestDate = new Date(farmer.harvest_date);
    const today = new Date();
    const diffTime = harvestDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return { text: 'Overdue', color: '#EF4444' };
    } else if (diffDays <= 7) {
      return { text: 'Due Soon', color: '#F59E0B' };
    } else if (diffDays <= 30) {
      return { text: 'Upcoming', color: '#EAB308' };
    }
    return null;
  };

  const harvestStatus = getHarvestStatus();

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.nameContainer}>
          <Text style={styles.name}>
            {farmer.first_name} {farmer.middle_initial && `${farmer.middle_initial}. `}{farmer.last_name}
          </Text>
          {harvestStatus && (
            <View style={[styles.statusBadge, { backgroundColor: harvestStatus.color + '20' }]}>
              <Text style={[styles.statusText, { color: harvestStatus.color }]}>
                {harvestStatus.text}
              </Text>
            </View>
          )}
        </View>
        <View style={styles.actions}>
          <TouchableOpacity onPress={onEdit} style={styles.actionButton}>
            <Edit size={16} color="#6b7280" />
          </TouchableOpacity>
          <TouchableOpacity onPress={onDelete} style={styles.actionButton}>
            <Trash2 size={16} color="#EF4444" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.info}>
        <View style={styles.infoRow}>
          <MapPin size={16} color="#6b7280" />
          <Text style={styles.infoText}>
            {farmer.barangay}, {farmer.town}
          </Text>
        </View>
        
        {farmer.contact_number && (
          <View style={styles.infoRow}>
            <Phone size={16} color="#6b7280" />
            <Text style={styles.infoText}>{farmer.contact_number}</Text>
          </View>
        )}
        
        {farmer.land_area && (
          <View style={styles.infoRow}>
            <Text style={styles.landArea}>{farmer.land_area} hectares</Text>
          </View>
        )}
        
        {farmer.harvest_date && (
          <View style={styles.infoRow}>
            <Calendar size={16} color="#6b7280" />
            <Text style={styles.infoText}>
              Harvest: {new Date(farmer.harvest_date).toLocaleDateString()}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  nameContainer: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f9fafb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    gap: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#6b7280',
  },
  landArea: {
    fontSize: 14,
    color: '#22C55E',
    fontWeight: '600',
  },
});