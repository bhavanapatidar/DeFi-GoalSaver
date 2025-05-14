const hre = require("hardhat");
const fs = require('fs');

async function main() {
  // Deploy SaverToken
  const SaverToken = await hre.ethers.getContractFactory("SaverToken");
  const saverToken = await SaverToken.deploy();
  await saverToken.waitForDeployment();
  const saverTokenAddress = await saverToken.getAddress();
  console.log("SaverToken deployed to:", saverTokenAddress);

  // Deploy SaverBadge
  const SaverBadge = await hre.ethers.getContractFactory("SaverBadge");
  const saverBadge = await SaverBadge.deploy();
  await saverBadge.waitForDeployment();
  console.log("SaverBadge deployed to:", await saverBadge.getAddress());

  // Deploy DeFiSavingsGoal
  const DeFiSavingsGoal = await hre.ethers.getContractFactory("DeFiSavingsGoal");
  const defiSavingsGoal = await DeFiSavingsGoal.deploy(saverTokenAddress);
  await defiSavingsGoal.waitForDeployment();
  console.log("DeFiSavingsGoal deployed to:", await defiSavingsGoal.getAddress());

  // Verify contracts on Etherscan
  if (hre.network.name === "sepolia") {
    console.log("Waiting for block confirmations...");
    await new Promise(resolve => setTimeout(resolve, 60000)); // Wait 1 min for Etherscan to index

    console.log("Verifying SaverToken...");
    await hre.run("verify:verify", {
      address: saverTokenAddress,
      constructorArguments: [],
    });

    console.log("Verifying SaverBadge...");
    await hre.run("verify:verify", {
      address: await saverBadge.getAddress(),
      constructorArguments: [],
    });

    console.log("Verifying DeFiSavingsGoal...");
    await hre.run("verify:verify", {
      address: await defiSavingsGoal.getAddress(),
      constructorArguments: [saverTokenAddress],
    });
  }

  // Save deployed addresses to deployed.json
  const addresses = {
    SaverToken: await saverToken.getAddress(),
    SaverBadge: await saverBadge.getAddress(),
    DeFiSavingsGoal: await defiSavingsGoal.getAddress()
  };
  fs.writeFileSync('deployed.json', JSON.stringify(addresses, null, 2));
  console.log('Deployed addresses saved to deployed.json');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 