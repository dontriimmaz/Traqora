# Traveler Booking List

The traveler booking list feature provides passengers with an aggregated view of their upcoming and past bookings.

## Data Structures
- `TravelerBookingSummary`: Contains booking reference (`booking_id`), stable status, route (`from_airport` to `to_airport`), flight number, and departure time.
- `TravelerBookingList`: Separates bookings into `upcoming` and `past` categories based on current ledger timestamp.
