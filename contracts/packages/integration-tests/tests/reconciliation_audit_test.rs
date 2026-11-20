use soroban_sdk::{Address, Env, String};

#[test]
test_reconciliation_audit_trail() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register(contracts_booking::BookingReconciliationContract, ());
    let client = contracts_booking::BookingReconciliationContractClient::new(&env, &contract_id);

    let actor = Address::generate(&env);
    let correlation_id = String::from_str(&env, "corr-12345");
    let state_before = String::from_str(&env, "PENDING");
    let state_after = String::from_str(&env, "RECONCILED");
    let decision = String::from_str(&env, "APPROVE");

    let record = client.record_audit(&correlation_id, &actor, &state_before, &state_after, &decision);
    assert_eq!(record.correlation_id, correlation_id);
    assert_eq!(record.actor, actor);
    assert_eq!(record.state_after, state_after);

    let trail = client.get_audit_trail();
    assert_eq!(trail.len(), 1);
    assert_eq!(trail.get(0).unwrap().decision, decision);
}
