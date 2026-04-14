// ──────────────────────────────────────────────────────────────────────────────
// RugbyFundX — Shared Types
// All on-chain types used across validators
// ──────────────────────────────────────────────────────────────────────────────

use aiken/crypto.{VerificationKeyHash}

// ── Escrow Datum ──────────────────────────────────────────────────────────────
// Stored at every donation UTxO locked in the milestone_escrow validator.
// One UTxO per donation. Funds unlock when platform verifier approves a release
// or the donor reclaims after the deadline passes.
pub type EscrowDatum {
  // Payment key hash of the team receiving funds on milestone approval
  team_pkh: VerificationKeyHash,
  // Platform verifier key hash (multisig in production)
  // This key approves milestone completion and authorises fund release
  verifier_pkh: VerificationKeyHash,
  // Original donor key hash — can reclaim funds after refund_deadline
  donor_pkh: VerificationKeyHash,
  // Off-chain team identifier for indexer / frontend lookup
  team_id: ByteArray,
  // POSIX milliseconds. After this time the donor may reclaim unconditionally.
  // Recommended: 180 days (15_552_000_000 ms) from donation time
  refund_deadline: Int,
  // Lovelace amount originally donated (for event logging and validation)
  donation_amount: Int,
}

// ── Escrow Redeemer ───────────────────────────────────────────────────────────
pub type EscrowRedeemer {
  // Platform verifier releases funds to the team after milestone verification
  Release
  // Donor reclaims funds after deadline (team inactive or milestone unmet)
  Refund
}

// ── Milestone Registry Datum ──────────────────────────────────────────────────
// Stored in an NFT-gated UTxO that tracks per-team milestone state on-chain.
// Updated (via inline datum mutation) each time a milestone is marked complete.
pub type MilestoneRegistryDatum {
  team_id: ByteArray,
  team_pkh: VerificationKeyHash,
  verifier_pkh: VerificationKeyHash,
  total_milestones: Int,
  milestones_completed: Int,
  total_raised_lovelace: Int,
  total_released_lovelace: Int,
  active: Bool,
}

// ── Registry Redeemer ─────────────────────────────────────────────────────────
pub type RegistryRedeemer {
  // Verifier increments milestones_completed and records release amount
  MarkMilestoneComplete { released_lovelace: Int }
  // Verifier deactivates team (e.g. fraud or inactivity)
  DeactivateTeam
}
