import { ethers } from 'ethers';
import { create } from 'zustand';

// Contract ABI - import this from your contract artifacts
const contractABI = [
  "function createGoal(uint256 targetAmount, uint256 deadline) external",
  "function deposit(uint256 amount) external",
  "function withdraw(uint256 amount) external",
  "function getProgress(address user) external view returns (uint256)",
  "function getTotalDeposits(address user) external view returns (uint256)",
  "function getEstimatedInterest(address user) external view returns (uint256)",
  "function getCurrentInterestRate() external view returns (uint256)",
  "event GoalCreated(address indexed user, uint256 targetAmount, uint256 deadline)",
  "event DepositMade(address indexed user, uint256 amount)",
  "event WithdrawalMade(address indexed user, uint256 amount, uint256 penalty)",
  "event GoalCompleted(address indexed user, uint256 finalAmount)",
  "event InterestEarned(address indexed user, uint256 amount)"
];

// Contract address - replace with your deployed contract address
const CONTRACT_ADDRESS = "YOUR_CONTRACT_ADDRESS";

// Create a store for contract state
const useContractStore = create((set) => ({
  contract: null,
  provider: null,
  signer: null,
  isConnected: false,
  error: null,
  setContract: (contract) => set({ contract }),
  setProvider: (provider) => set({ provider }),
  setSigner: (signer) => set({ signer }),
  setIsConnected: (isConnected) => set({ isConnected }),
  setError: (error) => set({ error }),
}));

// Initialize contract service
export const initializeContract = async () => {
  try {
    const store = useContractStore.getState();
    
    // Check if MetaMask is installed
    if (!window.ethereum) {
      throw new Error('Please install MetaMask to use this application');
    }

    // Create provider and signer
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    
    // Create contract instance
    const contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, signer);

    // Update store
    store.setProvider(provider);
    store.setSigner(signer);
    store.setContract(contract);
    store.setIsConnected(true);
    store.setError(null);

    // Set up event listeners
    setupEventListeners(contract);

    return { contract, provider, signer };
  } catch (error) {
    useContractStore.getState().setError(error.message);
    throw error;
  }
};

// Set up contract event listeners
const setupEventListeners = (contract) => {
  contract.on("GoalCreated", (user, targetAmount, deadline, event) => {
    console.log("Goal Created:", {
      user,
      targetAmount: ethers.utils.formatEther(targetAmount),
      deadline: new Date(deadline.toNumber() * 1000).toLocaleDateString(),
    });
  });

  contract.on("DepositMade", (user, amount, event) => {
    console.log("Deposit Made:", {
      user,
      amount: ethers.utils.formatEther(amount),
    });
  });

  contract.on("WithdrawalMade", (user, amount, penalty, event) => {
    console.log("Withdrawal Made:", {
      user,
      amount: ethers.utils.formatEther(amount),
      penalty: ethers.utils.formatEther(penalty),
    });
  });

  contract.on("GoalCompleted", (user, finalAmount, event) => {
    console.log("Goal Completed:", {
      user,
      finalAmount: ethers.utils.formatEther(finalAmount),
    });
  });

  contract.on("InterestEarned", (user, amount, event) => {
    console.log("Interest Earned:", {
      user,
      amount: ethers.utils.formatEther(amount),
    });
  });
};

// Contract interaction functions
export const contractService = {
  // Create a new savings goal
  createGoal: async (targetAmount, deadline) => {
    try {
      const { contract } = useContractStore.getState();
      const tx = await contract.createGoal(
        ethers.utils.parseEther(targetAmount),
        Math.floor(new Date(deadline).getTime() / 1000)
      );
      const receipt = await tx.wait();
      return receipt;
    } catch (error) {
      useContractStore.getState().setError(error.message);
      throw error;
    }
  },

  // Make a deposit
  deposit: async (amount) => {
    try {
      const { contract } = useContractStore.getState();
      const tx = await contract.deposit(ethers.utils.parseEther(amount));
      const receipt = await tx.wait();
      return receipt;
    } catch (error) {
      useContractStore.getState().setError(error.message);
      throw error;
    }
  },

  // Withdraw funds
  withdraw: async (amount) => {
    try {
      const { contract } = useContractStore.getState();
      const tx = await contract.withdraw(ethers.utils.parseEther(amount));
      const receipt = await tx.wait();
      return receipt;
    } catch (error) {
      useContractStore.getState().setError(error.message);
      throw error;
    }
  },

  // Get user's savings progress
  getProgress: async (address) => {
    try {
      const { contract } = useContractStore.getState();
      const progress = await contract.getProgress(address);
      return progress.toNumber();
    } catch (error) {
      useContractStore.getState().setError(error.message);
      throw error;
    }
  },

  // Get total deposits
  getTotalDeposits: async (address) => {
    try {
      const { contract } = useContractStore.getState();
      const deposits = await contract.getTotalDeposits(address);
      return ethers.utils.formatEther(deposits);
    } catch (error) {
      useContractStore.getState().setError(error.message);
      throw error;
    }
  },

  // Get estimated interest
  getEstimatedInterest: async (address) => {
    try {
      const { contract } = useContractStore.getState();
      const interest = await contract.getEstimatedInterest(address);
      return ethers.utils.formatEther(interest);
    } catch (error) {
      useContractStore.getState().setError(error.message);
      throw error;
    }
  },

  // Get current interest rate
  getCurrentInterestRate: async () => {
    try {
      const { contract } = useContractStore.getState();
      const rate = await contract.getCurrentInterestRate();
      return (rate.toNumber() / 10000).toFixed(2);
    } catch (error) {
      useContractStore.getState().setError(error.message);
      throw error;
    }
  },
};

export default useContractStore; 