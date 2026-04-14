// ──────────────────────────────────────────────────────────────────────────────
// RugbyFundX — Milestone Registry Validator
//
// PURPOSE
// -------
// Maintains an on-chain record of each team's milestone progress. A single
// "registry UTxO" per team (identified by a team NFT in the value) acts as the
// authoritative on-chain state for:
//   - How many milestones have been completed
//   - Total ADA raised and released
//   - Whether the team is still active
//
// This UTxO is updated (spent and re-output) each time the verifier marks a
// milestone complete, creating a full audit trail of state transitions.
//
// RELATIONSHIP TO ESCROW
// ----------------------
// The registry is a companion to milestone_escrow. The typical flow is:
//   1. Donor → milestone_escrow UTxO (locked funds)
//   2. Verifier verifies receipt/proof off-chain
//   3. Verifier submits tx that:
//      a. Spends escrow UTxOs (funds → team)
//      b. Spends registry UTxO (updates datum, returns to registry address)
//
// TEAM NFT
// --------
// Each team registry UTxO carries a unique NFT (minted via team_registry_mint
// validator below). The NFT policy ID + asset name = team identity on-chain.
// This prevents duplicate registries and enables indexer queries.
//
// ──────────────────────────────────────────────────────────────────────────────

use aiken/collection/list
use aiken/crypto.{VerificationKeyHash}
use cardano/address.{VerificationKey}
use cardano/assets.{PolicyId}
use cardano/transaction.{OutputReference, Transaction}
use rugbyfundx/types.{
  DeactivateTeam, MarkMilestoneComplete, MilestoneRegistryDatum, RegistryRedeemer,
}

// ── Registry Validator ────────────────────────────────────────────────────────

validator milestone_registry(
  // Policy ID of the NFT that identifies this team's registry UTxO
  // Parameterised at compile time — one script instance per team
  team_nft_policy: PolicyId,
) {
  spend(
    datum: Option<MilestoneRegistryDatum>,
    redeemer: RegistryRedeemer,
    own_ref: OutputReference,
    tx: Transaction,
  ) {
    expect Some(d) = datum

    // Verifier must always sign registry updates
    let verifier_signed =
      list.has(tx.extra_signatories, d.verifier_pkh)

    when redeemer is {
      // ── Mark Milestone Complete ──────────────────────────────────────────────
      MarkMilestoneComplete { released_lovelace } -> {
        expect verifier_signed

        // Team must still be active
        expect d.active

        // Cannot complete more milestones than defined
        expect d.milestones_completed < d.total_milestones

        // Find the continuing registry output (must return NFT to script)
        let own_input =
          find_own_input(tx, own_ref)

        expect Some(own_in) = own_input

        let script_address = own_in.output.address

        // Verify the registry UTxO is correctly updated and returned to script
        list.any(
          tx.outputs,
          fn(output) {
            // Must return to same script address
            let correct_address = output.address == script_address

            // Must carry the team NFT forward
            let has_nft =
              assets_contain_policy(output.value, team_nft_policy)

            // Inline datum must reflect the state transition
            let correct_datum =
              when output.datum is {
                cardano/transaction.InlineDatum(raw) -> {
                  expect new_d: MilestoneRegistryDatum = raw
                  and {
                    new_d.team_id == d.team_id,
                    new_d.team_pkh == d.team_pkh,
                    new_d.verifier_pkh == d.verifier_pkh,
                    new_d.total_milestones == d.total_milestones,
                    new_d.milestones_completed == d.milestones_completed + 1,
                    new_d.total_raised_lovelace == d.total_raised_lovelace,
                    new_d.total_released_lovelace == d.total_released_lovelace + released_lovelace,
                    new_d.active == True,
                  }
                }
                _ -> False
              }

            correct_address && has_nft && correct_datum
          },
        )
      }

      // ── Deactivate Team ──────────────────────────────────────────────────────
      // Verifier can deactivate a team (fraud / inactivity).
      // Deactivated teams cannot receive new milestone releases.
      // Donors with active escrow UTxOs can still refund after their deadline.
      DeactivateTeam -> {
        expect verifier_signed

        let own_input = find_own_input(tx, own_ref)
        expect Some(own_in) = own_input
        let script_address = own_in.output.address

        list.any(
          tx.outputs,
          fn(output) {
            let correct_address = output.address == script_address
            let has_nft = assets_contain_policy(output.value, team_nft_policy)
            let marks_inactive =
              when output.datum is {
                cardano/transaction.InlineDatum(raw) -> {
                  expect new_d: MilestoneRegistryDatum = raw
                  !new_d.active && new_d.team_id == d.team_id
                }
                _ -> False
              }
            correct_address && has_nft && marks_inactive
          },
        )
      }
    }
  }

  else(_) {
    fail
  }
}

// ── Team NFT Minting Policy ───────────────────────────────────────────────────
// One-shot minting policy: can only mint once (tied to a specific UTxO).
// The asset name encodes the team_id for indexer discoverability.
//
// Usage: mint exactly 1 token with asset_name = team_id when registering a team.
// The token is held permanently in the registry UTxO.

validator team_registry_mint(
  // The UTxO that must be consumed when minting (one-shot guarantee)
  utxo_ref: OutputReference,
  // The platform verifier must authorise team registration
  verifier_pkh: VerificationKeyHash,
) {
  mint(redeemer: Void, policy_id: PolicyId, tx: Transaction) {
    // One-shot: the specified UTxO must be spent in this transaction
    let utxo_consumed =
      list.any(tx.inputs, fn(input) { input.output_reference == utxo_ref })

    // Verifier must sign the registration
    let verifier_signed =
      list.has(tx.extra_signatories, verifier_pkh)

    // Exactly 1 token must be minted (no burning, no extra tokens)
    let minted_tokens = assets.tokens(tx.mint, policy_id)
    let exactly_one_minted =
      dict.size(minted_tokens) == 1 && list.all(
        dict.values(minted_tokens),
        fn(qty) { qty == 1 },
      )

    utxo_consumed && verifier_signed && exactly_one_minted
  }

  else(_) {
    fail
  }
}

// ── Internal Helpers ──────────────────────────────────────────────────────────

fn find_own_input(tx: Transaction, own_ref: OutputReference) {
  list.find(tx.inputs, fn(input) { input.output_reference == own_ref })
}

fn assets_contain_policy(value: cardano/assets.Value, policy: PolicyId) -> Bool {
  !dict.is_empty(assets.tokens(value, policy))
}
