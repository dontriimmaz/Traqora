import React from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';

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
  const now = Date.now() / 1000;

  const renderItem = ({ item }: { item: BookingItem }) => {
    const isUpcoming = item.departureTime >= now || item.status === 'upcoming' || item.status === 'confirmed';
    const sectionTitle = isUpcoming ? 'Upcoming Bookings' : 'Past Bookings';

    return (
      <TouchableOpacity
        style={styles.card}
        accessibilityRole="button"
        accessibilityLabel={`Booking ${item.bookingReference}, route ${item.route}, status ${item.status}`}
        onPress={() => onSelectBooking && onSelectBooking(item)}
      >
        <View style={styles.headerRow}>
          <Text style={styles.refText}>Ref: {item.bookingReference}</Text>
          <Text style={[styles.statusText, isUpcoming ? styles.upcomingStatus : styles.pastStatus]}>
            {item.status.toUpperCase()}
          </Text>
        </View>
        <Text style={styles.routeText}>Route: {item.route}</Text>
        <Text style={styles.timeText}>Departure: {new Date(item.departureTime * 1000).toLocaleString()}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Bookings</Text>
      <FlatList
        data={bookings}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListEmptyComponent={<Text style={styles.emptyText}>No bookings found.</Text>}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#111',
  },
  card: {
    backgroundColor: '#f9f9f9',
    padding: 14,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#eee',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  refText: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#333',
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    overflow: 'hidden',
  },
  upcomingStatus: {
    backgroundColor: '#e3f2fd',
    color: '#1565c0',
  },
  pastStatus: {
    backgroundColor: '#f5f5f5',
    color: '#616161',
  },
  routeText: {
    fontSize: 14,
    color: '#444',
    marginBottom: 4,
  },
  timeText: {
    fontSize: 12,
    color: '#666',
  },
  emptyText: {
    textAlign: 'center',
    color: '#888',
    marginTop: 20,
  },
});
