import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { aptos, CONTRACT_FUNCTIONS, CONTRACT_VIEWS, formatAPT } from '../config/aptos';
import { useWallet } from '../contexts/WalletContext';
import { Proposal, MemberTokens, TreasuryInfo, DAOStats } from '../types/dao';
import toast from 'react-hot-toast';

export const useDAO = () => {
  const { wallet, signAndSubmitTransaction } = useWallet();
  const queryClient = useQueryClient();

  // Fetch treasury information
  const { data: treasuryInfo, isLoading: treasuryLoading } = useQuery({
    queryKey: ['treasury'],
    queryFn: async (): Promise<TreasuryInfo> => {
      const result = await aptos.view({
        function: CONTRACT_VIEWS.GET_TREASURY_INFO,
        arguments: [wallet.address],
      });
      return {
        totalFunds: Number(result[0]),
        proposalCount: Number(result[1]),
        stakedTokens: Number(result[2]),
      };
    },
    enabled: !!wallet.connected,
    refetchInterval: 5000, // Refetch every 5 seconds
  });

  // Fetch member tokens
  const { data: memberTokens, isLoading: tokensLoading } = useQuery({
    queryKey: ['memberTokens', wallet.address],
    queryFn: async (): Promise<MemberTokens> => {
      const result = await aptos.view({
        function: CONTRACT_VIEWS.GET_MEMBER_TOKENS,
        arguments: [wallet.address],
      });
      return {
        balance: Number(result[0]),
        stakedBalance: Number(result[1]),
      };
    },
    enabled: !!wallet.connected,
    refetchInterval: 5000,
  });

  // Fetch proposal information
  const fetchProposal = async (proposalId: number): Promise<Proposal> => {
    const result = await aptos.view({
      function: CONTRACT_VIEWS.GET_PROPOSAL_INFO,
      arguments: [wallet.address, proposalId],
    });
    return {
      id: proposalId,
      recipient: result[0] as string,
      requestedAmount: Number(result[1]),
      yesVotes: Number(result[2]),
      noVotes: Number(result[3]),
      status: Number(result[4]) as 0 | 1 | 2,
      executed: Boolean(result[5]),
    };
  };

  // Fetch all proposals
  const { data: proposals = [], isLoading: proposalsLoading } = useQuery({
    queryKey: ['proposals'],
    queryFn: async (): Promise<Proposal[]> => {
      if (!treasuryInfo) return [];
      
      const proposalPromises = Array.from(
        { length: treasuryInfo.proposalCount }, 
        (_, i) => fetchProposal(i + 1)
      );
      
      return Promise.all(proposalPromises);
    },
    enabled: !!treasuryInfo?.proposalCount && !!wallet.connected,
    refetchInterval: 10000,
  });

  // Calculate DAO stats
  const daoStats: DAOStats = {
    totalMembers: 0, // This would need additional contract view function
    totalProposals: treasuryInfo?.proposalCount || 0,
    treasuryBalance: treasuryInfo?.totalFunds || 0,
    activeProposals: proposals.filter(p => p.status === 0).length,
  };

  // Join DAO mutation
  const joinDAOMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        function: CONTRACT_FUNCTIONS.JOIN_DAO,
        arguments: [],
      };
      return signAndSubmitTransaction(payload);
    },
    onSuccess: () => {
      toast.success('Successfully joined the DAO!');
      queryClient.invalidateQueries({ queryKey: ['memberTokens'] });
    },
    onError: (error) => {
      toast.error('Failed to join DAO');
      console.error(error);
    },
  });

  // Stake tokens mutation
  const stakeTokensMutation = useMutation({
    mutationFn: async (amount: number) => {
      const payload = {
        function: CONTRACT_FUNCTIONS.STAKE_TOKENS,
        arguments: [wallet.address, amount],
      };
      return signAndSubmitTransaction(payload);
    },
    onSuccess: () => {
      toast.success('Tokens staked successfully!');
      queryClient.invalidateQueries({ queryKey: ['memberTokens'] });
      queryClient.invalidateQueries({ queryKey: ['treasury'] });
    },
    onError: (error) => {
      toast.error('Failed to stake tokens');
      console.error(error);
    },
  });

  // Create proposal mutation
  const createProposalMutation = useMutation({
    mutationFn: async ({ recipient, amount }: { recipient: string; amount: number }) => {
      const payload = {
        function: CONTRACT_FUNCTIONS.CREATE_PROPOSAL,
        arguments: [wallet.address, recipient, amount],
      };
      return signAndSubmitTransaction(payload);
    },
    onSuccess: () => {
      toast.success('Proposal created successfully!');
      queryClient.invalidateQueries({ queryKey: ['proposals'] });
      queryClient.invalidateQueries({ queryKey: ['treasury'] });
    },
    onError: (error) => {
      toast.error('Failed to create proposal');
      console.error(error);
    },
  });

  // Vote on proposal mutation
  const voteProposalMutation = useMutation({
    mutationFn: async ({ proposalId, vote }: { proposalId: number; vote: boolean }) => {
      const payload = {
        function: CONTRACT_FUNCTIONS.VOTE_PROPOSAL,
        arguments: [wallet.address, proposalId, vote],
      };
      return signAndSubmitTransaction(payload);
    },
    onSuccess: () => {
      toast.success('Vote submitted successfully!');
      queryClient.invalidateQueries({ queryKey: ['proposals'] });
    },
    onError: (error) => {
      toast.error('Failed to submit vote');
      console.error(error);
    },
  });

  // Execute proposal mutation (admin only)
  const executeProposalMutation = useMutation({
    mutationFn: async (proposalId: number) => {
      const payload = {
        function: CONTRACT_FUNCTIONS.EXECUTE_PROPOSAL,
        arguments: [wallet.address, proposalId],
      };
      return signAndSubmitTransaction(payload);
    },
    onSuccess: () => {
      toast.success('Proposal executed successfully!');
      queryClient.invalidateQueries({ queryKey: ['proposals'] });
      queryClient.invalidateQueries({ queryKey: ['treasury'] });
    },
    onError: (error) => {
      toast.error('Failed to execute proposal');
      console.error(error);
    },
  });

  return {
    // Data
    treasuryInfo,
    memberTokens,
    proposals,
    daoStats,
    
    // Loading states
    treasuryLoading,
    tokensLoading,
    proposalsLoading,
    
    // Mutations
    joinDAO: joinDAOMutation.mutate,
    stakeTokens: stakeTokensMutation.mutate,
    createProposal: createProposalMutation.mutate,
    voteProposal: voteProposalMutation.mutate,
    executeProposal: executeProposalMutation.mutate,
    
    // Mutation states
    isJoining: joinDAOMutation.isPending,
    isStaking: stakeTokensMutation.isPending,
    isCreatingProposal: createProposalMutation.isPending,
    isVoting: voteProposalMutation.isPending,
    isExecuting: executeProposalMutation.isPending,
    
    // Utilities
    fetchProposal,
  };
};