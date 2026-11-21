import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { BookingList, BookingItem } from '../booking/BookingList';

describe('BookingList', () => {
  const mockBookings: BookingItem[] = [
    {
      id: '1',
      bookingReference: 'TRQ-1001',
      route: 'JFK -> LAX',
      departureTime: 2000000000,
      status: 'upcoming',
    },
    {
      id: '2',
      bookingReference: 'TRQ-1002',
      route: 'LHR -> JFK',
      departureTime: 1000000000,
      status: 'past',
    },
  ];

  it('renders upcoming and past bookings with correct details', () => {
    const { getByText, getByTestId } = render(<BookingList bookings={mockBookings} />);

    expect(getByTestId('booking-list-container')).toBeTruthy();
    expect(getByText('Ref: TRQ-1001')).toBeTruthy();
    expect(getByText('Route: JFK -> LAX')).toBeTruthy();
    expect(getByText('UPCOMING')).toBeTruthy();

    expect(getByText('Ref: TRQ-1002')).toBeTruthy();
    expect(getByText('Route: LHR -> JFK')).toBeTruthy();
    expect(getByText('PAST')).toBeTruthy();
  });

  it('calls onSelectBooking when a booking card is pressed', () => {
    const handleSelect = jest.fn();
    const { getByTestId } = render(<BookingList bookings={mockBookings} onSelectBooking={handleSelect} />);

    fireEvent.press(getByTestId('booking-card-1'));
    expect(handleSelect).toHaveBeenCalledWith(mockBookings[0]);
  });

  it('renders empty list state gracefully', () => {
    const { getByText } = render(<BookingList bookings={[]} />);
    expect(getByText('No bookings found')).toBeTruthy();
  });
});
