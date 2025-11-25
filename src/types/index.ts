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
  amount: number;
  type: "donation" | "payout" | "engagement";
  teamId: string;
  timestamp: string;
  txHash: string;
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
