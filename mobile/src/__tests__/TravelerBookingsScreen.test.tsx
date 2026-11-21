import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { TravelerBookingsScreen } from '../screens/TravelerBookingsScreen';

describe('TravelerBookingsScreen', () => {
  it('renders successfully with upcoming tab selected by default', () => {
    const { getByText } = render(<TravelerBookingsScreen />);
    expect(getByText('My Bookings')).toBeTruthy();
    expect(getByText('Upcoming')).toBeTruthy();
    expect(getByText('Past')).toBeTruthy();
    expect(getByText('TRQ-9812')).toBeTruthy();
  });

  it('switches between upcoming and past tabs correctly', () => {
    const { getByText } = render(<TravelerBookingsScreen />);

    const pastTab = getByText('Past');
    fireEvent.press(pastTab);

    expect(getByText('TRQ-4431')).toBeTruthy();

    const upcomingTab = getByText('Upcoming');
    fireEvent.press(upcomingTab);

    expect(getByText('TRQ-9812')).toBeTruthy();
  });
});
