export interface Proposal {
  id: number;
  recipient: string;
  requestedAmount: number; // in octas
  yesVotes: number;
  noVotes: number;
  status: 0 | 1 | 2; // Open, Funded, Rejected
  executed: boolean;
}

export interface MemberTokens {
  balance: number;
  stakedBalance: number;
}

export interface TreasuryInfo {
  totalFunds: number; // in octas
  proposalCount: number;
  stakedTokens: number;
}

export interface WalletInfo {
  address: string | null;
  connected: boolean;
  connecting: boolean;
}

export type ProposalStatus = 'Open' | 'Funded' | 'Rejected';

export interface Vote {
  proposalId: number;
  vote: boolean;
  voter: string;
  timestamp: number;
}

export interface DAOStats {
  totalMembers: number;
  totalProposals: number;
  treasuryBalance: number;
  activeProposals: number;
}