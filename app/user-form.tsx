import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { useUsers } from '@/hooks/useUsers';
import { ArrowLeft, Save, User, Lock, Shield } from 'lucide-react-native';

export default function UserFormScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { user, isLoading: authLoading } = useAuth();
  const { users, createUser, updateUser } = useUsers();
  
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    role: 'user',
  });
  
  const [loading, setLoading] = useState(false);
  const isEditing = !!id;

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'admin')) {
      router.replace('/login');
    }
  }, [user, authLoading]);

  useEffect(() => {
    if (isEditing && id) {
      const userToEdit = users.find(u => u.id === id);
      if (userToEdit) {
        setFormData({
          username: userToEdit.username,
          password: '',
          role: userToEdit.role,
        });
      }
    }
  }, [isEditing, id, users]);

  const handleSave = async () => {
    if (!formData.username || (!isEditing && !formData.password)) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const userData = {
        username: formData.username,
        role: formData.role,
        ...(formData.password && { password: formData.password }),
      };

      if (isEditing) {
        await updateUser(id as string, userData);
        Alert.alert('Success', 'User updated successfully');
      } else {
        await createUser(userData);
        Alert.alert('Success', 'User created successfully');
      }
      
      router.back();
    } catch (error) {
      Alert.alert('Error', 'Failed to save user');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || !user || user.role !== 'admin') {
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
          {isEditing ? 'Edit User' : 'Add New User'}
        </Text>
        <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
          <Save size={20} color="#ffffff" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <User size={20} color="#22C55E" />
            <Text style={styles.sectionTitle}>User Information</Text>
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Username *</Text>
            <TextInput
              style={styles.input}
              value={formData.username}
              onChangeText={(text) => setFormData({...formData, username: text})}
              placeholder="Enter username"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>
              Password {isEditing ? '(leave blank to keep current)' : '*'}
            </Text>
            <TextInput
              style={styles.input}
              value={formData.password}
              onChangeText={(text) => setFormData({...formData, password: text})}
              placeholder="Enter password"
              secureTextEntry
            />
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Shield size={20} color="#22C55E" />
            <Text style={styles.sectionTitle}>Role & Permissions</Text>
          </View>
          
          <View style={styles.roleContainer}>
            <TouchableOpacity
              style={[styles.roleButton, formData.role === 'admin' && styles.roleButtonActive]}
              onPress={() => setFormData({...formData, role: 'admin'})}>
              <Shield size={16} color={formData.role === 'admin' ? '#ffffff' : '#6b7280'} />
              <Text style={[styles.roleButtonText, formData.role === 'admin' && styles.roleButtonTextActive]}>
                Administrator
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.roleButton, formData.role === 'user' && styles.roleButtonActive]}
              onPress={() => setFormData({...formData, role: 'user'})}>
              <User size={16} color={formData.role === 'user' ? '#ffffff' : '#6b7280'} />
              <Text style={[styles.roleButtonText, formData.role === 'user' && styles.roleButtonTextActive]}>
                Regular User
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.permissionsInfo}>
            <Text style={styles.permissionsTitle}>Permissions</Text>
            {formData.role === 'admin' ? (
              <Text style={styles.permissionsText}>
                • Full access to all features{'\n'}
                • User management{'\n'}
                • System configuration{'\n'}
                • All farmer operations
              </Text>
            ) : (
              <Text style={styles.permissionsText}>
                • View and manage farmers{'\n'}
                • Generate reports{'\n'}
                • Access dashboard
              </Text>
            )}
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
            {loading ? 'Saving...' : isEditing ? 'Update User' : 'Create User'}
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
  inputContainer: {
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
  roleContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  roleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
    backgroundColor: '#ffffff',
  },
  roleButtonActive: {
    backgroundColor: '#22C55E',
    borderColor: '#22C55E',
  },
  roleButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
    marginLeft: 8,
  },
  roleButtonTextActive: {
    color: '#ffffff',
  },
  permissionsInfo: {
    backgroundColor: '#f8fafc',
    padding: 16,
    borderRadius: 8,
  },
  permissionsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  permissionsText: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
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