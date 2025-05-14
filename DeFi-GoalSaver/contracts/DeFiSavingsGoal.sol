// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@aave/core-v3/contracts/interfaces/IPool.sol";
import "@aave/core-v3/contracts/interfaces/IPoolAddressesProvider.sol";

contract DeFiSavingsGoal is Ownable, ReentrancyGuard {
    // Struct to store goal details
    struct Goal {
        uint256 targetAmount;
        uint256 deadline;
        uint256 currentAmount;
        uint256 lastDepositTimestamp;
        bool isActive;
        mapping(address => uint256) deposits;
    }

    // Aave V3 Pool interface
    IPool public immutable aavePool;
    IERC20 public immutable underlyingToken;

    // Contract state variables
    mapping(address => Goal) public goals;
    uint256 public constant EARLY_WITHDRAWAL_PENALTY = 5; // 5%
    uint256 public constant MIN_DEPOSIT_INTERVAL = 1 days;
    uint256 public constant MAX_GOAL_DURATION = 365 days;

    // Events
    event GoalCreated(address indexed user, uint256 targetAmount, uint256 deadline);
    event DepositMade(address indexed user, uint256 amount);
    event WithdrawalMade(address indexed user, uint256 amount, uint256 penalty);
    event GoalCompleted(address indexed user, uint256 finalAmount);
    event InterestEarned(address indexed user, uint256 amount);

    constructor(
        address _aavePoolAddress,
        address _underlyingToken
    ) {
        aavePool = IPool(_aavePoolAddress);
        underlyingToken = IERC20(_underlyingToken);
    }

    /**
     * @dev Create a new savings goal
     * @param _targetAmount The target amount to save
     * @param _deadline The deadline for reaching the goal
     */
    function createGoal(uint256 _targetAmount, uint256 _deadline) external {
        require(_targetAmount > 0, "Target amount must be greater than 0");
        require(_deadline > block.timestamp, "Deadline must be in the future");
        require(_deadline <= block.timestamp + MAX_GOAL_DURATION, "Goal duration too long");
        require(!goals[msg.sender].isActive, "Active goal already exists");

        Goal storage newGoal = goals[msg.sender];
        newGoal.targetAmount = _targetAmount;
        newGoal.deadline = _deadline;
        newGoal.currentAmount = 0;
        newGoal.lastDepositTimestamp = block.timestamp;
        newGoal.isActive = true;

        emit GoalCreated(msg.sender, _targetAmount, _deadline);
    }

    /**
     * @dev Make a deposit towards the savings goal
     * @param _amount The amount to deposit
     */
    function deposit(uint256 _amount) external nonReentrant {
        require(_amount > 0, "Deposit amount must be greater than 0");
        require(goals[msg.sender].isActive, "No active goal");
        require(
            block.timestamp >= goals[msg.sender].lastDepositTimestamp + MIN_DEPOSIT_INTERVAL,
            "Minimum deposit interval not met"
        );

        // Transfer tokens from user
        require(
            underlyingToken.transferFrom(msg.sender, address(this), _amount),
            "Token transfer failed"
        );

        // Approve Aave to spend tokens
        underlyingToken.approve(address(aavePool), _amount);

        // Deposit to Aave
        aavePool.supply(address(underlyingToken), _amount, address(this), 0);

        // Update goal state
        Goal storage goal = goals[msg.sender];
        goal.currentAmount += _amount;
        goal.lastDepositTimestamp = block.timestamp;
        goal.deposits[msg.sender] += _amount;

        emit DepositMade(msg.sender, _amount);

        // Check if goal is completed
        if (goal.currentAmount >= goal.targetAmount) {
            _completeGoal(msg.sender);
        }
    }

    /**
     * @dev Withdraw funds from the savings goal
     * @param _amount The amount to withdraw
     */
    function withdraw(uint256 _amount) external nonReentrant {
        require(_amount > 0, "Withdrawal amount must be greater than 0");
        require(goals[msg.sender].isActive, "No active goal");
        require(_amount <= goals[msg.sender].currentAmount, "Insufficient balance");

        Goal storage goal = goals[msg.sender];
        uint256 penalty = 0;

        // Calculate penalty for early withdrawal
        if (block.timestamp < goal.deadline) {
            penalty = (_amount * EARLY_WITHDRAWAL_PENALTY) / 100;
        }

        uint256 withdrawalAmount = _amount - penalty;

        // Withdraw from Aave
        aavePool.withdraw(address(underlyingToken), _amount, address(this));

        // Update goal state
        goal.currentAmount -= _amount;
        goal.deposits[msg.sender] -= _amount;

        // Transfer tokens to user
        require(
            underlyingToken.transfer(msg.sender, withdrawalAmount),
            "Token transfer failed"
        );

        // Transfer penalty to contract owner
        if (penalty > 0) {
            require(
                underlyingToken.transfer(owner(), penalty),
                "Penalty transfer failed"
            );
        }

        emit WithdrawalMade(msg.sender, withdrawalAmount, penalty);
    }

    /**
     * @dev Get the current progress of a savings goal
     * @param _user The address of the user
     * @return progress The progress percentage (0-100)
     */
    function getProgress(address _user) external view returns (uint256 progress) {
        Goal storage goal = goals[_user];
        if (goal.targetAmount == 0) return 0;
        return (goal.currentAmount * 100) / goal.targetAmount;
    }

    /**
     * @dev Get the total deposits made by a user
     * @param _user The address of the user
     * @return The total amount deposited
     */
    function getTotalDeposits(address _user) external view returns (uint256) {
        return goals[_user].deposits[_user];
    }

    /**
     * @dev Complete the savings goal and transfer funds to user
     * @param _user The address of the user
     */
    function _completeGoal(address _user) internal {
        Goal storage goal = goals[_user];
        
        // Withdraw from Aave
        aavePool.withdraw(address(underlyingToken), goal.currentAmount, address(this));

        // Transfer funds to user
        require(
            underlyingToken.transfer(_user, goal.currentAmount),
            "Token transfer failed"
        );

        emit GoalCompleted(_user, goal.currentAmount);

        // Reset goal
        goal.isActive = false;
        goal.currentAmount = 0;
    }

    /**
     * @dev Get the current interest rate from Aave
     * @return The current interest rate (in basis points)
     */
    function getCurrentInterestRate() external view returns (uint256) {
        return aavePool.getReserveData(address(underlyingToken)).currentLiquidityRate;
    }

    /**
     * @dev Get the estimated interest earned
     * @param _user The address of the user
     * @return The estimated interest earned
     */
    function getEstimatedInterest(address _user) external view returns (uint256) {
        Goal storage goal = goals[_user];
        if (goal.currentAmount == 0) return 0;

        uint256 interestRate = aavePool.getReserveData(address(underlyingToken)).currentLiquidityRate;
        uint256 timeElapsed = block.timestamp - goal.lastDepositTimestamp;
        
        // Calculate interest: principal * rate * time
        return (goal.currentAmount * interestRate * timeElapsed) / (365 days * 10000);
    }
} 