use soroban_sdk::{contract, contractimpl, contracttype, symbol_short, Address, Env, Symbol};

/// A payment record stored in the financial ledger.
#[contracttype]
#[derive(Clone)]
pub struct PaymentRecord {
    pub payment_id: u64,
    pub payer: Address,
    pub payee: Address,
    pub amount: i128,
    pub recorded_at: u64,
}

/// A reconciliation audit record containing actor, timestamp, correlation identifiers, and state changes.
#[contracttype]
#[derive(Clone)]
pub struct ReconciliationAuditRecord {
    pub audit_id: u64,
    pub actor: Address,
    pub timestamp: u64,
    pub correlation_id: Symbol,
    pub state_change: Symbol,
    pub details: Symbol,
}

// ── Storage helpers ──────────────────────────────────────────────────────────

fn payment_key(payment_id: u64) -> (Symbol, u64) {
    (symbol_short!("payment"), payment_id)
}

fn next_payment_key() -> Symbol {
    symbol_short!("nxt_pay")
}

fn reconciliation_audit_key(audit_id: u64) -> (Symbol, u64) {
    (symbol_short!("recon_aud"), audit_id)
}

fn next_reconciliation_audit_key() -> Symbol {
    symbol_short!("nxt_rcad")
}

// ── Contract ─────────────────────────────────────────────────────────────────

#[contract]
pub struct FinancialRecordsContract;

#[contractimpl]
impl FinancialRecordsContract {
    /// Record a new payment. Returns the assigned payment_id.
    pub fn record_payment(
        env: Env,
        payer: Address,
        payee: Address,
        amount: i128,
        recorded_at: u64,
    ) -> u64 {
        payer.require_auth();
        assert!(amount > 0, "amount must be positive");

        let payment_id: u64 = env
            .storage()
            .instance()
            .get(&next_payment_key())
            .unwrap_or(1u64);
        env.storage()
            .instance()
            .set(&next_payment_key(), &(payment_id + 1));

        let record = PaymentRecord {
            payment_id,
            payer,
            payee,
            amount,
            recorded_at,
        };
        env.storage()
            .persistent()
            .set(&payment_key(payment_id), &record);
        payment_id
    }

    /// Retrieve a payment record by id.
    pub fn get_payment(env: Env, payment_id: u64) -> PaymentRecord {
        env.storage()
            .persistent()
            .get(&payment_key(payment_id))
            .expect("payment not found")
    }

    /// Record a reconciliation audit event.
    pub fn record_reconciliation_audit(
        env: Env,
        actor: Address,
        correlation_id: Symbol,
        state_change: Symbol,
        details: Symbol,
        timestamp: u64,
    ) -> u64 {
        actor.require_auth();
        let audit_id: u64 = env
            .storage()
            .instance()
            .get(&next_reconciliation_audit_key())
            .unwrap_or(1u64);
        env.storage()
            .instance()
            .set(&next_reconciliation_audit_key(), &(audit_id + 1));

        let record = ReconciliationAuditRecord {
            audit_id,
            actor,
            timestamp,
            correlation_id,
            state_change,
            details,
        };
        env.storage()
            .persistent()
            .set(&reconciliation_audit_key(audit_id), &record);
        audit_id
    }

    /// Retrieve a reconciliation audit record by id.
    pub fn get_reconciliation_audit(env: Env, audit_id: u64) -> ReconciliationAuditRecord {
        env.storage()
            .persistent()
            .get(&reconciliation_audit_key(audit_id))
            .expect("audit record not found")
    }
}

// ── Tests ─────────────────────────────────────────────────────────────────────

#[cfg(test)]
mod tests {
    use super::*;
    use soroban_sdk::{testutils::Address as _, Env};

    #[test]
    fn test_record_and_retrieve_payment() {
        let env = Env::default();
        env.mock_all_auths();
        let id = env.register_contract(None, FinancialRecordsContract);
        let client = FinancialRecordsContractClient::new(&env, &id);

        let payer = Address::generate(&env);
        let payee = Address::generate(&env);

        let payment_id = client.record_payment(&payer, &payee, &500i128, &1000u64);
        assert_eq!(payment_id, 1);

        let record = client.get_payment(&payment_id);
        assert_eq!(record.amount, 500);
        assert_eq!(record.payer, payer);
    }
}
