const hre = require("hardhat");

async function main() {
  // Deploy SaverToken
  const SaverToken = await hre.ethers.getContractFactory("SaverToken");
  const saverToken = await SaverToken.deploy();
  await saverToken.waitForDeployment();
  console.log("SaverToken deployed to:", await saverToken.getAddress());

  // Deploy SaverBadge
  const SaverBadge = await hre.ethers.getContractFactory("SaverBadge");
  const saverBadge = await SaverBadge.deploy();
  await saverBadge.waitForDeployment();
  console.log("SaverBadge deployed to:", await saverBadge.getAddress());

  // Verify contracts on Etherscan
  if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
    console.log("Waiting for block confirmations...");
    await new Promise(resolve => setTimeout(resolve, 30000));

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
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 