# Booking Confirmation Prerequisites

To prevent premature confirmation notifications, booking confirmation notifications are sent only after all defined booking confirmation prerequisites are satisfied:

1. Valid non-empty `flight_id`.
2. Valid positive escrow amount (`amount > 0`).
3. Valid seat and passenger authorization.
4. Successful on-chain reservation state (`Confirmed`).
