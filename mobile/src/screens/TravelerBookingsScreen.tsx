import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { Booking } from '../../booking/types';
import { BookingList } from '../../booking/list';

export const TravelerBookingsScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');

  const [bookings] = useState<Booking[]>([
    {
      id: '1',
      bookingReference: 'TRQ-9812',
      route: 'JFK -> LAX',
      departureTime: '2025-12-01 08:30 AM',
      status: 'upcoming',
      airline: 'Traqora Air',
      price: '250 USDC',
    },
    {
      id: '2',
      bookingReference: 'TRQ-4431',
      route: 'SFO -> JFK',
      departureTime: '2023-05-15 02:00 PM',
      status: 'past',
      airline: 'Traqora Air',
      price: '300 USDC',
    },
  ]);

  const filteredBookings = bookings.filter((b) => {
    if (activeTab === 'upcoming') {
      return b.status === 'upcoming' || b.status === 'confirmed';
    }
    return b.status === 'past' || b.status === 'completed' || b.status === 'cancelled' || b.status === 'refunded';
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Bookings</Text>
      </View>
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'upcoming' && styles.activeTab]}
          onPress={() => setActiveTab('upcoming')}
          accessibilityRole="button"
        >
          <Text style={[styles.tabText, activeTab === 'upcoming' && styles.activeTabText]}>Upcoming</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'past' && styles.activeTab]}
          onPress={() => setActiveTab('past')}
          accessibilityRole="button"
        >
          <Text style={[styles.tabText, activeTab === 'past' && styles.activeTabText]}>Past</Text>
        </TouchableOpacity>
      </View>
      <BookingList bookings={filteredBookings} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#202124',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#1a73e8',
  },
  tabText: {
    fontSize: 16,
    color: '#5f6368',
  },
  activeTabText: {
    color: '#1a73e8',
    fontWeight: 'bold',
  },
});
