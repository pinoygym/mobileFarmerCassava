import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Video as LucideIcon } from 'lucide-react-native';

interface FloatingActionButtonProps {
  icon: LucideIcon;
  onPress: () => void;
}

export function FloatingActionButton({ icon: Icon, onPress }: FloatingActionButtonProps) {
  return (
    <TouchableOpacity style={styles.fab} onPress={onPress}>
      <Icon size={24} color="#ffffff" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#22C55E',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
});