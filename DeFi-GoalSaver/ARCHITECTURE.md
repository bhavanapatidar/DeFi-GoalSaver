# DeFi GoalSaver - System Architecture

## 1. System Overview

### 1.1 Architecture Diagram
```
┌─────────────────────────────────────────────────────────────────────────┐
│                           Client Layer (Frontend)                        │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │   React     │  │  MetaMask   │  │   IPFS      │  │   Web3.js   │    │
│  │  Frontend   │◄─┤  Integration│◄─┤  Gateway    │◄─┤  Provider   │    │
│  └──────┬──────┘  └─────────────┘  └─────────────┘  └─────────────┘    │
└─────────┼───────────────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                        Smart Contract Layer                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │  Goal       │  │  Savings    │  │  DeFi       │  │  Chainlink  │    │
│  │  Factory    │  │  Vault      │  │  Integration│  │  Keepers    │    │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘    │
└─────────┼────────────────┼────────────────┼────────────────┼───────────┘
          │                │                │                │
          ▼                ▼                ▼                ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                        Protocol Layer                                    │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │    Aave     │  │  Compound   │  │  Uniswap    │  │  Chainlink  │    │
│  │  Protocol   │  │  Protocol   │  │  Protocol   │  │  Oracles    │    │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘    │
└─────────────────────────────────────────────────────────────────────────┘
          │                │                │                │
          ▼                ▼                ▼                ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                        Data Layer                                        │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │   The       │  │   IPFS      │  │   AI        │  │   Database  │    │
│  │   Graph     │  │  Storage    │  │  Service    │  │   (MongoDB) │    │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘    │
└─────────────────────────────────────────────────────────────────────────┘
```

## 2. Component Details

### 2.1 Smart Contracts

#### GoalFactory Contract
```solidity
// Core contract for creating and managing savings goals
contract GoalFactory {
    function createGoal(
        string memory name,
        uint256 targetAmount,
        uint256 targetDate,
        uint8 priority
    ) external returns (address);
    
    function getGoals(address user) external view returns (address[] memory);
}
```

#### SavingsVault Contract
```solidity
// Manages individual savings vaults and DeFi integrations
contract SavingsVault {
    function deposit(uint256 amount) external;
    function withdraw(uint256 amount) external;
    function getBalance() external view returns (uint256);
    function optimizeYield() external;
}
```

#### DeFiIntegration Contract
```solidity
// Handles interactions with DeFi protocols
contract DeFiIntegration {
    function depositToAave(address token, uint256 amount) external;
    function depositToCompound(address token, uint256 amount) external;
    function getOptimalProtocol() external view returns (address);
}
```

### 2.2 Frontend Architecture

#### React Components Structure
```
src/
├── components/
│   ├── goals/
│   │   ├── GoalCreation.jsx
│   │   ├── GoalList.jsx
│   │   └── GoalDetails.jsx
│   ├── savings/
│   │   ├── VaultManager.jsx
│   │   └── TransactionHistory.jsx
│   └── defi/
│       ├── YieldOptimizer.jsx
│       └── ProtocolSelector.jsx
├── hooks/
│   ├── useWeb3.js
│   ├── useGoals.js
│   └── useDeFi.js
└── services/
    ├── ipfs.js
    ├── graph.js
    └── ai.js
```

### 2.3 The Graph Integration

#### Subgraph Schema
```graphql
type Goal @entity {
    id: ID!
    owner: Bytes!
    name: String!
    targetAmount: BigInt!
    currentAmount: BigInt!
    targetDate: BigInt!
    priority: Int!
    status: String!
    transactions: [Transaction!]! @derivedFrom(field: "goal")
}

type Transaction @entity {
    id: ID!
    goal: Goal!
    amount: BigInt!
    type: String!
    timestamp: BigInt!
}
```

### 2.4 AI Service Integration

#### AI Service Architecture
```
AI Service/
├── models/
│   ├── risk_profiler.py
│   ├── savings_optimizer.py
│   └── behavior_analyzer.py
├── api/
│   ├── endpoints.py
│   └── middleware.py
└── data/
    ├── user_behavior.py
    └── market_data.py
```

## 3. Integration Points

### 3.1 MetaMask Integration
- Wallet connection and account management
- Transaction signing and approval
- Network switching and validation
- Gas estimation and optimization

### 3.2 IPFS Integration
- Storage of goal metadata
- User preferences and settings
- Transaction history backup
- Document storage (receipts, proofs)

### 3.3 Chainlink Keepers
- Automated savings execution
- Yield optimization triggers
- Goal completion checks
- Emergency withdrawal monitoring

## 4. Data Flow

### 4.1 User Interaction Flow
1. User connects wallet via MetaMask
2. Creates savings goal through GoalFactory
3. Funds are locked in SavingsVault
4. DeFiIntegration optimizes yield
5. Chainlink Keepers monitor and execute automated tasks
6. The Graph indexes all events and transactions
7. AI service analyzes behavior and suggests optimizations

### 4.2 DeFi Integration Flow
1. Monitor available protocols (Aave, Compound)
2. Calculate optimal yield strategies
3. Execute deposits through DeFiIntegration contract
4. Track performance and rebalance when needed
5. Handle withdrawals and emergency situations

## 5. Security Considerations

### 5.1 Smart Contract Security
- Multi-signature implementation for critical operations
- Emergency pause functionality
- Rate limiting and withdrawal caps
- Comprehensive access control

### 5.2 Data Security
- End-to-end encryption for sensitive data
- IPFS content addressing for immutable storage
- Secure key management
- Regular security audits

## 6. Scalability Solutions

### 6.1 Layer 2 Integration
- Optimistic rollups for transaction batching
- State channels for off-chain interactions
- Sidechains for specific operations

### 6.2 Data Indexing
- The Graph for efficient querying
- IPFS for decentralized storage
- Caching layer for frequently accessed data

## 7. Monitoring and Maintenance

### 7.1 System Monitoring
- Smart contract event monitoring
- Performance metrics tracking
- Error logging and alerting
- User behavior analytics

### 7.2 Maintenance Procedures
- Regular security updates
- Protocol upgrades
- Data backup and recovery
- Performance optimization 