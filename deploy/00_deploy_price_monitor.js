module.exports = async ({getNamedAccounts, deployments}) => {
    const {deploy} = deployments;
    const {deployer} = await getNamedAccounts();
    console.log("DEPLOYER: ", deployer)
    await deploy('PriceMonitor', {
      from: deployer,
      args: [2],
      log: true,
    });
  };
  module.exports.tags = ["all", "PriceMonitor"];