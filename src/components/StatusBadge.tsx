import React from 'react';
import { ProposalStatus } from '../types/dao';

interface StatusBadgeProps {
  status: ProposalStatus;
  className?: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '' }) => {
  const getStatusStyles = (status: ProposalStatus) => {
    switch (status) {
      case 'Open':
        return 'bg-grey-700 text-white border border-grey-600';
      case 'Funded':
        return 'bg-grey-200 text-grey-800 border border-grey-300';
      case 'Rejected':
        return 'bg-grey-400 text-white border border-grey-500';
      default:
        return 'bg-grey-300 text-grey-700 border border-grey-400';
    }
  };

  return (
    <span className={`
      inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
      ${getStatusStyles(status)}
      ${className}
    `}>
      {status}
    </span>
  );
};

export default StatusBadge;