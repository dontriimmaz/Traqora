import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';

export interface BookingItem {
  id: string;
  bookingReference: string;
  route: string;
  departureTime: number;
  status: 'upcoming' | 'past' | 'confirmed' | 'completed' | 'refunded' | 'cancelled';
}

interface BookingListProps {
  bookings: BookingItem[];
  onSelectBooking?: (booking: BookingItem) => void;
}

export const BookingList: React.FC<BookingListProps> = ({ bookings, onSelectBooking }) => {
  const renderBooking = ({ item }: { item: BookingItem }) => {
    const isUpcoming = item.status === 'upcoming' || item.status === 'confirmed';
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => onSelectBooking && onSelectBooking(item)}
        testID={`booking-card-${item.id}`}
      >
        <View style={styles.headerRow}>
          <Text style={styles.refText}>Ref: {item.bookingReference}</Text>
          <Text style={[styles.statusText, isUpcoming ? styles.upcoming : styles.past]}>
            {item.status.toUpperCase()}
          </Text>
        </View>
        <Text style={styles.routeText}>Route: {item.route}</Text>
        <Text style={styles.timeText}>Departure: {new Date(item.departureTime * 1000).toUTCString()}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container} testID="booking-list-container">
      <FlatList
        data={bookings}
        keyExtractor={(item) => item.id}
        renderItem={renderBooking}
        ListEmptyComponent={<Text style={styles.emptyText}>No bookings found</Text>}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  refText: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#333333',
  },
  statusText: {
    fontWeight: '600',
    fontSize: 12,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    overflow: 'hidden',
  },
  upcoming: {
    backgroundColor: '#e6f4ea',
    color: '#137333',
  },
  past: {
    backgroundColor: '#f1f3f4',
    color: '#5f6368',
  },
  routeText: {
    fontSize: 14,
    color: '#444444',
    marginBottom: 4,
  },
  timeText: {
    fontSize: 12,
    color: '#666666',
  },
  emptyText: {
    textAlign: 'center',
    color: '#888888',
    marginTop: 24,
  },
});
