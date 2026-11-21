export type BookingStatus = 'upcoming' | 'past' | 'confirmed' | 'completed' | 'cancelled' | 'refunded';

export interface Booking {
  id: string;
  bookingReference: string;
  route: string;
  departureTime: string;
  status: BookingStatus;
  airline: string;
  price: string;
}
