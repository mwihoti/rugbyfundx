# RugbyFundX — Whitepaper v0.1

**Transparent On-Chain Crowdfunding for Kenyan Rugby**  
*Built on Cardano · Milestone-Based · Donor-Protected*

---

## Table of Contents

1. [Abstract](#1-abstract)
2. [Problem Statement](#2-problem-statement)
3. [Solution Overview](#3-solution-overview)
4. [Technical Architecture](#4-technical-architecture)
5. [Smart Contract Design](#5-smart-contract-design)
6. [Transaction Flows](#6-transaction-flows)
7. [Platform Economics](#7-platform-economics)
8. [Roadmap](#8-roadmap)
9. [Impact Metrics & KPIs](#9-impact-metrics--kpis)
10. [Risk Analysis](#10-risk-analysis)
11. [Team](#11-team)
12. [Project Catalyst Application](#12-project-catalyst-application)
13. [Appendix — Contract Reference](#13-appendix--contract-reference)

---

## 1. Abstract

Kenyan rugby has a structural funding problem. Talented players quit not because they lack skill, but because their clubs cannot afford kits, coaching, or travel to competitions. Traditional donor channels fail because money disappears with no proof of use — donors stop giving, clubs stop receiving.

**RugbyFundX** solves this with on-chain crowdfunding on the Cardano blockchain. Every donation is held in a smart contract and released to clubs only when verifiable milestones are met — receipts uploaded, training completed, equipment delivered. Donors see exactly where their ADA goes. Clubs build a transparent track record that attracts future sponsors.

This is not another charity platform. It is a trust infrastructure — programmable accountability for grassroots sports.

---

## 2. Problem Statement

### 2.1 The Kenyan Rugby Funding Gap

Kenya produces world-class rugby talent. The national sevens team (Shujaa) consistently competes at the HSBC World Rugby Sevens Series. Yet at the club level, the story is starkly different:

- **Players quit** because clubs cannot afford basic kits (cost: ~KES 15,000 / $115 per player)
- **Clubs self-fund** through member contributions that are inconsistent and insufficient
- **Corporate sponsors** exist but demand accountability that clubs cannot demonstrate
- **NGO funding** is slow, bureaucratic, and often misallocated

The gap between Kenya's rugby talent and its infrastructure is a resolvable coordination problem — not a talent or willingness problem.

### 2.2 Why Traditional Crowdfunding Fails

Existing platforms (GoFundMe, M-Changa, Pesapal) share three fatal flaws for this use case:

| Problem | Impact |
|---|---|
| No proof of fund use | Donors give once, never again |
| Platform takes 3–8% cut | Less money reaches teams |
| Bank account required | Excludes unbanked club managers |
| No donor engagement after giving | No long-term relationship |

### 2.3 The Trust Deficit

The core problem is not lack of donor generosity — it is the absence of trusted infrastructure. A donor who sends KES 50,000 to a club WhatsApp number has no way to verify it was used for kits. The club has no incentive to prove it. The donor stops giving.

RugbyFundX breaks this cycle by making accountability the default — not an afterthought.

---

## 3. Solution Overview

### 3.1 Core Mechanic: Milestone-Based Fund Release

```
  Donor sends ADA                Team unlocks funds
  ───────────────►  [ESCROW]  ◄──────────────────────
                   Smart Contract   Verifier approves:
                    (locked)        ✓ Receipt uploaded
                                    ✓ Photo proof
                                    ✓ Milestone met
```

1. **Donor donates ADA** to a team's campaign — funds lock in a Cardano smart contract
2. **Team completes a milestone** (buys kits, runs training camp, wins tournament)
3. **Platform verifier** checks proof (receipts, photos, event results) off-chain
4. **Verifier signs** the release transaction on-chain — ADA flows to team wallet
5. **If no milestone** is met within the deadline — donor reclaims ADA, no loss

### 3.2 What Makes It Different

| Feature | Traditional | RugbyFundX |
|---|---|---|
| Fund custody | Platform/charity | Smart contract |
| Release trigger | Manual / trust | Verifiable milestone |
| Donor recourse | None | Auto-refund after deadline |
| Transparency | Reports (if any) | On-chain, real-time |
| Fees | 3–8% | Protocol minimum (<1%) |
| Wallet required | Bank account | Cardano wallet (any device) |

### 3.3 Self-Custodial Access

Donors without existing Cardano wallets can create one directly in the RugbyFundX web app — a 24-word recovery phrase wallet generated in the browser, with testnet ADA available immediately from the Cardano faucet. No app store, no KYC, no bank account required.

---

## 4. Technical Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         USER LAYER                                   │
│   Browser Wallets (Nami, Eternl, Flint, Yoroi)                      │
│   Self-Custodial Wallet (generated in-browser via Mesh SDK)         │
└──────────────────────────────┬──────────────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────────────┐
│                       FRONTEND (Next.js 16)                          │
│                                                                      │
│  Pages: Home · Teams · Transparency · Wallet · Request · Dashboard  │
│  Wallet: WalletContext (Mesh SDK, dynamic import)                    │
│  UI: Tailwind CSS 4, React 19, TypeScript 5                         │
└──────────────────────────────┬──────────────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────────────┐
│                         API LAYER (Next.js)                          │
│                                                                      │
│  /api/teams          /api/transactions                               │
│  /api/requests       /api/metrics                                    │
│                                                                      │
│  Storage: JSON file store (dev) → PostgreSQL/Supabase (production)  │
└──────────────────────────────┬──────────────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────────────┐
│                      BLOCKCHAIN LAYER (Cardano)                      │
│                                                                      │
│  Network: Preprod Testnet (→ Mainnet)                               │
│  SDK: Mesh.js v1.9 (BrowserWallet + MeshWallet)                     │
│  Provider: KoiosProvider                                             │
│                                                                      │
│  Smart Contracts (Aiken v1.1):                                      │
│  ┌─────────────────────┐  ┌───────────────────────────┐            │
│  │  milestone_escrow   │  │   milestone_registry      │            │
│  │  (per-donation UTxO)│  │   (per-team state UTxO)   │            │
│  └─────────────────────┘  └───────────────────────────┘            │
│  ┌────────────────────────┐                                         │
│  │  team_registry_mint    │                                         │
│  │  (one-shot NFT policy) │                                         │
│  └────────────────────────┘                                         │
└─────────────────────────────────────────────────────────────────────┘
```

### 4.1 Tech Stack

| Layer | Technology | Rationale |
|---|---|---|
| Framework | Next.js 16 (App Router) | SSR + API routes in one deploy |
| Language | TypeScript 5 | Type safety across frontend + contracts |
| Styling | Tailwind CSS 4 | Rapid, consistent UI |
| Blockchain SDK | Mesh.js v1.9 | Best-in-class Cardano + Next.js integration |
| Smart Contracts | Aiken v1.1 | Modern, typed, Plutus V3 |
| Contract Provider | KoiosProvider | Free, no API key, decentralised |
| Package Manager | Bun | Fast builds |

---

## 5. Smart Contract Design

### 5.1 milestone_escrow Validator

The primary trust primitive. Each donation creates one UTxO at the script address.

**Datum:**

```aiken
pub type EscrowDatum {
  team_pkh:         VerificationKeyHash,  // Team receiving funds
  verifier_pkh:     VerificationKeyHash,  // Platform verifier (multisig)
  donor_pkh:        VerificationKeyHash,  // Original donor (for refunds)
  team_id:          ByteArray,            // Off-chain team reference
  refund_deadline:  Int,                  // POSIX ms — donor can refund after this
  donation_amount:  Int,                  // Lovelace donated (for audit)
}
```

**Redeemer:**

```aiken
pub type EscrowRedeemer {
  Release  // Verifier releases to team
  Refund   // Donor reclaims after deadline
}
```

**Release conditions:**
- Verifier key hash in `tx.extra_signatories`
- Team payment credential appears in at least one output

**Refund conditions:**
- Donor key hash in `tx.extra_signatories`
- Transaction validity lower bound ≥ `refund_deadline`

**Security properties:**
- No admin backdoor — even the platform cannot drain funds without verifier key
- Donor funds are isolated per UTxO — one team's issue cannot affect another
- Verifier key is designed for multisig (2-of-3 recommended in production)

### 5.2 milestone_registry Validator

Maintains authoritative on-chain team state. One UTxO per team, gated by a team NFT.

**Datum:**

```aiken
pub type MilestoneRegistryDatum {
  team_id:                  ByteArray,
  team_pkh:                 VerificationKeyHash,
  verifier_pkh:             VerificationKeyHash,
  total_milestones:         Int,
  milestones_completed:     Int,
  total_raised_lovelace:    Int,
  total_released_lovelace:  Int,
  active:                   Bool,
}
```

**State transitions:**
- `MarkMilestoneComplete` → `milestones_completed + 1`, `total_released_lovelace + N`
- `DeactivateTeam` → `active = False`

Each state transition produces a new UTxO with an updated inline datum — creating a full on-chain audit trail.

### 5.3 team_registry_mint Policy

One-shot minting policy. Mints exactly 1 NFT per team registration:
- Must consume a specific UTxO (prevents double-minting)
- Verifier must sign
- Token quantity must be exactly 1

The NFT asset name encodes the `team_id`, enabling indexed queries via Koios.

### 5.4 Threat Model

| Threat | Mitigation |
|---|---|
| Platform steals donor funds | Impossible — script requires verifier key + team output |
| Team claims milestone without completing | Verifier checks off-chain proof before signing |
| Verifier key compromised | Multisig required (2-of-3) — one key theft is insufficient |
| Team wallet compromised | Donor refund path still open after deadline |
| Double-spend / replay | Cardano eUTxO model — each UTxO can only be spent once |
| Fake team registration | Verifier signs all registrations; team NFT is one-shot |

---

## 6. Transaction Flows

### 6.1 Donation Flow

```
  ┌──────────┐    ① Send ADA + datum     ┌────────────────────┐
  │  Donor   │ ─────────────────────────► │  milestone_escrow  │
  │  Wallet  │                            │  (script address)  │
  └──────────┘                            │                    │
                                          │  UTxO:             │
                                          │  value: N lovelace │
                                          │  datum: EscrowDatum│
                                          └────────────────────┘
```

### 6.2 Milestone Release Flow

```
  ┌──────────┐  ② Proof uploaded    ┌───────────┐
  │   Team   │ ────────────────────► │ Verifier  │
  └──────────┘  (receipts/photos)   │ (off-chain│
                                     │ review)   │
                                     └─────┬─────┘
                                           │ ③ Signs release tx
                                           ▼
  ┌────────────────────┐            ┌─────────────┐
  │  milestone_escrow  │ ──ADA────► │  Team Wallet│
  │  UTxO (spent)      │            └─────────────┘
  └────────────────────┘
           │
           └──► ┌────────────────────┐
                │ milestone_registry  │ (datum updated: +1 completed)
                │ UTxO (continued)    │
                └────────────────────┘
```

### 6.3 Refund Flow (Deadline Passed)

```
  ┌──────────┐  ④ After refund_deadline  ┌────────────────────┐
  │  Donor   │ ◄── ADA ──────────────────│  milestone_escrow  │
  │  Wallet  │    (donor signs tx)        │  UTxO (spent)      │
  └──────────┘                            └────────────────────┘
```

---

## 7. Platform Economics

### 7.1 Fee Structure (Phase 1 — No Protocol Fee)

During the pilot phase, RugbyFundX charges **zero platform fee**. The only cost to donors is the Cardano network transaction fee (~0.17–0.25 ADA per transaction).

This maximises fund flow to teams and builds trust during the critical early adoption phase.

### 7.2 Sustainable Revenue (Phase 2)

From Q3 2026, a 1% protocol fee on released milestone funds:
- Charged only on successful releases (not on donations or refunds)
- Fee flows to a DAO treasury controlled by ADA holders and platform stakeholders
- Estimated revenue at 10,000 ADA monthly TVL: ~100 ADA/month

### 7.3 No Native Token

RugbyFundX operates entirely in ADA. No governance token or speculative asset is planned. This keeps the platform focused on impact rather than token economics and reduces regulatory risk.

---

## 8. Roadmap

### Phase 1 — Foundation (Q1–Q2 2026) ✓ In Progress

- [x] Platform UI — all pages functional
- [x] Wallet integration (browser + self-custodial via Mesh SDK)
- [x] Donation flow (testnet)
- [x] Assistance request system
- [x] API layer + JSON data store
- [ ] Aiken smart contract deployment to preprod testnet
- [ ] On-chain escrow integration with frontend
- [ ] Verifier key setup (initially 1-of-1, then multisig)
- [ ] 3 pilot team onboarding (Nairobi, Mombasa, Kisumu)

### Phase 2 — Pilot (Q3 2026)

- [ ] Mainnet launch with 3 pilot teams
- [ ] Real donor acquisition (target: 50 donors, 500 ADA raised)
- [ ] Milestone verification workflow for verifier team
- [ ] PostgreSQL migration (replace JSON store)
- [ ] IPFS integration for proof uploads
- [ ] Mobile-responsive polish

### Phase 3 — Scale (Q4 2026 – Q1 2027)

- [ ] 10 active teams on mainnet
- [ ] Milestone registry NFTs deployed
- [ ] Community verifier onboarding (decentralise verification)
- [ ] Cardano identity integration (DID for team/player verification)
- [ ] Expand beyond rugby (other Kenyan sports)
- [ ] 1,000 ADA TVL milestone

### Phase 4 — Ecosystem (2027)

- [ ] Open-source the smart contracts for other African sports orgs
- [ ] Partner with Kenya Rugby Union for official endorsement
- [ ] Cross-border expansion (Uganda, Tanzania, Rwanda)
- [ ] Grant program funded by protocol fees

---

## 9. Impact Metrics & KPIs

### On-Chain KPIs (measurable, trustless)

| Metric | 6-Month Target | 12-Month Target |
|---|---|---|
| Total Value Locked | 500 ADA | 5,000 ADA |
| Active Teams | 3 | 10 |
| On-Chain Transactions | 50 | 500 |
| Active Donor Wallets | 30 | 200 |
| Milestones Released | 5 | 50 |

### Off-Chain Impact KPIs

| Metric | 6-Month Target | 12-Month Target |
|---|---|---|
| Active Players Supported | 60 | 250 |
| Kits Purchased via Platform | 30 | 150 |
| Training Camps Funded | 1 | 5 |
| Clubs with On-Chain History | 3 | 10 |

### Why These Numbers Are Realistic

Kenya's rugby community is digitally active — club managers use WhatsApp, players have smartphones, and the diaspora (UK, USA, Australia) regularly sends remittances. Diaspora Kenyans are a core target donor segment — they already want to support home sports but have no trusted channel.

---

## 10. Risk Analysis

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Smart contract bug | Low | High | Aiken type system, test suite, audit before mainnet |
| Verifier key compromise | Low | High | Multisig (2-of-3) from Phase 2 |
| Low donor adoption | Medium | High | Diaspora-first marketing, influencer partnerships |
| Team fraud (fake receipts) | Medium | Medium | Physical verification for large releases, community reporting |
| Cardano network congestion | Low | Medium | KoiosProvider fallback, retry logic |
| Regulatory issues (Kenya) | Low | Medium | No KYC required, ADA is not classified as security in Kenya |
| Competition from existing platforms | Low | Low | No existing Cardano-native sports crowdfunding in Kenya |

---

## 11. Team

**Founder & Lead Developer**
- Cardano ecosystem builder
- Full-stack experience with Next.js, TypeScript
- Passionate about African sports development

*We are actively seeking co-founders with expertise in:*
- Aiken/Plutus smart contract development
- Kenya rugby community relationships
- Business development and donor acquisition

---

## 12. Project Catalyst Application

### Fund Category Fit

RugbyFundX is a strong candidate for:

- **Fund 14 — dApps, Products & Integrations** — A working dApp on Cardano with real social impact
- **Fund 14 — Cardano Open: Ecosystem** — Building infrastructure for African communities on Cardano

### Budget Request: 30,000 ADA

| Milestone | Deliverable | Budget |
|---|---|---|
| M1 (Month 1–2) | Smart contract audit + mainnet deployment | 8,000 ADA |
| M2 (Month 2–3) | 3 pilot teams onboarded, real transactions | 6,000 ADA |
| M3 (Month 3–4) | IPFS integration, verifier workflow | 5,000 ADA |
| M4 (Month 4–5) | PostgreSQL migration, performance | 4,000 ADA |
| M5 (Month 5–6) | Community outreach, 50 donor milestone | 4,000 ADA |
| Reserve | Security audit, unexpected costs | 3,000 ADA |

### Success Criteria (verifiable on-chain)

1. `milestone_escrow` validator deployed to mainnet (verifiable via script hash)
2. ≥ 3 teams with on-chain registry UTxOs
3. ≥ 1 milestone release transaction on mainnet
4. ≥ 50 ADA TVL (verifiable via script address balance)
5. Open-source repository with Aiken tests passing

### Why Cardano?

- **eUTxO model** is uniquely suited to per-donation isolation — each donor's funds are independent UTxOs, not pooled in an account
- **Plutus V3 / Aiken** enables expressive, auditable smart contracts without Ethereum's gas model
- **Low transaction fees** (~0.17 ADA) make microtransactions viable for small club donations
- **Cardano's African presence** (Ethiopia, Tanzania partnerships) aligns with RugbyFundX's mission

---

## 13. Appendix — Contract Reference

### Contract Addresses (Preprod Testnet)

*To be populated after deployment*

| Contract | Script Hash | Address |
|---|---|---|
| milestone_escrow | TBD | TBD |
| milestone_registry | TBD | TBD |
| team_registry_mint | TBD | TBD |

### Repository Structure

```
rugbyfundx/
├── src/
│   ├── app/               # Next.js pages + API routes
│   ├── components/        # React components
│   ├── context/           # WalletContext (Mesh SDK)
│   ├── lib/               # Data store utilities
│   ├── providers/         # App-level providers
│   └── types/             # TypeScript interfaces
├── contracts/
│   ├── aiken.toml         # Aiken project config
│   ├── validators/
│   │   ├── milestone_escrow.ak        # Core escrow validator
│   │   ├── milestone_escrow_test.ak   # Unit tests
│   │   └── milestone_registry.ak      # Registry + mint policy
│   └── lib/rugbyfundx/
│       └── types.ak       # Shared on-chain types
├── data/                  # JSON data store (dev)
├── WHITEPAPER.md          # This document
└── README.md
```

### Key Identifiers

- **Platform Verifier** (testnet): TBD — multisig script address
- **Network**: Cardano Preprod → Mainnet
- **ADA Explorer**: [preprod.cardanoscan.io](https://preprod.cardanoscan.io)

---

*RugbyFundX — Building trust infrastructure for African grassroots sports.*  
*Open source. No VC. Community-owned.*

---

**Version**: 0.1  
**Date**: April 2026  
**License**: MIT  
**Repository**: github.com/mwihoti/rugbyfundx *(to be made public)*
