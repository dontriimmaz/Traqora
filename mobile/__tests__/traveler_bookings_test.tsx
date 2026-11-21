import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { BookingList } from '../booking/list';
import { Booking } from '../booking/types';

describe('BookingList Component', () => {
  const mockBookings: Booking[] = [
    {
      id: '1',
      bookingReference: 'TRQ-1234',
      route: 'JFK -> LAX',
      departureTime: '2025-10-10 10:00 AM',
      status: 'upcoming',
      airline: 'Traqora Air',
      price: '150 USDC',
    },
    {
      id: '2',
      bookingReference: 'TRQ-5678',
      route: 'SFO -> ORD',
      departureTime: '2022-01-01 02:00 PM',
      status: 'past',
      airline: 'Traqora Air',
      price: '200 USDC',
    },
  ];

  it('renders empty state correctly when list is empty', () => {
    const { getByText } = render(<BookingList bookings={[]} />);
    expect(getByText('No bookings found.')).toBeTruthy();
  });

  it('renders bookings list with correct details', () => {
    const { getByText } = render(<BookingList bookings={mockBookings} />);
    expect(getByText('Ref: TRQ-1234')).toBeTruthy();
    expect(getByText('JFK -> LAX')).toBeTruthy();
    expect(getByText('Ref: TRQ-5678')).toBeTruthy();
    expect(getByText('SFO -> ORD')).toBeTruthy();
  });

  it('triggers onSelectBooking callback when a booking card is pressed', () => {
    const onSelectMock = jest.fn();
    const { getByLabelText } = render(
      <BookingList bookings={mockBookings} onSelectBooking={onSelectMock} />
    );

    const card = getByLabelText(
      'Booking reference TRQ-1234, route JFK -> LAX, departure time 2025-10-10 10:00 AM, status upcoming'
    );
    fireEvent.press(card);

    expect(onSelectMock).toHaveBeenCalledTimes(1);
    expect(onSelectMock).toHaveBeenCalledWith(mockBookings[0]);
  });
});
