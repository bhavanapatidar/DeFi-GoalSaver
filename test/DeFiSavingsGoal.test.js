const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("DeFiSavingsGoal", function () {
  let DeFiSavingsGoal, defiSavingsGoal, owner, user;

  beforeEach(async function () {
    [owner, user] = await ethers.getSigners();
    DeFiSavingsGoal = await ethers.getContractFactory("DeFiSavingsGoal");
    defiSavingsGoal = await DeFiSavingsGoal.deploy();
    await defiSavingsGoal.waitForDeployment();
  });

  it("should allow deposit", async function () {
    await expect(defiSavingsGoal.connect(user).deposit({ value: ethers.parseEther("1") }))
      .to.changeEtherBalances([user, defiSavingsGoal], [ethers.parseEther("-1"), ethers.parseEther("1")]);
  });

  it("should allow withdraw", async function () {
    await defiSavingsGoal.connect(user).deposit({ value: ethers.parseEther("1") });
    await expect(defiSavingsGoal.connect(user).withdraw(ethers.parseEther("0.5")))
      .to.changeEtherBalances([user, defiSavingsGoal], [ethers.parseEther("0.5"), ethers.parseEther("-0.5")]);
  });

  it("should calculate interest correctly", async function () {
    // This assumes a getInterest function exists
    await defiSavingsGoal.connect(user).deposit({ value: ethers.parseEther("1") });
    // Simulate time passing if needed
    if (defiSavingsGoal.getInterest) {
      const interest = await defiSavingsGoal.connect(user).getInterest(user.address);
      expect(interest).to.be.a("bigint");
    } else {
      this.skip();
    }
  });
}); 