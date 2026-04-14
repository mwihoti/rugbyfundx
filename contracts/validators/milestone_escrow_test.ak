// ──────────────────────────────────────────────────────────────────────────────
// RugbyFundX — Milestone Escrow Tests
// ──────────────────────────────────────────────────────────────────────────────

use aiken/interval.{Finite, Interval, IntervalBound, NegativeInfinity}
use cardano/address.{Address, VerificationKey}
use cardano/assets
use cardano/transaction.{
  InlineDatum, Input, NoDatum, Output, OutputReference, Transaction,
  TransactionId,
}
use milestone_escrow.{is_vk_credential, milestone_escrow}
use rugbyfundx/types.{EscrowDatum, Refund, Release}

// ── Test Fixtures ─────────────────────────────────────────────────────────────

const team_pkh =
  #"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"

const verifier_pkh =
  #"bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb"

const donor_pkh =
  #"cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc"

const team_id = "team-1"

const refund_deadline = 1_800_000_000_000

const donation_lovelace = 10_000_000

fn mock_datum() -> EscrowDatum {
  EscrowDatum {
    team_pkh,
    verifier_pkh,
    donor_pkh,
    team_id,
    refund_deadline,
    donation_amount: donation_lovelace,
  }
}

fn mock_output_ref() -> OutputReference {
  OutputReference {
    transaction_id: TransactionId(
      #"0000000000000000000000000000000000000000000000000000000000000000",
    ),
    output_index: 0,
  }
}

fn mock_script_address() -> Address {
  Address {
    payment_credential: VerificationKey(
      #"dddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd",
    ),
    staking_credential: None,
  }
}

fn team_address() -> Address {
  Address {
    payment_credential: VerificationKey(team_pkh),
    staking_credential: None,
  }
}

fn donor_address() -> Address {
  Address {
    payment_credential: VerificationKey(donor_pkh),
    staking_credential: None,
  }
}

fn mock_input(addr: Address) -> Input {
  Input {
    output_reference: mock_output_ref(),
    output: Output {
      address: addr,
      value: assets.from_lovelace(donation_lovelace),
      datum: InlineDatum(mock_datum()),
      reference_script: None,
    },
  }
}

// Build a minimal valid transaction with given signatories and outputs
fn mock_tx(
  signatories: List<ByteArray>,
  outputs: List<Output>,
  validity_lower: Int,
) -> Transaction {
  Transaction {
    ..transaction.placeholder,
    extra_signatories: signatories,
    outputs: outputs,
    inputs: [mock_input(mock_script_address())],
    validity_range: Interval {
      lower_bound: IntervalBound {
        bound_type: Finite(validity_lower),
        is_inclusive: True,
      },
      upper_bound: IntervalBound {
        bound_type: NegativeInfinity,
        is_inclusive: False,
      },
    },
  }
}

// ── Release Tests ─────────────────────────────────────────────────────────────

test release_succeeds_when_verifier_signs_and_team_paid() {
  let tx =
    mock_tx(
      [verifier_pkh],
      [
        Output {
          address: team_address(),
          value: assets.from_lovelace(donation_lovelace),
          datum: NoDatum,
          reference_script: None,
        },
      ],
      0,
    )

  milestone_escrow.spend(
    Some(mock_datum()),
    Release,
    mock_output_ref(),
    tx,
  )
}

test release_fails_without_verifier_signature() {
  let tx =
    mock_tx(
      // No verifier signature
      [],
      [
        Output {
          address: team_address(),
          value: assets.from_lovelace(donation_lovelace),
          datum: NoDatum,
          reference_script: None,
        },
      ],
      0,
    )

  !milestone_escrow.spend(
    Some(mock_datum()),
    Release,
    mock_output_ref(),
    tx,
  )
}

test release_fails_if_team_not_paid() {
  // Verifier signs but pays wrong address
  let wrong_address =
    Address {
      payment_credential: VerificationKey(
        #"eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
      ),
      staking_credential: None,
    }

  let tx =
    mock_tx(
      [verifier_pkh],
      [
        Output {
          address: wrong_address,
          value: assets.from_lovelace(donation_lovelace),
          datum: NoDatum,
          reference_script: None,
        },
      ],
      0,
    )

  !milestone_escrow.spend(
    Some(mock_datum()),
    Release,
    mock_output_ref(),
    tx,
  )
}

test release_fails_with_no_datum() {
  let tx =
    mock_tx(
      [verifier_pkh],
      [
        Output {
          address: team_address(),
          value: assets.from_lovelace(donation_lovelace),
          datum: NoDatum,
          reference_script: None,
        },
      ],
      0,
    )

  // No datum → expect failure
  !milestone_escrow.spend(
    None,
    Release,
    mock_output_ref(),
    tx,
  )
}

// ── Refund Tests ──────────────────────────────────────────────────────────────

test refund_succeeds_after_deadline_with_donor_signature() {
  let after_deadline = refund_deadline + 1000

  let tx =
    mock_tx(
      [donor_pkh],
      [
        Output {
          address: donor_address(),
          value: assets.from_lovelace(donation_lovelace),
          datum: NoDatum,
          reference_script: None,
        },
      ],
      after_deadline,
    )

  milestone_escrow.spend(
    Some(mock_datum()),
    Refund,
    mock_output_ref(),
    tx,
  )
}

test refund_fails_before_deadline() {
  let before_deadline = refund_deadline - 1000

  let tx =
    mock_tx(
      [donor_pkh],
      [
        Output {
          address: donor_address(),
          value: assets.from_lovelace(donation_lovelace),
          datum: NoDatum,
          reference_script: None,
        },
      ],
      before_deadline,
    )

  !milestone_escrow.spend(
    Some(mock_datum()),
    Refund,
    mock_output_ref(),
    tx,
  )
}

test refund_fails_without_donor_signature() {
  let after_deadline = refund_deadline + 1000

  let tx =
    mock_tx(
      // Wrong signer
      [verifier_pkh],
      [
        Output {
          address: donor_address(),
          value: assets.from_lovelace(donation_lovelace),
          datum: NoDatum,
          reference_script: None,
        },
      ],
      after_deadline,
    )

  !milestone_escrow.spend(
    Some(mock_datum()),
    Refund,
    mock_output_ref(),
    tx,
  )
}

test refund_fails_with_both_signatures_but_before_deadline() {
  // Verifier + donor both sign, but deadline not reached — still fails
  let before_deadline = refund_deadline - 1

  let tx =
    mock_tx(
      [donor_pkh, verifier_pkh],
      [
        Output {
          address: donor_address(),
          value: assets.from_lovelace(donation_lovelace),
          datum: NoDatum,
          reference_script: None,
        },
      ],
      before_deadline,
    )

  !milestone_escrow.spend(
    Some(mock_datum()),
    Refund,
    mock_output_ref(),
    tx,
  )
}

// ── Helper Tests ──────────────────────────────────────────────────────────────

test is_vk_credential_matches_correctly() {
  is_vk_credential(VerificationKey(team_pkh), team_pkh)
}

test is_vk_credential_rejects_mismatch() {
  !is_vk_credential(VerificationKey(team_pkh), verifier_pkh)
}
