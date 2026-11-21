#[contracttype]
#[derive(Clone, Copy, Debug, Eq, PartialEq)]
pub enum BookingState {
    Pending,
    Confirmed,
    Cancelled,
    Refunded,
}

#[contracttype]
#[derive(Clone)]
pub struct Booking {
    pub booking_id: u64,
    pub passenger: Address,
    pub flight_id: Symbol,
    pub seat: Symbol,
    pub amount: i128,
    pub escrowed_amount: i128,
    pub state: BookingState,
    pub created_at: u64,
}

#[contracttype]
#[derive(Clone)]
enum DataKey {
    NextId,
    Booking(u64),
    ReconciliationRef(Symbol),
}

#[contract]
pub struct FlightBookingContract;

#[contractimpl]
impl FlightBookingContract {
    pub fn reserve_seat(
        env: Env,
        passenger: Address,
        flight_id: Symbol,
        seat: Symbol,
        amount: i128,
    ) -> u64 {
        passenger.require_auth();
        assert!(amount > 0, "Invalid amount");

        let seat_key = (symbol_short!("seat"), flight_id.clone(), seat.clone());
        if env.storage().persistent().has(&seat_key) {
            panic!("Seat already reserved");
        }

        let booking_id: u64 = env.storage().instance().get(&DataKey::NextId).unwrap_or(1);
        let created_at = env.ledger().timestamp();

        let booking = Booking {
            booking_id,
            passenger: passenger.clone(),
            flight_id: flight_id.clone(),
            seat: seat.clone(),
            amount,
            escrowed_amount: amount,
            state: BookingState::Confirmed,
            created_at,
        };

        env.storage()
            .persistent()
            .set(&DataKey::Booking(booking_id), &booking);
        env.storage().persistent().set(&seat_key, &booking_id);
        env.storage()
            .instance()
            .set(&DataKey::NextId, &(booking_id + 1));

        contract_events::emit(
            &env,
            Domain::Seat,
            Action::Reserved,
            (
                passenger.clone(),
                created_at,
                booking_id,
                flight_id,
                seat,
                amount,
            ),
        );

        booking_id
    }

    pub fn get_booking(env: Env, booking_id: u64) -> Option<Booking> {
        env.storage()
            .persistent()
            .get(&DataKey::Booking(booking_id))
    }

    pub fn init_upgrade_owner(env: Env, owner: Address) {
        access::UpgradeTimelock::init_upgrade_owner(&env, &owner);
    }

    pub fn reconcile_booking_reference(
        env: Env,
        passenger: Address,
        flight_id: Symbol,
        seat: Symbol,
        amount: i128,
        correlation_id: Symbol,
    ) -> u64 {
        passenger.require_auth();
        assert!(amount > 0, "Invalid amount");

        if let Some(existing_id) = env
            .storage()
            .persistent()
            .get(&DataKey::ReconciliationRef(correlation_id.clone()))
        {
            let booking: Booking = env
                .storage()
                .persistent()
                .get(&DataKey::Booking(existing_id))
                .unwrap();
            let timestamp = env.ledger().timestamp();
            contract_events::emit(
                &env,
                Domain::Reconciliation,
                Action::Reconciled,
                (passenger.clone(), timestamp, existing_id, correlation_id),
            );
            return existing_id;
        }

        let seat_key = (symbol_short!("seat"), flight_id.clone(), seat.clone());
        if env.storage().persistent().has(&seat_key) {
            panic!("Seat already reserved");
        }

        let booking_id: u64 = env.storage().instance().get(&DataKey::NextId).unwrap_or(1);
        let timestamp = env.ledger().timestamp();

        let booking = Booking {
            booking_id,
            passenger: passenger.clone(),
            flight_id: flight_id.clone(),
            seat: seat.clone(),
            amount,
            escrowed_amount: amount,
            state: BookingState::Confirmed,
            created_at: timestamp,
        };

        env.storage()
            .persistent()
            .set(&DataKey::Booking(booking_id), &booking);
        env.storage().persistent().set(&seat_key, &booking_id);
        env.storage().persistent().set(
            &DataKey::ReconciliationRef(correlation_id.clone()),
            &booking_id,
        );
        env.storage()
            .instance()
            .set(&DataKey::NextId, &(booking_id + 1));

        contract_events::emit(
            &env,
            Domain::Reconciliation,
            Action::Reconciled,
            (passenger.clone(), timestamp, booking_id, correlation_id),
        );

        booking_id
    }
}

#[cfg(test)]
mod test {
    use super::*;
    use contract_events::{Action, Domain};
    use soroban_sdk::{contract, contractimpl, contracttype, symbol_short, Address, Env, Symbol};
    use soroban_sdk::{testutils::Address as _, Env};

    #[test]
    fn test_reconciliation_audit_trail_normal_and_idempotent() {
        let env = Env::default();
        let contract_id = env.register(FlightBookingContract, ());
        let client = FlightBookingContractClient::new(&env, &contract_id);

        let passenger = Address::generate(&env);
        let flight_id = symbol_short!("FL123");
        let seat = symbol_short!("12A");
        let request_ref = symbol_short!("ref-1");

        let id1 =
            client.reconcile_booking_reference(&passenger, &flight_id, &seat, &100, &request_ref);
        assert_eq!(id1, 1);

        // Idempotent retry returns existing booking id and emits reconciled event
        let id2 = client.reconcile_booking_reference(
            &passenger,
            &flight_id,
            &symbol_short!("12B"),
            &100,
            &request_ref,
        );
        assert_eq!(id2, 1);
    }
}
