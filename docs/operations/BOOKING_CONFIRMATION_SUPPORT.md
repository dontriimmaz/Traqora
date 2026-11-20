# Booking Confirmation Support & Reconciliation Steps

## Purpose
This document provides support staff (L1–L3) with safe lookup, validation, and escalation procedures for pending, delayed, or inconsistent bookings in the Traqora decentralized travel booking platform under v1 confirmation and reconciliation scope.

---

## 1. Safe Booking Lookup Procedures
When a traveler reports a pending or missing booking confirmation, follow these steps using only permitted v1 operator tools:

1. **Verify the Booking Reference:**
   - Locate the booking reference (`TRAQ-<bookingId>`) or transaction hash provided by the user.
   - Access the **Booking Operations View** to query on-chain and off-chain states simultaneously.
   - *Never* request private keys, seed phrases, or full payment card numbers.

2. **Check Current Status States:**
   - `pending` / `awaiting_payment`: Payment has not settled on-chain or the token transfer has not been submitted.
   - `confirmed`: Payment is escrowed successfully in the booking contract (`amount_escrowed > 0`).
   - `completed`: Payment has been released to the airline after fulfillment.
   - `refunded` / `cancelled`: Booking was canceled or refunded per valid policy.

---

## 2. Handling Inconsistent or Pending Bookings

### A. Payment Delay / On-Chain Pending
- **Symptom:** Booking remains in `awaiting_payment` or `onchain_pending` despite user submitting transaction.
- **Action:**
  1. Check network health and contract circuit status via the **Operations Health View**.
  2. Verify the transaction hash on the Stellar explorer.
  3. Do *not* advise the traveler to pay again until duplicate charge checks are complete.
  4. If pending past the standard confirmation window, escalate to L2.

### B. Reconciliation Discrepancies
- **Symptom:** Application state does not match indexed event logs or reconciliation needs review count is non-zero.
- **Action:**
  1. Check contract health metrics and review the reconciliation queue.
  2. Do not manually mutate on-chain state or booking statuses.
  3. Escalate confirmed state mismatches to L3 with affected booking IDs and event digests.

---

## 3. Escalation Path

| Support Tier | Scope & Triggers | Action |
|--------------|------------------|--------|
| **L1** | Basic lookup, status check, explaining UI confirmation states. | Resolve using runbook; provide reference numbers. |
| **L2** | Payment mismatches, refund discrepancies, supplier delay. | Verify transaction proofs; coordinate with billing/airline partners. |
| **L3** | Ledger state corruption, contract event mismatches, SEV1/SEV2 incidents. | Engage core engineering / security leads per `docs/operations/INCIDENT_RESPONSE.md`. |

---

## 4. Related Documents
- `docs/operations/BOOKING_FAILURE_RUNBOOKS.md`
- `docs/operations/OPERATIONS_HEALTH_AND_AUDIT.md`
- `docs/operations/INCIDENT_RESPONSE.md`
