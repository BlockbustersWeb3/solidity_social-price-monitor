const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { expect } = require("chai");
const { networkConfig } = require("../helper-hardhat-config");
const { network } = require("hardhat");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");

describe("PriceMonitor", function () {
  async function deployFixture() {
    const [deployer, user1, user2] = await ethers.getSigners();
    chainId = network.config.chainId;

    epnsProxyAddress = networkConfig[chainId]["epnsProxyAddress"];

    await deployments.fixture(["mocks", "pricemonitor"]);

    // const PriceMonitor = await ethers.getContractFactory("PriceMonitor");
    // const priceMonitor = await PriceMonitor.deploy(2, epnsProxyAddress);

    const priceMonitor = await ethers.getContract("PriceMonitor");
    const vrfCoordinatorV2Mock = await ethers.getContract(
      "VRFCoordinatorV2Mock"
    );

    return {
      priceMonitor,
      vrfCoordinatorV2Mock,
      deployer,
      user1,
      user2,
    };
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
        .withArgs(0, ...args, deployer.address, anyValue);
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
  });

  describe("Subscription", function () {
    it("User can subscribe to be a validator for price report on a specific product", async function () {
      const { priceMonitor, user1 } = await loadFixture(deployFixture);

      await priceMonitor.connect(user1).addProductSubscriber(1);
      expect(await priceMonitor.connect(user1).isSubscribedToProduct(1)).to.be
        .true;
    });

    it("Multiple users can subscribe to a product", async function () {
      const { priceMonitor } = await loadFixture(deployFixture);

      const signers = await ethers.getSigners();

      const productId = 099;

      for (let i = 0; i < 5; i++) {
        await priceMonitor.connect(signers[i]).addProductSubscriber(productId);
      }

      expect(await priceMonitor.getProductSubscribersCount(productId)).to.equal(5);
    });

    it("User can unsubscribe to be a validator for price report on a specific product", async function () {
      const { priceMonitor, user1 } = await loadFixture(deployFixture);

      await priceMonitor.connect(user1).addProductSubscriber(1);
      await priceMonitor.connect(user1).removeProductSubscriber(1);

      expect(await priceMonitor.connect(user1).isSubscribedToProduct(1)).to.be
        .false;
    });

    it("User can't unsubscribe if they're not subscriber for a product", async function () {
      const { priceMonitor, user1, user2 } = await loadFixture(deployFixture);

      await priceMonitor.connect(user1).addProductSubscriber(1);

      await expect(
        priceMonitor.connect(user2).removeProductSubscriber(1)
      ).to.be.revertedWithCustomError(
        priceMonitor,
        "PriceMonitor__IsNotSubscriber"
      );
    });
  });

  describe("Validations", function () {
    it("Price Report is validated", async function () {
      const { priceMonitor } = await loadFixture(deployFixture);

      const productId = 099;
      const price = 1525;
      const storeId = 044;
      await priceMonitor.addPriceReport(productId, price, storeId);

      await priceMonitor.validatePriceReport(0);

      expect(await priceMonitor.getValidatorsCount(0)).to.equal(1);
    });

    it("Price Report emits event after validation", async function () {
      const { priceMonitor, deployer } = await loadFixture(deployFixture);

      const productId = 099;
      const price = 1525;
      const storeId = 044;
      await priceMonitor.addPriceReport(productId, price, storeId);

      await expect(priceMonitor.validatePriceReport(0))
        .to.emit(priceMonitor, "PriceReportValidated")
        .withArgs(0, deployer.address, 1);
    });

    it("Price Report has completed all validations");

    it("Users are randomly assigned to be a validator out of the subscribed users", async function () {
      const { priceMonitor, vrfCoordinatorV2Mock } = await loadFixture(
        deployFixture
      );
      const signers = await ethers.getSigners();

      const productId = 099;
      const price = 1525;
      const storeId = 044;

      for (let i = 5; i < 15; i++) {
        await priceMonitor.connect(signers[i]).addProductSubscriber(productId);
      }

      const txResponse = await priceMonitor.addPriceReport(
        productId,
        price,
        storeId
      );
      const txReceipt = await txResponse.wait(1);
      priceReportId = txReceipt.events[1].args.id;

      await expect(
        vrfCoordinatorV2Mock.fulfillRandomWords(1, priceMonitor.address)
      )
        .to.emit(priceMonitor, "PriceReportValidatorsAssigned")
        .withArgs(priceReportId, anyValue);

      expect(
        (await priceMonitor.getPriceReport(0)).assignedValidators.length
      ).to.equal(4);
      // TODO How to test that all items are different?
    });

    it("All Users are assigned to be a validators is total subscriber are less or equal than 4", async function () {
      const { priceMonitor } = await loadFixture(deployFixture);
      const signers = await ethers.getSigners();

      const productId = 099;
      const price = 1525;
      const storeId = 044;

      for (let i = 0; i < 3; i++) {
        await priceMonitor.connect(signers[i]).addProductSubscriber(productId);
      }

      const txResponse = await priceMonitor.addPriceReport(
        productId,
        price,
        storeId
      );
      const txReceipt = await txResponse.wait(1);
      priceReportId = txReceipt.events[1].args.id;

      await expect(
        txResponse
      )
      .to.emit(priceMonitor, "PriceReportValidatorsAssigned")
      .withArgs(priceReportId, anyValue);

      const validators = (await priceMonitor.getPriceReport(priceReportId))
        .assignedValidators;

      expect(validators.length).to.equal(3);
    });
  });
});
