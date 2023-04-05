const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { expect } = require("chai");

describe("PriceMonitor", function () {
  async function deployFixture() {
    const [deployer] = await ethers.getSigners();

    const PriceMonitor = await ethers.getContractFactory("PriceMonitor");
    const priceMonitor = await PriceMonitor.deploy();

    return { priceMonitor, deployer };
  }

  describe("Deployment", function () {
    it("Should set the owner to deployer", async function () {
      const { priceMonitor, deployer } = await loadFixture(deployFixture);

      expect(await priceMonitor.owner()).to.equal(deployer.address);
    });
  });
});
