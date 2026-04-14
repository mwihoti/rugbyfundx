export interface Team {
  id: string;
  name: string;
  location: string;
  playerCount: number;
  totalRaised: number;
  targetAmount: number;
  image: string;
  description: string;
  coach: string;
  established: number;
  walletAddress: string;
  milestones: Milestone[];
}

export interface Player {
  id: string;
  name: string;
  teamId: string;
  position: string;
  number: number;
  image: string;
  bio: string;
  stats: {
    matches: number;
    wins: number;
  };
}

export interface Milestone {
  id: string;
  teamId: string;
  title: string;
  description: string;
  targetAmount: number;
  completed: boolean;
  completedDate?: string;
  proof: string[];
}

export interface Transaction {
  id: string;
  walletAddress: string;
  amount: number;           // ADA amount (or ADA equivalent for KES donations)
  currency?: "ADA" | "KES";
  kshAmount?: number;       // original KSH paid (M-Pesa only)
  adaEquivalent?: number;   // ADA equiv at time of payment (M-Pesa only)
  exchangeRate?: number;    // KES per 1 ADA at time of payment
  type: "donation" | "payout" | "engagement" | "mpesa";
  teamId: string;
  teamName: string;
  timestamp: string;
  txHash: string;           // blockchain tx hash (ADA) or M-Pesa receipt (KES)
  donorNote?: string;
  donorPhone?: string;      // masked: 2547****4149
  status?: "pending" | "confirmed" | "failed";
}

export interface AssistanceRequest {
  id: string;
  teamName: string;
  location: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  category: "kits" | "training" | "medical" | "travel" | "facility" | "other";
  description: string;
  amountRequested: number;
  status: "pending" | "reviewing" | "approved" | "rejected";
  submittedAt: string;
}

export interface Sponsor {
  id: string;
  name: string;
  logoUrl: string;
  totalContributed: number;
  engagementScore: number;
}

export interface CommunityMetrics {
  totalValueLocked: number;
  transactionCount: number;
  activeWallets: number;
  teamsActive: number;
  playersActive: number;
}
