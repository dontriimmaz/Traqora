import React, { useState } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity } from 'react-native';

export interface BookingItem {
  id: string;
  bookingReference: string;
  route: string;
  departureTime: number;
  status: 'upcoming' | 'past' | 'cancelled' | 'completed';
}

interface BookingListProps {
  bookings: BookingItem[];
  onSelectBooking?: (booking: BookingItem) => void;
}

export default function BookingListScreen({ bookings, onSelectBooking }: BookingListProps) {
  const [filter, setFilter] = useState<'upcoming' | 'past'>('upcoming');

  const now = Math.floor(Date.now() / 1000);

  const filteredBookings = bookings.filter((item) => {
    if (filter === 'upcoming') {
      return item.departureTime >= now && item.status !== 'cancelled' && item.status !== 'completed';
    } else {
      return item.departureTime < now || item.status === 'cancelled' || item.status === 'completed';
    }
  });

  const renderItem = ({ item }: { item: BookingItem }) => (
    <TouchableOpacity
      style={styles.card}
      testID={`booking-card-${item.id}`}
      onPress={() => onSelectBooking && onSelectBooking(item)}
    >
      <View style={styles.headerRow}>
        <Text style={styles.refText}>Ref: {item.bookingReference}</Text>
        <Text style={[styles.statusText, item.status === 'upcoming' ? styles.upcoming : styles.past]}>
          {item.status.toUpperCase()}
        </Text>
      </View>
      <Text style={styles.routeText}>Route: {item.route}</Text>
      <Text style={styles.timeText}>Departure: {new Date(item.departureTime * 1000).toLocaleString()}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container} testID="booking-list-screen">
      <View style={styles.tabRow}>
        <TouchableOpacity
          style={[styles.tab, filter === 'upcoming' && styles.activeTab]}
          onPress={() => setFilter('upcoming')}
          testID="tab-upcoming"
        >
          <Text style={[styles.tabText, filter === 'upcoming' && styles.activeTabText]}>Upcoming</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, filter === 'past' && styles.activeTab]}
          onPress={() => setFilter('past')}
          testID="tab-past"
        >
          <Text style={[styles.tabText, filter === 'past' && styles.activeTabText]}>Past</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredBookings}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={<Text style={styles.emptyText} testID="empty-bookings">No bookings found.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  tabRow: {
    flexDirection: 'row',
    marginBottom: 16,
    borderRadius: 8,
    backgroundColor: '#e0e0e0',
    overflow: 'hidden',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#007AFF',
  },
  tabText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
  },
  activeTabText: {
    color: '#fff',
  },
  listContainer: {
    paddingBottom: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  refText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
    paddingHorizontal: 8,
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
    color: '#555',
    marginBottom: 4,
  },
  timeText: {
    fontSize: 12,
    color: '#777',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 32,
    fontSize: 16,
    color: '#888',
  },
});
