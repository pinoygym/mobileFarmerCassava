import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface LocationBreakdownProps {
  title: string;
  data: Record<string, number>;
  color: string;
}

export function LocationBreakdown({ title, data, color }: LocationBreakdownProps) {
  const sortedData = Object.entries(data).sort((a, b) => b[1] - a[1]);
  const maxValue = Math.max(...Object.values(data));

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.chart}>
        {sortedData.map(([location, count]) => (
          <View key={location} style={styles.bar}>
            <View style={styles.barInfo}>
              <Text style={styles.barLabel}>{location}</Text>
              <Text style={styles.barValue}>{count}</Text>
            </View>
            <View style={styles.barTrack}>
              <View
                style={[
                  styles.barFill,
                  {
                    width: `${(count / maxValue) * 100}%`,
                    backgroundColor: color,
                  },
                ]}
              />
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
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  chart: {
    gap: 12,
  },
  bar: {
    gap: 8,
  },
  barInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  barLabel: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  barValue: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '600',
  },
  barTrack: {
    height: 8,
    backgroundColor: '#f3f4f6',
    borderRadius: 4,
  },
  barFill: {
    height: '100%',
    borderRadius: 4,
  },
});