// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract SaverToken is ERC20, Ownable {
    // Mapping to track claimed rewards per user
    mapping(address => mapping(uint256 => bool)) public claimedMilestones;
    
    // Milestone thresholds in ETH
    uint256[] public milestones = [0.1 ether, 0.5 ether, 1 ether, 5 ether, 10 ether];
    
    // Reward amounts per milestone (in tokens)
    uint256[] public rewards = [100, 500, 1000, 5000, 10000];
    
    // Reference to the savings contract
    address public savingsContract;
    
    event RewardsClaimed(address indexed user, uint256 milestone, uint256 amount);
    
    constructor() ERC20("Saver Token", "SAVER") {
        // Initial supply of 1 million tokens
        _mint(msg.sender, 1000000 * 10**decimals());
    }
    
    function setSavingsContract(address _savingsContract) external onlyOwner {
        savingsContract = _savingsContract;
    }
    
    function getMilestoneReward(uint256 totalSaved) public view returns (uint256) {
        for (uint256 i = milestones.length; i > 0; i--) {
            if (totalSaved >= milestones[i - 1]) {
                return rewards[i - 1];
            }
        }
        return 0;
    }
    
    function claimRewards(uint256 milestone) external {
        require(milestone < milestones.length, "Invalid milestone");
        require(!claimedMilestones[msg.sender][milestone], "Already claimed");
        
        // Verify savings amount through savings contract
        (bool success, bytes memory data) = savingsContract.staticcall(
            abi.encodeWithSignature("getTotalSaved(address)", msg.sender)
        );
        require(success, "Failed to verify savings");
        uint256 totalSaved = abi.decode(data, (uint256));
        
        require(totalSaved >= milestones[milestone], "Milestone not reached");
        
        // Mark as claimed and transfer rewards
        claimedMilestones[msg.sender][milestone] = true;
        uint256 rewardAmount = rewards[milestone] * 10**decimals();
        _transfer(owner(), msg.sender, rewardAmount);
        
        emit RewardsClaimed(msg.sender, milestone, rewardAmount);
    }
    
    function getAvailableMilestones(address user) external view returns (uint256[] memory) {
        uint256[] memory available = new uint256[](milestones.length);
        uint256 count = 0;
        
        (bool success, bytes memory data) = savingsContract.staticcall(
            abi.encodeWithSignature("getTotalSaved(address)", user)
        );
        require(success, "Failed to verify savings");
        uint256 totalSaved = abi.decode(data, (uint256));
        
        for (uint256 i = 0; i < milestones.length; i++) {
            if (totalSaved >= milestones[i] && !claimedMilestones[user][i]) {
                available[count] = i;
                count++;
            }
        }
        
        // Resize array to actual count
        uint256[] memory result = new uint256[](count);
        for (uint256 i = 0; i < count; i++) {
            result[i] = available[i];
        }
        
        return result;
    }

    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }
} 