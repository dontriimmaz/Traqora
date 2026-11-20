#[cfg(test)]
use super::*;
use soroban_sdk::{Env, Symbol, symbol_short, Address};

#[test]
test_traveler_booking_list_partitioning() {
    let env = Env::default();
    env.ledger().set_timestamp(1000);
    let passenger = Address::generate(&env);
    let airline = Address::generate(&env);
    let token = Address::generate(&env);

    let b1 = Booking {
        booking_id: 1,
        passenger: passenger.clone(),
        airline: airline.clone(),
        flight_number: symbol_short!("FL123"),
        from_airport: symbol_short!("JFK"),
        to_airport: symbol_short!("LAX"),
        departure_time: 2000,
        price: 100,
        token: token.clone(),
        amount_escrowed: 100,
        status: symbol_short!("confirmed"),
        created_at: 500,
    };

    let b2 = Booking {
        booking_id: 2,
        passenger: passenger.clone(),
        airline: airline.clone(),
        flight_number: symbol_short!("FL456"),
        from_airport: symbol_short!("LAX"),
        to_airport: symbol_short!("JFK"),
        departure_time: 500,
        price: 100,
        token,
        amount_escrowed: 0,
        status: symbol_short!("completed"),
        created_at: 100,
    };

    BookingStorage::set(&env, 1, &b1);
    BookingStorage::set(&env, 2, &b2);
    BookingStorage::add_passenger_booking(&env, &passenger, 1);
    BookingStorage::add_passenger_booking(&env, &passenger, 2);

    let list = get_traveler_bookings(&env, passenger);
    assert_eq!(list.upcoming.len(), 1);
    assert_eq!(list.upcoming.get(0).unwrap().booking_id, 1);
    assert_eq!(list.past.len(), 1);
    assert_eq!(list.past.get(0).unwrap().booking_id, 2);
}
