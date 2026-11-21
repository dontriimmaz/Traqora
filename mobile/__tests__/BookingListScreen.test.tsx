import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import BookingListScreen, { BookingItem } from '../booking/BookingListScreen';

describe('BookingListScreen', () => {
  const now = Math.floor(Date.now() / 1000);
  const mockBookings: BookingItem[] = [
    {
      id: '1',
      bookingReference: 'TRQ1001',
      route: 'JFK -> LAX',
      departureTime: now + 86400,
      status: 'upcoming',
    },
    {
      id: '2',
      bookingReference: 'TRQ1002',
      route: 'LHR -> JFK',
      departureTime: now - 86400,
      status: 'past',
    },
  ];

  it('renders upcoming bookings by default', () => {
    const { getByText, queryByText } = render(<BookingListScreen bookings={mockBookings} />);
    expect(getByText('Ref: TRQ1001')).toBeTruthy();
    expect(getByText('Route: JFK -> LAX')).toBeTruthy();
    expect(queryByText('Ref: TRQ1002')).toBeNull();
  });

  it('switches to past bookings when past tab is pressed', () => {
    const { getByTestId, getByText, queryByText } = render(<BookingListScreen bookings={mockBookings} />);
    fireEvent.press(getByTestId('tab-past'));
    expect(getByText('Ref: TRQ1002')).toBeTruthy();
    expect(queryByText('Ref: TRQ1001')).toBeNull();
  });

  it('triggers onSelectBooking when a booking card is pressed', () => {
    const onSelect = jest.fn();
    const { getByTestId } = render(<BookingListScreen bookings={mockBookings} onSelectBooking={onSelect} />);
    fireEvent.press(getByTestId('booking-card-1'));
    expect(onSelect).toHaveBeenCalledWith(mockBookings[0]);
  });
});
