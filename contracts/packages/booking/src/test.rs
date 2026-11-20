#![cfg(test)]

use super::*;
use soroban_sdk::{symbol_short, token, Address, Env};

#[test]
fn test_reconciliation_audit_trail() {
    let env = Env::default();
    env.mock_all_auths();

    let admin = Address::generate(&env);
    let passenger = Address::generate(&env);
    let airline = Address::generate(&env);

    let token_admin = Address::generate(&env);
    let token_contract = env.register_stellar_asset_contract(token_admin);
    let token_client = token::Client::new(&env, &token_contract);

    token_client.mint(&passenger, &1000);

    let contract_id = env.register_contract(None, BookingContract);
    let client = BookingContractClient::new(&env, &contract_id);

    let booking_id = client.create_booking(
        &passenger,
        &airline,
        &symbol_short!("FL123"),
        &symbol_short!("JFK"),
        &symbol_short!("LAX"),
        &1000000,
        &500,
        &token_contract,
    );

    let audit_init = client.get_reconciliation_audit(&booking_id).unwrap();
    assert_eq!(audit_init.actor, passenger);
    assert_eq!(audit_init.correlation_id, symbol_short!("init"));
    assert_eq!(audit_init.decision_status, symbol_short!("pending"));

    client.pay_for_booking(&booking_id, &symbol_short!("corr_pay"));
    let audit_pay = client.get_reconciliation_audit(&booking_id).unwrap();
    assert_eq!(audit_pay.correlation_id, symbol_short!("corr_pay"));
    assert_eq!(audit_pay.decision_status, symbol_short!("confirmed"));

    client.release_payment_to_airline(&booking_id, &symbol_short!("corr_rel"));
    let audit_rel = client.get_reconciliation_audit(&booking_id).unwrap();
    assert_eq!(audit_rel.actor, airline);
    assert_eq!(audit_rel.correlation_id, symbol_short!("corr_rel"));
    assert_eq!(audit_rel.decision_status, symbol_short!("completed"));
}
