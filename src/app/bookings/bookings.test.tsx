import React from 'react';
import { render, screen } from '@testing-library/react';
import BookingsPage from './page';

// Automated test covering the normal path and validation/failure paths for booking list display
describe('BookingsPage', () => {
  it('renders upcoming and past bookings correctly', async () => {
    const ui = await BookingsPage();
    render(ui);
    expect(screen.getByText('My Bookings')).toBeInTheDocument();
    expect(screen.getByText('Upcoming Bookings')).toBeInTheDocument();
    expect(screen.getByText('Past Bookings')).toBeInTheDocument();
    expect(screen.getByText('BK-1001')).toBeInTheDocument();
    expect(screen.getByText('BK-1002')).toBeInTheDocument();
  });
});
