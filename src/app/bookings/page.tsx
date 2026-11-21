import React from 'react';

interface Booking {
  id: string;
  bookingReference: string;
  route: string;
  departureTime: string;
  status: 'upcoming' | 'past' | 'cancelled';
}

async function getBookings(): Promise<Booking[]> {
  return [
    {
      id: '1',
      bookingReference: 'BK-1001',
      route: 'New York to London',
      departureTime: '2025-06-15T10:00:00Z',
      status: 'upcoming',
    },
    {
      id: '2',
      bookingReference: 'BK-1002',
      route: 'London to Paris',
      departureTime: '2023-11-20T14:30:00Z',
      status: 'past',
    },
  ];
}

export default async function BookingsPage() {
  const bookings = await getBookings();
  const upcoming = bookings.filter((b) => b.status === 'upcoming');
  const past = bookings.filter((b) => b.status === 'past');

  return (
    <main className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">My Bookings</h1>
      
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Upcoming Bookings</h2>
        {upcoming.length === 0 ? (
          <p className="text-gray-500">No upcoming bookings found.</p>
        ) : (
          <ul className="space-y-4">
            {upcoming.map((booking) => (
              <li key={booking.id} className="border p-4 rounded shadow">
                <p><strong>Booking Reference:</strong> <span data-testid="booking-ref">{booking.bookingReference}</span></p>
                <p><strong>Route:</strong> <span data-testid="booking-route">{booking.route}</span></p>
                <p><strong>Departure:</strong> <span data-testid="booking-departure">{booking.departureTime}</span></p>
                <p><strong>Status:</strong> <span data-testid="booking-status">{booking.status}</span></p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4">Past Bookings</h2>
        {past.length === 0 ? (
          <p className="text-gray-500">No past bookings found.</p>
        ) : (
          <ul className="space-y-4">
            {past.map((booking) => (
              <li key={booking.id} className="border p-4 rounded shadow bg-gray-50">
                <p><strong>Booking Reference:</strong> <span data-testid="booking-ref">{booking.bookingReference}</span></p>
                <p><strong>Route:</strong> <span data-testid="booking-route">{booking.route}</span></p>
                <p><strong>Departure:</strong> <span data-testid="booking-departure">{booking.departureTime}</span></p>
                <p><strong>Status:</strong> <span data-testid="booking-status">{booking.status}</span></p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
