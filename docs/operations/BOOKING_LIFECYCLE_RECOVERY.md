# Booking Lifecycle and Reconciliation Audit Trail

## Overview
Every state transition and reconciliation decision within the V1 confirmation and reconciliation flow is recorded in an immutable audit trail with explicit actor attribution, timestamps, and correlation identifiers.

## Audit Record Structure
- `booking_id`: Unique identifier of the booking being reconciled.
- `actor`: The address responsible for triggering the state change.
- `timestamp`: Ledger timestamp when the decision was executed.
- `previous_status`: Status prior to the decision.
- `new_status`: Resulting status after reconciliation.
- `correlation_id`: Context tag identifying the operational decision path.

## Operational Verification
Operators can query all recorded audit entries using contract inspection utilities to verify correctness and trace reconciliation lifecycles.
