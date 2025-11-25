# RugbyFundX - Transparent Sports Crowdfunding MVP

A next-generation on-chain crowdfunding platform for Kenyan rugby, providing transparent fund tracking, milestone-based fund release, and active sponsor-player engagement through Cardano blockchain.

## 🎯 Problem Statement

Kenyan rugby's talent is rich but the sport is cash-poor:
- Players quit due to lack of kits and support
- Traditional donations lack transparency
- Funds disappear without proof of usage
- Donors hesitant due to lack of accountability

## ✅ Solution

RugbyFundX provides:

- **On-Chain Financial Transparency**: Every transaction verified and immutable
- **Milestone-Based Funding Automation**: Funds release only when milestone conditions are validated
- **Sponsor Visibility**: Sponsors get proof-of-impact logs built into smart contracts
- **Dual Value Flow**: Funds go to players and players support sponsors through brand engagement
- **Open-Source Public Good**: Entire system reusable for other sports or local community projects

## 🚀 Key Features

### Home Feed
- Public feed listing 10 pilot teams & players
- Real-time community impact metrics
- Recent transaction history
- Problem/solution overview

### Team Pages
- Individual team profiles with funding progress
- Milestone tracking with proof uploads
- Team roster and statistics
- Donation interface

### Transparency Dashboard
- Live table showing every single transaction
- Immutable on-chain verification
- Transaction filtering and search
- Proof-of-impact validation

### Team Dashboard
- Secure login for team captains/coaches
- Receipt and photo uploads
- Milestone completion marking
- Real-time analytics and donor engagement

### Community Metrics
- Total Value Locked (TVL) in donations
- On-chain transaction count
- Active wallets (players, sponsors, donors, teams)
- KPI tracking

## 📊 MVP Goals

- **10 Real Pilot Teams** & 200+ Players using platform
- **5000+ ADA** Total Value Locked in first 6 months
- **1000+ Transactions** within first 6-12 months
- **Community Engagement**: Telegram, Discord, Twitter presence
- **Open-Source Contribution**: Weekly commit history on GitHub

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS 4
- **Language**: TypeScript
- **Blockchain**: Cardano
- **Colors**: 
  - Primary: `#065f46` (Forest Green)
  - Secondary: `#10b981` (Emerald)
  - Background: `#fdfffc` (Off-white)

## 📁 Project Structure

```
src/
├── app/
│   ├── page.tsx           # Home page
│   ├── layout.tsx         # Root layout
│   ├── globals.css        # Global styles
│   ├── teams/
│   │   ├── page.tsx       # Teams listing
│   │   └── [id]/page.tsx  # Team detail
│   ├── transparency/
│   │   └── page.tsx       # Transaction dashboard
│   └── dashboard/
│       └── page.tsx       # Team captain dashboard
├── components/
│   ├── Header.tsx         # Navigation header
│   ├── Footer.tsx         # Footer
│   ├── TeamCard.tsx       # Team card component
│   ├── MetricsGrid.tsx    # Community metrics
│   └── TransactionsTable.tsx  # Transaction list
├── types/
│   └── index.ts           # TypeScript types
└── data/
    └── mockData.ts        # Mock data for MVP
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone or navigate to project
cd rubgyfundx

# Install dependencies
npm install

# Run development server
npm run dev

# Open http://localhost:3000
```

### Build for Production

```bash
npm run build
npm start
```

## 📝 Features in MVP

### ✅ Implemented
- [x] Home page with hero section
- [x] Community impact metrics display
- [x] Problem/solution overview
- [x] 10 mock rugby teams with real Kenya locations
- [x] Team cards with funding progress
- [x] Individual team detail pages
- [x] Transparency page with all transactions
- [x] Transaction table with on-chain links
- [x] Team dashboard UI
- [x] Responsive design (mobile-first)
- [x] Tailwind CSS with custom colors

### 🔄 Ready for Integration
- [ ] Cardano wallet connection (Lucid, Nami, etc.)
- [ ] Smart contract integration for milestones
- [ ] Real team data from Cardano
- [ ] Receipt upload to IPFS
- [ ] User authentication
- [ ] Payment processing

## 🎨 Branding

**Name**: RugbyFundX
**Tagline**: Transparent Sports Crowdfunding
**Colors**:
- Primary Green: `#065f46`
- Secondary Green: `#10b981`
- Accent: `#f97316`
- Background: `#fdfffc`

## 📱 Responsive Design

- Mobile-first approach
- Fully responsive breakpoints
- Touch-friendly UI
- Optimized images with Next.js Image component

## 🔗 Navigation

- **Home** (`/`) - Hero section with featured teams
- **Teams** (`/teams`) - All 10 pilot teams
- **Team Details** (`/teams/[id]`) - Individual team pages
- **Transparency** (`/transparency`) - Live transaction dashboard
- **Dashboard** (`/dashboard`) - Team management interface

## 📜 License

Open-source public good for sports funding

## 🤝 Contributing

This is an open-source project supporting community rugby initiatives in Kenya. Contributions welcome!

---

Built with ❤️ for Kenyan Rugby

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
