# Booking Confirmation Documentation

## Overview
The Booking Confirmation screen renders reservation and itinerary details. To prevent premature confirmation notifications, confirmation banners are only displayed when payment status prerequisites are satisfied (`confirmed` or `paid`). When pending, the screen indicates the processing status.

## Prerequisites
- Payment status must be explicitly set to `confirmed` or `paid` for the booking confirmation title to appear.
- Itinerary segments and transaction details are rendered according to the provided props.
