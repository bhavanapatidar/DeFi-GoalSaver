const hre = require("hardhat");
const fs = require('fs');

// Read deployed addresses
const addresses = JSON.parse(fs.readFileSync('deployed.json', 'utf8'));

async function main() {
  // Get the deployed contracts with correct addresses
  const saverToken = await hre.ethers.getContractAt("SaverToken", addresses.SaverToken);
  const saverBadge = await hre.ethers.getContractAt("SaverBadge", addresses.SaverBadge);
  const defiSavingsGoal = await hre.ethers.getContractAt("DeFiSavingsGoal", addresses.DeFiSavingsGoal);

  // Get signers
  const [owner, user1] = await hre.ethers.getSigners();
  console.log("Testing with accounts:", {
    owner: owner.address,
    user1: user1.address
  });

  // Setup: Set savings contract address in SaverToken
  console.log("\nSetup: Setting savings contract address");
  await saverToken.setSavingsContract(defiSavingsGoal.getAddress());
  console.log("Savings contract address set");

  // Setup: Transfer tokens to DeFiSavingsGoal for rewards
  console.log("\nSetup: Transferring tokens to DeFiSavingsGoal for rewards");
  const rewardAmount = hre.ethers.parseEther("1000"); // 1000 tokens for rewards
  await saverToken.transfer(defiSavingsGoal.getAddress(), rewardAmount);
  console.log("Transferred", hre.ethers.formatEther(rewardAmount), "tokens to DeFiSavingsGoal");

  // Test 1: Mint tokens to user1
  console.log("\nTest 1: Minting tokens to user1");
  const mintAmount = hre.ethers.parseEther("1000"); // 1000 tokens
  await saverToken.mint(user1.address, mintAmount);
  console.log("Minted", hre.ethers.formatEther(mintAmount), "tokens to user1");

  // Test 2: User1 approves DeFiSavingsGoal to spend tokens
  console.log("\nTest 2: Approving DeFiSavingsGoal to spend tokens");
  await saverToken.connect(user1).approve(defiSavingsGoal.getAddress(), mintAmount);
  console.log("Approved DeFiSavingsGoal to spend tokens");

  // Test 3: User1 creates a savings goal
  console.log("\nTest 3: Creating a savings goal");
  const targetAmount = hre.ethers.parseEther("500"); // 500 tokens target
  const durationInDays = 30; // 30 days
  await defiSavingsGoal.connect(user1).createGoal(targetAmount, durationInDays);
  console.log("Created savings goal:", {
    targetAmount: hre.ethers.formatEther(targetAmount),
    durationInDays
  });

  // Test 4: User1 adds savings
  console.log("\nTest 4: Adding savings");
  const savingsAmount = hre.ethers.parseEther("100"); // 100 tokens
  await defiSavingsGoal.connect(user1).addSavings(savingsAmount);
  console.log("Added", hre.ethers.formatEther(savingsAmount), "tokens to savings");

  // Test 5: Check goal details
  console.log("\nTest 5: Checking goal details");
  const goalDetails = await defiSavingsGoal.getGoalDetails(user1.address);
  console.log("Goal details:", {
    targetAmount: hre.ethers.formatEther(goalDetails.targetAmount),
    currentAmount: hre.ethers.formatEther(goalDetails.currentAmount),
    startTime: new Date(Number(goalDetails.startTime) * 1000).toLocaleString(),
    endTime: new Date(Number(goalDetails.endTime) * 1000).toLocaleString(),
    isCompleted: goalDetails.isCompleted,
    isWithdrawn: goalDetails.isWithdrawn
  });

  // Test 6: Add more savings to complete the goal
  console.log("\nTest 6: Completing the goal");
  const remainingAmount = hre.ethers.parseEther("400"); // 400 tokens to complete goal
  await defiSavingsGoal.connect(user1).addSavings(remainingAmount);
  console.log("Added remaining", hre.ethers.formatEther(remainingAmount), "tokens");

  // Test 7: Check goal completion and rewards
  console.log("\nTest 7: Checking goal completion and rewards");
  const updatedGoalDetails = await defiSavingsGoal.getGoalDetails(user1.address);
  const reward = await defiSavingsGoal.rewards(user1.address);
  console.log("Updated goal details:", {
    isCompleted: updatedGoalDetails.isCompleted,
    reward: hre.ethers.formatEther(reward)
  });

  // Test 8: Withdraw reward
  console.log("\nTest 8: Withdrawing reward");
  await defiSavingsGoal.connect(user1).withdrawReward();
  console.log("Reward withdrawn successfully");

  // Test 9: Withdraw savings
  console.log("\nTest 9: Withdrawing savings");
  await defiSavingsGoal.connect(user1).withdrawSavings();
  console.log("Savings withdrawn successfully");

  // Test 10: Check final balances
  console.log("\nTest 10: Checking final balances");
  const finalTokenBalance = await saverToken.balanceOf(user1.address);
  console.log("Final token balance:", hre.ethers.formatEther(finalTokenBalance));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 