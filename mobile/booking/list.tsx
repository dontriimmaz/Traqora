import React from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { Booking } from './types';

interface BookingListProps {
  bookings: Booking[];
  onSelectBooking?: (booking: Booking) => void;
}

export const BookingList: React.FC<BookingListProps> = ({ bookings, onSelectBooking }) => {
  if (bookings.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No bookings found.</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={bookings}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={styles.card}
          onPress={() => onSelectBooking && onSelectBooking(item)}
          accessibilityRole="button"
          accessibilityLabel={`Booking reference ${item.bookingReference}, route ${item.route}, departure time ${item.departureTime}, status ${item.status}`}
        >
          <View style={styles.headerRow}>
            <Text style={styles.refText}>Ref: {item.bookingReference}</Text>
            <Text style={[styles.statusText, item.status === 'upcoming' || item.status === 'confirmed' ? styles.upcomingStatus : styles.pastStatus]}>
              {item.status.toUpperCase()}
            </Text>
          </View>
          <Text style={styles.routeText}>{item.route}</Text>
          <Text style={styles.timeText}>Departure: {item.departureTime}</Text>
          <Text style={styles.airlineText}>Airline: {item.airline}</Text>
        </TouchableOpacity>
      )}
    />
  );
};

const styles = StyleSheet.create({
  emptyContainer: {
    padding: 24,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  refText: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#333',
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    overflow: 'hidden',
  },
  upcomingStatus: {
    backgroundColor: '#e6f4ea',
    color: '#137333',
  },
  pastStatus: {
    backgroundColor: '#f1f3f4',
    color: '#5f6368',
  },
  routeText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1a73e8',
    marginBottom: 4,
  },
  timeText: {
    fontSize: 14,
    color: '#555',
    marginBottom: 2,
  },
  airlineText: {
    fontSize: 14,
    color: '#777',
  },
});
