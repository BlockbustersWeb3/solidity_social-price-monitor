const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { expect } = require("chai");
const { networkConfig } = require("../helper-hardhat-config");
const { network } = require("hardhat");

describe("PriceMonitor", function () {
  async function deployFixture() {
    const [deployer] = await ethers.getSigners();
    chainId = network.config.chainId;

    epnsProxyAddress = networkConfig[chainId]["epnsProxyAddress"];

    const PriceMonitor = await ethers.getContractFactory("PriceMonitor");
    const priceMonitor = await PriceMonitor.deploy(2, epnsProxyAddress);

    return { priceMonitor, deployer };
  }

  describe("Deployment", function () {
    it("Should set the owner to deployer", async function () {
      const { priceMonitor, deployer } = await loadFixture(deployFixture);

      expect(await priceMonitor.owner()).to.equal(deployer.address);
    });
  });

  describe("PriceMonitor", function () {
    it("Should create price monitoring emitting event", async function () {
      const { priceMonitor, deployer } = await loadFixture(deployFixture);

      args = [001, 1525, 001];

      await expect(priceMonitor.addPriceReport(...args))
        .to.emit(priceMonitor, "PriceReported")
        .withArgs(0, ...args, deployer.address);
    });

    it("Should create price added to the list of reported prices", async function () {
      const { priceMonitor, deployer } = await loadFixture(deployFixture);

      const productId = 099;
      const price = 1525;
      const storeId = 044;
      await priceMonitor.addPriceReport(
        // priceReportId,
        productId,
        price,
        storeId
      );
      const priceReport = await priceMonitor.getPriceReport(0);

      expect(priceReport.productId).to.equal(productId);
      expect(priceReport.price).to.equal(price);
      expect(priceReport.storeId).to.equal(storeId);
      expect(priceReport.reporter).to.equal(deployer.address);
    });

    it("Should create a product", async function () {
      const { priceMonitor } = await loadFixture(deployFixture);

      const name = "Rice 1 KG";
      const brand = "Test";
      const description = "More info";
      await priceMonitor.addProduct(name, brand, description);

      const product = await priceMonitor.getProduct(0);

      expect(product.name).to.equal(name);
      expect(product.brand).to.equal(brand);
      expect(product.description).to.equal(description);
    });

    it("Should create a store");
    it("Should attach a proof");
    it("Should be validated ");
  });
});
