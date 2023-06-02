// const { networkConfig } = require("../helper-hardhat-config");
// const { network } = require("hardhat");

// module.exports = async ({getNamedAccounts, deployments}) => {
//     const {deploy} = deployments;
//     const {deployer} = await getNamedAccounts();
//     console.log("DEPLOYER: ", deployer)

//     chainId = network.config.chainId;
//     // epnsProxyAddress = networkConfig[chainId]["epnsProxyAddress"];
//     vrfCoordinatorAddress = networkConfig[chainId]["vrfCoordinatorAddress"]
    
//     await deploy('PriceMonitor', {
//       from: deployer,
//       args: [2, epnsProxyAddress, ],
//       log: true,
//       waitConfirmations: network.config.blockConfirmations || 1,
//     });
//   };
//   // module.exports.tags = ["all", "PriceMonitor"];


  //////////////////////////////////////////////////////


const { network, ethers } = require("hardhat")
const {
    networkConfig,
    developmentChains,
    VERIFICATION_BLOCK_CONFIRMATIONS,
} = require("../helper-hardhat-config")
// const { verify } = require("../utils/verify") TODO

const FUND_AMOUNT = ethers.utils.parseEther("1") // 1 Ether, or 1e18 (10^18) Wei

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId
    let vrfCoordinatorV2Address, subscriptionId, vrfCoordinatorV2Mock

    if (chainId == 31337) {
        // create VRFV2 Subscription
        vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock")
        vrfCoordinatorV2Address = vrfCoordinatorV2Mock.address
        const transactionResponse = await vrfCoordinatorV2Mock.createSubscription()
        const transactionReceipt = await transactionResponse.wait()
        subscriptionId = transactionReceipt.events[0].args.subId
        // Fund the subscription
        // Our mock makes it so we don't actually have to worry about sending fund
        await vrfCoordinatorV2Mock.fundSubscription(subscriptionId, FUND_AMOUNT)
    } else {
        vrfCoordinatorV2Address = networkConfig[chainId]["vrfCoordinatorV2"]
        subscriptionId = networkConfig[chainId]["subscriptionId"]
    }
    const waitBlockConfirmations = developmentChains.includes(network.name)
        ? 1
        : VERIFICATION_BLOCK_CONFIRMATIONS
    const priceDecimals = 2;

    log("----------------------------------------------------")
    const arguments = [
      priceDecimals,
      networkConfig[chainId]["epnsProxyAddress"],
      vrfCoordinatorV2Address,
      subscriptionId,
      networkConfig[chainId]["gasLane"],
      networkConfig[chainId]["callbackGasLimit"],
    ];

    const priceMonitor = await deploy("PriceMonitor", {
        from: deployer,
        args: arguments,
        log: true,
        waitConfirmations: waitBlockConfirmations,
    })

    // Ensure the PriceMonitor contract is a valid consumer of the VRFCoordinatorV2Mock contract.
    if (developmentChains.includes(network.name)) {
        const vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock")
        await vrfCoordinatorV2Mock.addConsumer(subscriptionId, priceMonitor.address)
    }

    // Verify the deployment
    // if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
    //     log("Verifying...")
    //     await verify(raffle.address, arguments)
    // }

    // log("Enter lottery with command:")
    // const networkName = network.name == "hardhat" ? "localhost" : network.name
    // log(`yarn hardhat run scripts/enterRaffle.js --network ${networkName}`)
    log("----------------------------------------------------")
}

module.exports.tags = ["all", "pricemonitor"]