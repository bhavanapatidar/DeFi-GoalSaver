const hre = require("hardhat");

async function main() {
  // Deploy SaverToken
  const SaverToken = await hre.ethers.getContractFactory("SaverToken");
  const saverToken = await SaverToken.deploy();
  await saverToken.deployed();
  console.log("SaverToken deployed to:", saverToken.address);

  // Deploy SaverBadge
  const SaverBadge = await hre.ethers.getContractFactory("SaverBadge");
  const saverBadge = await SaverBadge.deploy();
  await saverBadge.deployed();
  console.log("SaverBadge deployed to:", saverBadge.address);

  // Deploy DeFiSavingsGoal
  const DeFiSavingsGoal = await hre.ethers.getContractFactory("DeFiSavingsGoal");
  const defiSavingsGoal = await DeFiSavingsGoal.deploy();
  await defiSavingsGoal.deployed();
  console.log("DeFiSavingsGoal deployed to:", defiSavingsGoal.address);

  // Verify contracts on Etherscan
  if (hre.network.name === "goerli") {
    console.log("Waiting for block confirmations...");
    await new Promise(resolve => setTimeout(resolve, 60000)); // Wait 1 min for Etherscan to index

    console.log("Verifying SaverToken...");
    await hre.run("verify:verify", {
      address: saverToken.address,
      constructorArguments: [],
    });

    console.log("Verifying SaverBadge...");
    await hre.run("verify:verify", {
      address: saverBadge.address,
      constructorArguments: [],
    });

    console.log("Verifying DeFiSavingsGoal...");
    await hre.run("verify:verify", {
      address: defiSavingsGoal.address,
      constructorArguments: [],
    });
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 