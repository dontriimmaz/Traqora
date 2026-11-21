import React from 'react';
import { render } from '@testing-library/react-native';
import { BookingList, BookingItem } from '../booking/BookingList';

describe('BookingList', () => {
  const mockBookings: BookingItem[] = [
    {
      id: '1',
      bookingReference: 'TRQ-1001',
      route: 'JFK -> LAX',
      departureTime: 2000000000,
      status: 'confirmed',
    },
    {
      id: '2',
      bookingReference: 'TRQ-1002',
      route: 'ORD -> MIA',
      departureTime: 1000000000,
      status: 'completed',
    },
  ];

  it('renders upcoming and past bookings with correct details', () => {
    const { getByText } = render(<BookingList bookings={mockBookings} />);
    
    expect(getByText('Ref: TRQ-1001')).toBeTruthy();
    expect(getByText('Route: JFK -> LAX')).toBeTruthy();
    expect(getByText('CONFIRMED')).toBeTruthy();

    expect(getByText('Ref: TRQ-1002')).toBeTruthy();
    expect(getByText('Route: ORD -> MIA')).toBeTruthy();
    expect(getByText('COMPLETED')).toBeTruthy();
  });

  it('renders empty state when no bookings are provided', () => {
    const { getByText } = render(<BookingList bookings={[]} />);
    expect(getByText('No bookings found.')).toBeTruthy();
  });
});
