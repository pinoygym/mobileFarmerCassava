import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { useFarmers } from '@/hooks/useFarmers';
import { ArrowLeft, Save, User, MapPin, Calendar, Sprout } from 'lucide-react-native';

export default function FarmerFormScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { user, isLoading: authLoading } = useAuth();
  const { farmers, createFarmer, updateFarmer } = useFarmers();
  
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    middle_initial: '',
    location_group: '',
    barangay: '',
    town: '',
    contact_number: '',
    land_area: '',
    planted_date: '',
    harvest_date: '',
  });
  
  const [loading, setLoading] = useState(false);
  const isEditing = !!id;

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/login');
    }
  }, [user, authLoading]);

  useEffect(() => {
    if (isEditing && id) {
      const farmer = farmers.find(f => f.id === id);
      if (farmer) {
        setFormData({
          first_name: farmer.first_name,
          last_name: farmer.last_name,
          middle_initial: farmer.middle_initial || '',
          location_group: farmer.location_group,
          barangay: farmer.barangay,
          town: farmer.town,
          contact_number: farmer.contact_number,
          land_area: farmer.land_area?.toString() || '',
          planted_date: farmer.planted_date || '',
          harvest_date: farmer.harvest_date || '',
        });
      }
    }
  }, [isEditing, id, farmers]);

  const handleSave = async () => {
    if (!formData.first_name || !formData.last_name || !formData.town || !formData.barangay) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const farmerData = {
        ...formData,
        land_area: parseFloat(formData.land_area) || 0,
      };

      if (isEditing) {
        await updateFarmer(id as string, farmerData);
        Alert.alert('Success', 'Farmer updated successfully');
      } else {
        await createFarmer(farmerData);
        Alert.alert('Success', 'Farmer created successfully');
      }
      
      router.back();
    } catch (error) {
      Alert.alert('Error', 'Failed to save farmer');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  if (authLoading || !user) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.title}>
          {isEditing ? 'Edit Farmer' : 'Add New Farmer'}
        </Text>
        <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
          <Save size={20} color="#ffffff" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <User size={20} color="#22C55E" />
            <Text style={styles.sectionTitle}>Personal Information</Text>
          </View>
          
          <View style={styles.row}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>First Name *</Text>
              <TextInput
                style={styles.input}
                value={formData.first_name}
                onChangeText={(text) => setFormData({...formData, first_name: text})}
                placeholder="Enter first name"
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>M.I.</Text>
              <TextInput
                style={styles.input}
                value={formData.middle_initial}
                onChangeText={(text) => setFormData({...formData, middle_initial: text})}
                placeholder="M.I."
                maxLength={1}
              />
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Last Name *</Text>
            <TextInput
              style={styles.input}
              value={formData.last_name}
              onChangeText={(text) => setFormData({...formData, last_name: text})}
              placeholder="Enter last name"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Contact Number</Text>
            <TextInput
              style={styles.input}
              value={formData.contact_number}
              onChangeText={(text) => setFormData({...formData, contact_number: text})}
              placeholder="Enter contact number"
              keyboardType="phone-pad"
            />
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MapPin size={20} color="#22C55E" />
            <Text style={styles.sectionTitle}>Location Information</Text>
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Location Group</Text>
            <TextInput
              style={styles.input}
              value={formData.location_group}
              onChangeText={(text) => setFormData({...formData, location_group: text})}
              placeholder="Enter location group"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Barangay *</Text>
            <TextInput
              style={styles.input}
              value={formData.barangay}
              onChangeText={(text) => setFormData({...formData, barangay: text})}
              placeholder="Enter barangay"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Town *</Text>
            <TextInput
              style={styles.input}
              value={formData.town}
              onChangeText={(text) => setFormData({...formData, town: text})}
              placeholder="Enter town"
            />
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Sprout size={20} color="#22C55E" />
            <Text style={styles.sectionTitle}>Farm Information</Text>
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Land Area (hectares)</Text>
            <TextInput
              style={styles.input}
              value={formData.land_area}
              onChangeText={(text) => setFormData({...formData, land_area: text})}
              placeholder="Enter land area"
              keyboardType="numeric"
            />
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Calendar size={20} color="#22C55E" />
            <Text style={styles.sectionTitle}>Planting Schedule</Text>
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Planted Date</Text>
            <TextInput
              style={styles.input}
              value={formData.planted_date}
              onChangeText={(text) => setFormData({...formData, planted_date: text})}
              placeholder="YYYY-MM-DD"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Harvest Date</Text>
            <TextInput
              style={styles.input}
              value={formData.harvest_date}
              onChangeText={(text) => setFormData({...formData, harvest_date: text})}
              placeholder="YYYY-MM-DD"
            />
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handleSave}
          disabled={loading}>
          <Save size={20} color="#ffffff" />
          <Text style={styles.submitButtonText}>
            {loading ? 'Saving...' : isEditing ? 'Update Farmer' : 'Create Farmer'}
          </Text>
        </TouchableOpacity>
      </View>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f9fafb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  saveButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#22C55E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  section: {
    backgroundColor: '#ffffff',
    margin: 20,
    marginBottom: 0,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginLeft: 8,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  inputContainer: {
    flex: 1,
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111827',
    backgroundColor: '#ffffff',
  },
  footer: {
    padding: 20,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#22C55E',
    paddingVertical: 16,
    borderRadius: 12,
  },
  submitButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});