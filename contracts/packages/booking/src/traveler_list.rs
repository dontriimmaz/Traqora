use soroban_sdk::{contracttype, Address, Env, Symbol, Vec};
use crate::{Booking, BookingStorage};

#[contracttype]
#[derive(Clone)]
pub struct TravelerBookingSummary {
    pub booking_id: u64,
    pub status: Symbol,
    pub flight_number: Symbol,
    pub from_airport: Symbol,
    pub to_airport: Symbol,
    pub departure_time: u64,
}

#[contracttype]
#[derive(Clone)]
pub struct TravelerBookingList {
    pub upcoming: Vec<TravelerBookingSummary>,
    pub past: Vec<TravelerBookingSummary>,
}

impl BookingStorage {
    pub fn get_passenger_bookings_list(env: &Env, passenger: &Address) -> Vec<u64> {
        env.storage()
            .persistent()
            .get(&(passenger.clone(), symbol_short!("bookings")))
            .unwrap_or_else(|| Vec::new(env))
    }

    pub fn add_passenger_booking(env: &Env, passenger: &Address, booking_id: u64) {
        let key = (passenger.clone(), symbol_short!("bookings"));
        let mut list: Vec<u64> = env
            .storage()
            .persistent()
            .get(&key)
            .unwrap_or_else(|| Vec::new(env));
        list.push_back(booking_id);
        env.storage().persistent().set(&key, &list);
    }
}

pub fn get_traveler_bookings(env: &Env, passenger: Address) -> TravelerBookingList {
    let booking_ids = BookingStorage::get_passenger_bookings_list(&env, &passenger);
    let current_time = env.ledger().timestamp();
    
    let mut upcoming = Vec::new(&env);
    let mut past = Vec::new(&env);

    let mut i = 0;
    while i < booking_ids.len() {
        let booking_id = booking_ids.get(i).unwrap();
        if let Some(booking) = BookingStorage::get(&env, booking_id) {
            let summary = TravelerBookingSummary {
                booking_id: booking.booking_id,
                status: booking.status,
                flight_number: booking.flight_number,
                from_airport: booking.from_airport,
                to_airport: booking.to_airport,
                departure_time: booking.departure_time,
            };

            if booking.departure_time >= current_time {
                upcoming.push_back(summary);
            } else {
                past.push_back(summary);
            }
        }
        i += 1;
    }

    TravelerBookingList { upcoming, past }
}
