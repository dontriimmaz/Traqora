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

    let price = 50_0000000i128;

    // Past booking: departure time before current timestamp (1700000000)
    let past_departure = 1699000000;
    let past_booking_id = contracts.booking.create_booking(
        &actors.passenger,
        &actors.airline,
        &Symbol::new(&env, "FL001"),
        &Symbol::new(&env, "JFK"),
        &Symbol::new(&env, "LAX"),
        &past_departure,
        &price,
        &contracts.token.address,
    );

    // Upcoming booking: departure time after current timestamp
    let upcoming_departure = 1705000000;
    let upcoming_booking_id = contracts.booking.create_booking(
        &actors.passenger,
        &actors.airline,
        &Symbol::new(&env, "FL002"),
        &Symbol::new(&env, "LAX"),
        &Symbol::new(&env, "SFO"),
        &upcoming_departure,
        &price,
        &contracts.token.address,
    );

    let mut ids = soroban_sdk::Vec::new(&env);
    ids.push_back(past_booking_id);
    ids.push_back(upcoming_booking_id);

    let all = contracts
        .booking
        .get_passenger_bookings(&actors.passenger, &ids);
    assert_eq!(all.len(), 2);

    let upcoming =
        contracts
            .booking
            .get_upcoming_passenger_bookings(&actors.passenger, &1700000000, &ids);
    assert_eq!(upcoming.len(), 1);
    assert_eq!(upcoming.get(0).unwrap().booking_id, upcoming_booking_id);
    assert_eq!(
        upcoming.get(0).unwrap().flight_number,
        Symbol::new(&env, "FL002")
    );
    assert_eq!(
        upcoming.get(0).unwrap().from_airport,
        Symbol::new(&env, "LAX")
    );
    assert_eq!(
        upcoming.get(0).unwrap().to_airport,
        Symbol::new(&env, "SFO")
    );
    assert_eq!(
        upcoming.get(0).unwrap().status,
        Symbol::new(&env, "pending")
    );

    let past = contracts
        .booking
        .get_past_passenger_bookings(&actors.passenger, &1700000000, &ids);
    assert_eq!(past.len(), 1);
    assert_eq!(past.get(0).unwrap().booking_id, past_booking_id);
    assert_eq!(
        past.get(0).unwrap().flight_number,
        Symbol::new(&env, "FL001")
    );
    assert_eq!(past.get(0).unwrap().status, Symbol::new(&env, "pending"));
}
