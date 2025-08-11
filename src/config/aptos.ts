import { Aptos, AptosConfig, Network } from "@aptos-labs/ts-sdk";

export const CONTRACT_ADDRESS = "0xbdffa7eedb36f54c05ee1540b79c606fe5d75f8bbcecf6844a1502a2b1f9cea6";
export const MODULE_NAME = "InvestDAO";

const config = new AptosConfig({ network: Network.DEVNET });
export const aptos = new Aptos(config);

// Utility functions for amount conversion
export const formatAPT = (octas: number): string => (octas / 100000000).toFixed(4);
export const toOctas = (apt: number): number => Math.floor(apt * 100000000);
export const formatAddress = (address: string): string => 
  `${address.slice(0, 6)}...${address.slice(-4)}`;

// Contract function names
export const CONTRACT_FUNCTIONS = {
  INITIALIZE_DAO: `${CONTRACT_ADDRESS}::${MODULE_NAME}::initialize_dao`,
  JOIN_DAO: `${CONTRACT_ADDRESS}::${MODULE_NAME}::join_dao`,
  DEPOSIT_FUNDS: `${CONTRACT_ADDRESS}::${MODULE_NAME}::deposit_funds`,
  DISTRIBUTE_TOKENS: `${CONTRACT_ADDRESS}::${MODULE_NAME}::distribute_tokens`,
  STAKE_TOKENS: `${CONTRACT_ADDRESS}::${MODULE_NAME}::stake_tokens`,
  CREATE_PROPOSAL: `${CONTRACT_ADDRESS}::${MODULE_NAME}::create_investment_proposal`,
  VOTE_PROPOSAL: `${CONTRACT_ADDRESS}::${MODULE_NAME}::vote_on_proposal`,
  EXECUTE_PROPOSAL: `${CONTRACT_ADDRESS}::${MODULE_NAME}::execute_proposal`,
} as const;

export const CONTRACT_VIEWS = {
  GET_PROPOSAL_INFO: `${CONTRACT_ADDRESS}::${MODULE_NAME}::get_proposal_info`,
  GET_MEMBER_TOKENS: `${CONTRACT_ADDRESS}::${MODULE_NAME}::get_member_tokens`,
  GET_TREASURY_INFO: `${CONTRACT_ADDRESS}::${MODULE_NAME}::get_treasury_info`,
} as const;