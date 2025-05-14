// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract DeFiSavingsGoal is Ownable, ReentrancyGuard {
    IERC20 public saverToken;
    uint256 public constant MINIMUM_SAVINGS = 100 * 10**18; // 100 tokens minimum
    uint256 public constant REWARD_RATE = 5; // 5% reward rate

    struct SavingsGoal {
        uint256 targetAmount;
        uint256 currentAmount;
        uint256 startTime;
        uint256 endTime;
        bool isCompleted;
        bool isWithdrawn;
    }

    mapping(address => SavingsGoal) public savingsGoals;
    mapping(address => uint256) public rewards;

    event GoalCreated(address indexed user, uint256 targetAmount, uint256 endTime);
    event SavingsAdded(address indexed user, uint256 amount);
    event GoalCompleted(address indexed user, uint256 reward);
    event RewardWithdrawn(address indexed user, uint256 amount);

    constructor(address _saverToken) {
        saverToken = IERC20(_saverToken);
    }

    function createGoal(uint256 _targetAmount, uint256 _durationInDays) external {
        require(_targetAmount >= MINIMUM_SAVINGS, "Target amount too low");
        require(savingsGoals[msg.sender].startTime == 0, "Goal already exists");

        savingsGoals[msg.sender] = SavingsGoal({
            targetAmount: _targetAmount,
            currentAmount: 0,
            startTime: block.timestamp,
            endTime: block.timestamp + (_durationInDays * 1 days),
            isCompleted: false,
            isWithdrawn: false
        });

        emit GoalCreated(msg.sender, _targetAmount, block.timestamp + (_durationInDays * 1 days));
    }

    function addSavings(uint256 _amount) external nonReentrant {
        require(_amount > 0, "Amount must be greater than 0");
        require(savingsGoals[msg.sender].startTime != 0, "No goal exists");
        require(!savingsGoals[msg.sender].isCompleted, "Goal already completed");

        require(saverToken.transferFrom(msg.sender, address(this), _amount), "Transfer failed");

        savingsGoals[msg.sender].currentAmount += _amount;

        if (savingsGoals[msg.sender].currentAmount >= savingsGoals[msg.sender].targetAmount) {
            _completeGoal();
        }

        emit SavingsAdded(msg.sender, _amount);
    }

    function _completeGoal() internal {
        SavingsGoal storage goal = savingsGoals[msg.sender];
        goal.isCompleted = true;
        
        uint256 reward = (goal.currentAmount * REWARD_RATE) / 100;
        rewards[msg.sender] = reward;

        emit GoalCompleted(msg.sender, reward);
    }

    function withdrawReward() external nonReentrant {
        require(rewards[msg.sender] > 0, "No rewards available");
        require(savingsGoals[msg.sender].isCompleted, "Goal not completed");

        uint256 reward = rewards[msg.sender];
        rewards[msg.sender] = 0;

        require(saverToken.transfer(msg.sender, reward), "Reward transfer failed");
        emit RewardWithdrawn(msg.sender, reward);
    }

    function withdrawSavings() external nonReentrant {
        SavingsGoal storage goal = savingsGoals[msg.sender];
        require(goal.startTime != 0, "No goal exists");
        require(!goal.isWithdrawn, "Already withdrawn");
        require(block.timestamp >= goal.endTime || goal.isCompleted, "Cannot withdraw yet");

        uint256 amount = goal.currentAmount;
        goal.isWithdrawn = true;

        require(saverToken.transfer(msg.sender, amount), "Transfer failed");
    }

    function getGoalDetails(address _user) external view returns (
        uint256 targetAmount,
        uint256 currentAmount,
        uint256 startTime,
        uint256 endTime,
        bool isCompleted,
        bool isWithdrawn
    ) {
        SavingsGoal storage goal = savingsGoals[_user];
        return (
            goal.targetAmount,
            goal.currentAmount,
            goal.startTime,
            goal.endTime,
            goal.isCompleted,
            goal.isWithdrawn
        );
    }
} 