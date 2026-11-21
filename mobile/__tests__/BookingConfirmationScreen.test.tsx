import React from 'react';
import { render, screen } from '@testing-library/react';
import BookingConfirmationScreen from '../BookingConfirmationScreen';

describe('BookingConfirmationScreen', () => {
  const sampleItinerary = [
    {
      flightNumber: 'TRQ101',
      fromAirport: 'JFK',
      toAirport: 'LAX',
      departureTime: '2025-06-01 10:00',
    },
  ];

  it('does not render confirmation when prerequisites are not satisfied or payment is pending/failed', () => {
    const { queryByText } = render(
      <BookingConfirmationScreen
        bookingId="12345"
        itinerary={sampleItinerary}
        paymentStatus="pending"
        totalAmount="$450.00"
      />
    );
    expect(queryByText('Booking Confirmed!')).not.toBeInTheDocument();
  });

  it('renders booking confirmation details correctly', () => {
    render(
      <BookingConfirmationScreen
        bookingId="12345"
        itinerary={sampleItinerary}
        paymentStatus="confirmed"
        totalAmount="$450.00"
        transactionHash="abc123def456"
      />
    );

    expect(screen.getByText('Booking Confirmed!')).toBeInTheDocument();
    expect(screen.getByText('Reference: TRAQ-12345')).toBeInTheDocument();
    expect(screen.getByText('confirmed')).toBeInTheDocument();
    expect(screen.getByText('$450.00')).toBeInTheDocument();
    expect(screen.getByText('Flight TRQ101')).toBeInTheDocument();
    expect(screen.getByText('JFK → LAX')).toBeInTheDocument();
    expect(screen.getByText('abc123def456')).toBeInTheDocument();
  });
});
