const { networkConfig } = require("../helper-hardhat-config");
const { network } = require("hardhat");

module.exports = async ({getNamedAccounts, deployments}) => {
    const {deploy} = deployments;
    const {deployer} = await getNamedAccounts();
    console.log("DEPLOYER: ", deployer)

    chainId = network.config.chainId;
    epnsProxyAddress = networkConfig[chainId]["epnsProxyAddress"];
    
    await deploy('PriceMonitor', {
      from: deployer,
      args: [2, epnsProxyAddress],
      log: true,
    });
  };
  module.exports.tags = ["all", "PriceMonitor"];