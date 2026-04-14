// ──────────────────────────────────────────────────────────────────────────────
// RugbyFundX — Milestone Escrow Validator
//
// PURPOSE
// -------
// This is the core trust primitive of RugbyFundX. Every donation is locked here
// as an individual UTxO. Funds can only leave in two ways:
//
//   1. RELEASE  — The platform verifier signs off on a milestone and the team
//                 receives the funds. No verifier = no release.
//
//   2. REFUND   — After refund_deadline passes, the original donor reclaims
//                 their ADA unconditionally. Protects donors from inactive teams.
//
// SECURITY MODEL
// --------------
// - Verifier key should be a 2-of-3 multisig in production (use a Native Script
//   or Plutus multisig wrapper for the verifier_pkh field).
// - The contract is permissionless for donors: anyone can donate by sending
//   ADA to the script address with a valid EscrowDatum.
// - Each donation is its own UTxO — isolation means a corrupt team cannot affect
//   other teams' funds.
//
// TRANSACTION FLOWS
// -----------------
//
//   Donation:
//     [Donor Wallet] ──ADA──► [Script Address]
//                               datum: EscrowDatum { team_pkh, verifier_pkh,
//                                                    donor_pkh, team_id,
//                                                    refund_deadline,
//                                                    donation_amount }
//
//   Release (milestone approved):
//     [Script UTxO]  ──ADA──► [Team Wallet]      (verifier signs tx)
//
//   Refund (deadline passed):
//     [Script UTxO]  ──ADA──► [Donor Wallet]     (donor signs tx, after deadline)
//
// ──────────────────────────────────────────────────────────────────────────────

use aiken/collection/list
use aiken/interval.{Finite}
use cardano/address.{Credential, VerificationKey}
use cardano/transaction.{OutputReference, Transaction}
use rugbyfundx/types.{EscrowDatum, EscrowRedeemer, Refund, Release}

// ── Validator ─────────────────────────────────────────────────────────────────

validator milestone_escrow {
  spend(
    datum: Option<EscrowDatum>,
    redeemer: EscrowRedeemer,
    _own_ref: OutputReference,
    tx: Transaction,
  ) {
    // Datum must be present — datumless UTxOs cannot be spent
    expect Some(d) = datum

    when redeemer is {
      // ── Release ─────────────────────────────────────────────────────────────
      // Verifier approves milestone completion and releases funds to the team.
      Release -> {
        // 1. Platform verifier must sign the transaction
        let verifier_signed =
          list.has(tx.extra_signatories, d.verifier_pkh)

        // 2. Team wallet must appear as an output (receives the ADA)
        let team_paid =
          list.any(
            tx.outputs,
            fn(output) {
              when output.address.payment_credential is {
                VerificationKey(pkh) -> pkh == d.team_pkh
                _ -> False
              }
            },
          )

        // Both conditions must hold
        verifier_signed && team_paid
      }

      // ── Refund ──────────────────────────────────────────────────────────────
      // Donor reclaims their ADA after the refund deadline has passed.
      // This protects donors from teams that never complete milestones.
      Refund -> {
        // 1. Original donor must sign the transaction
        let donor_signed =
          list.has(tx.extra_signatories, d.donor_pkh)

        // 2. Transaction validity window must start AFTER the refund deadline
        //    (prevents donors from refunding prematurely)
        let after_deadline =
          when tx.validity_range.lower_bound.bound_type is {
            Finite(lower_bound_posix) ->
              lower_bound_posix >= d.refund_deadline
            _ -> False
          }

        donor_signed && after_deadline
      }
    }
  }

  // Disallow minting/burning through this script
  else(_) {
    fail
  }
}

// ── Helper: check a verificationkey credential matches a pkh ──────────────────
// Exported for use in tests
pub fn is_vk_credential(cred: Credential, pkh: ByteArray) -> Bool {
  when cred is {
    VerificationKey(k) -> k == pkh
    _ -> False
  }
}
