import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Shield, User, CreditCard as Edit, Trash2 } from 'lucide-react-native';

interface UserType {
  id: string;
  username: string;
  role: string;
  created_at?: string;
}

interface UserCardProps {
  user: UserType;
  onEdit: () => void;
  onDelete: () => void;
  canDelete: boolean;
}

export function UserCard({ user, onEdit, onDelete, canDelete }: UserCardProps) {
  const isAdmin = user.role === 'admin';

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <View style={styles.nameContainer}>
            <Text style={styles.username}>{user.username}</Text>
            <View style={[styles.roleBadge, { backgroundColor: isAdmin ? '#22C55E20' : '#6b728020' }]}>
              {isAdmin ? <Shield size={12} color="#22C55E" /> : <User size={12} color="#6b7280" />}
              <Text style={[styles.roleText, { color: isAdmin ? '#22C55E' : '#6b7280' }]}>
                {user.role}
              </Text>
            </View>
          </View>
          {user.created_at && (
            <Text style={styles.createdAt}>
              Created: {new Date(user.created_at).toLocaleDateString()}
            </Text>
          )}
        </View>
        <View style={styles.actions}>
          <TouchableOpacity onPress={onEdit} style={styles.actionButton}>
            <Edit size={16} color="#6b7280" />
          </TouchableOpacity>
          {canDelete && (
            <TouchableOpacity onPress={onDelete} style={styles.actionButton}>
              <Trash2 size={16} color="#EF4444" />
            </TouchableOpacity>
          )}
        </View>
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
  },
  userInfo: {
    flex: 1,
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  username: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginRight: 12,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  roleText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
    textTransform: 'capitalize',
  },
  createdAt: {
    fontSize: 12,
    color: '#6b7280',
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
});