import React, { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { useContractRead, useContractWrite, useWaitForTransaction } from 'wagmi';
import { formatEther } from 'ethers/lib/utils';

// Contract ABIs
const SAVER_TOKEN_ABI = [
  'function getAvailableMilestones(address) view returns (uint256[])',
  'function claimRewards(uint256)',
  'function balanceOf(address) view returns (uint256)',
  'function milestones(uint256) view returns (uint256)',
  'function rewards(uint256) view returns (uint256)'
];

const SAVER_BADGE_ABI = [
  'function getAvailableBadges(address) view returns (uint256[])',
  'function claimBadge(uint256)',
  'function getBadgeDetails(uint256) view returns (uint256, string)',
  'function balanceOf(address) view returns (uint256)',
  'function tokenURI(uint256) view returns (string)'
];

const Rewards = () => {
  const { address } = useAccount();
  const [availableMilestones, setAvailableMilestones] = useState([]);
  const [availableBadges, setAvailableBadges] = useState([]);
  const [tokenBalance, setTokenBalance] = useState('0');
  const [badgeCount, setBadgeCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Contract addresses (replace with actual addresses)
  const SAVER_TOKEN_ADDRESS = '0x...';
  const SAVER_BADGE_ADDRESS = '0x...';

  // Read available milestones
  const { data: milestones } = useContractRead({
    address: SAVER_TOKEN_ADDRESS,
    abi: SAVER_TOKEN_ABI,
    functionName: 'getAvailableMilestones',
    args: [address],
    watch: true,
  });

  // Read available badges
  const { data: badges } = useContractRead({
    address: SAVER_BADGE_ADDRESS,
    abi: SAVER_BADGE_ABI,
    functionName: 'getAvailableBadges',
    args: [address],
    watch: true,
  });

  // Read token balance
  const { data: balance } = useContractRead({
    address: SAVER_TOKEN_ADDRESS,
    abi: SAVER_TOKEN_ABI,
    functionName: 'balanceOf',
    args: [address],
    watch: true,
  });

  // Read badge count
  const { data: badgesOwned } = useContractRead({
    address: SAVER_BADGE_ADDRESS,
    abi: SAVER_BADGE_ABI,
    functionName: 'balanceOf',
    args: [address],
    watch: true,
  });

  // Claim rewards function
  const { write: claimRewards, data: claimRewardsData } = useContractWrite({
    address: SAVER_TOKEN_ADDRESS,
    abi: SAVER_TOKEN_ABI,
    functionName: 'claimRewards',
  });

  // Claim badge function
  const { write: claimBadge, data: claimBadgeData } = useContractWrite({
    address: SAVER_BADGE_ADDRESS,
    abi: SAVER_BADGE_ABI,
    functionName: 'claimBadge',
  });

  // Wait for transactions
  const { isLoading: isClaimingRewards } = useWaitForTransaction({
    hash: claimRewardsData?.hash,
  });

  const { isLoading: isClaimingBadge } = useWaitForTransaction({
    hash: claimBadgeData?.hash,
  });

  useEffect(() => {
    if (milestones) setAvailableMilestones(milestones);
    if (badges) setAvailableBadges(badges);
    if (balance) setTokenBalance(formatEther(balance));
    if (badgesOwned) setBadgeCount(badgesOwned.toNumber());
    setLoading(false);
  }, [milestones, badges, balance, badgesOwned]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-md bg-red-50 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-red-400"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-red-800">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Rewards Section */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Rewards</h2>
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-sm text-gray-500">Token Balance</p>
              <p className="text-2xl font-semibold text-gray-900">
                {tokenBalance} SAVER
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Badges Earned</p>
              <p className="text-2xl font-semibold text-gray-900">
                {badgeCount}
              </p>
            </div>
          </div>

          {/* Available Milestones */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">
              Available Milestones
            </h3>
            {availableMilestones.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {availableMilestones.map((milestone) => (
                  <div
                    key={milestone}
                    className="bg-gray-50 rounded-lg p-4 flex items-center justify-between"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        Milestone {milestone + 1}
                      </p>
                      <p className="text-sm text-gray-500">
                        Claim your reward tokens
                      </p>
                    </div>
                    <button
                      onClick={() => claimRewards({ args: [milestone] })}
                      disabled={isClaimingRewards}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50"
                    >
                      {isClaimingRewards ? 'Claiming...' : 'Claim'}
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No milestones available to claim</p>
            )}
          </div>

          {/* Available Badges */}
          <div className="mt-8 space-y-4">
            <h3 className="text-lg font-medium text-gray-900">
              Available Badges
            </h3>
            {availableBadges.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {availableBadges.map((badge) => (
                  <div
                    key={badge}
                    className="bg-gray-50 rounded-lg p-4 flex items-center justify-between"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        Badge {badge + 1}
                      </p>
                      <p className="text-sm text-gray-500">
                        Claim your achievement badge
                      </p>
                    </div>
                    <button
                      onClick={() => claimBadge({ args: [badge] })}
                      disabled={isClaimingBadge}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50"
                    >
                      {isClaimingBadge ? 'Claiming...' : 'Claim'}
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No badges available to claim</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Rewards; 