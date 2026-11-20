use integration_tests::{generate_actors, initialize_token, new_env, register_contracts};
use soroban_sdk::{testutils::Ledger, Symbol};

#[test]
fn test_payment_escrow_flow() {
    let env = new_env();
    let actors = generate_actors(&env);
    let contracts = register_contracts(&env);
    initialize_token(&env, &contracts.token, &actors.admin);

    let price = 100_0000000i128; // 100 USDC

    // 1. Create booking
    let booking_id = contracts.booking.create_booking(
        &actors.passenger,
        &actors.airline,
        &Symbol::new(&env, "FL123"),
        &Symbol::new(&env, "JFK"),
        &Symbol::new(&env, "LAX"),
        &1704067200,
        &price,
        &contracts.token.address,
    );

    let booking = contracts.booking.get_booking(&booking_id).unwrap();
    assert_eq!(booking.status, Symbol::new(&env, "pending"));
    assert_eq!(booking.amount_escrowed, 0);

    // 2. Mint tokens to passenger and Pay
    contracts
        .token
        .mint(&actors.admin, &actors.passenger, &price);
    contracts.booking.pay_for_booking(&booking_id);

    let booking = contracts.booking.get_booking(&booking_id).unwrap();
    assert_eq!(booking.status, Symbol::new(&env, "confirmed"));
    assert_eq!(booking.amount_escrowed, price);
    assert_eq!(contracts.token.balance_of(&actors.passenger), 0);
    assert_eq!(
        contracts.token.balance_of(&contracts.booking.address),
        price
    );
    assert_eq!(contracts.token.balance_of(&actors.airline), 0);

    // 3. Release escrow to the airline after fulfillment.
    contracts.booking.release_payment_to_airline(&booking_id);

    let booking = contracts.booking.get_booking(&booking_id).unwrap();
    assert_eq!(booking.status, Symbol::new(&env, "completed"));
    assert_eq!(booking.amount_escrowed, 0);
    assert_eq!(contracts.token.balance_of(&contracts.booking.address), 0);
    assert_eq!(contracts.token.balance_of(&actors.airline), price);
}

#[test]
fn test_refund_flow() {
    let env = new_env();
    env.ledger().set_timestamp(1700000000);

    let actors = generate_actors(&env);
    let contracts = register_contracts(&env);
    initialize_token(&env, &contracts.token, &actors.admin);

    let price = 100_0000000i128;
    let departure_time = 1705000000; // Far in the future

    let booking_id = contracts.booking.create_booking(
        &actors.passenger,
        &actors.airline,
        &Symbol::new(&env, "FL123"),
        &Symbol::new(&env, "JFK"),
        &Symbol::new(&env, "LAX"),
        &departure_time,
        &price,
        &contracts.token.address,
    );

    contracts
        .token
        .mint(&actors.admin, &actors.passenger, &price);
    contracts.booking.pay_for_booking(&booking_id);

    // Refund passenger
    contracts.booking.refund_passenger(&booking_id);

    let booking = contracts.booking.get_booking(&booking_id).unwrap();
    assert_eq!(booking.status, Symbol::new(&env, "refunded"));
    assert_eq!(booking.amount_escrowed, 0);
}

#[test]
fn test_traveler_booking_list_upcoming_and_past() {
    let env = new_env();
    env.ledger().set_timestamp(1700000000);

    let actors = generate_actors(&env);
    let contracts = register_contracts(&env);
    initialize_token(&env, &contracts.token, &actors.admin);

    let price = 100_0000000i128;

    // Past booking: departure time before current time (1700000000)
    let past_departure = 1650000000;
    let past_booking_id = contracts.booking.create_booking(
        &actors.passenger,
        &actors.airline,
        &Symbol::new(&env, "PAST123"),
        &Symbol::new(&env, "JFK"),
        &Symbol::new(&env, "LAX"),
        &past_departure,
        &price,
        &contracts.token.address,
    );

    // Upcoming booking: departure time after current time
    let upcoming_departure = 1750000000;
    let upcoming_booking_id = contracts.booking.create_booking(
        &actors.passenger,
        &actors.airline,
        &Symbol::new(&env, "UPC456"),
        &Symbol::new(&env, "LAX"),
        &Symbol::new(&env, "SFO"),
        &upcoming_departure,
        &price,
        &contracts.token.address,
    );

    let all_bookings = contracts.booking.get_passenger_bookings(&actors.passenger);
    assert_eq!(all_bookings.len(), 2);

    let upcoming = contracts.booking.get_passenger_upcoming_bookings(&actors.passenger, &1700000000);
    assert_eq!(upcoming.len(), 1);
    let up_b = upcoming.get(0).unwrap();
    assert_eq!(up_b.booking_id, upcoming_booking_id);
    assert_eq!(up_b.flight_number, Symbol::new(&env, "UPC456"));
    assert_eq!(up_b.from_airport, Symbol::new(&env, "LAX"));
    assert_eq!(up_b.to_airport, Symbol::new(&env, "SFO"));
    assert_eq!(up_b.departure_time, upcoming_departure);
    assert_eq!(up_b.status, Symbol::new(&env, "pending"));

    let past = contracts.booking.get_passenger_past_bookings(&actors.passenger, &1700000000);
    assert_eq!(past.len(), 1);
    let past_b = past.get(0).unwrap();
    assert_eq!(past_b.booking_id, past_booking_id);
    assert_eq!(past_b.flight_number, Symbol::new(&env, "PAST123"));
    assert_eq!(past_b.departure_time, past_departure);
}
