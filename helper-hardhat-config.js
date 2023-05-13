const networkConfig = {
    31337: {
        name: "localhost",
        epnsProxyAddress: "0xb3971BCef2D791bc4027BbfedFb47319A4AAaaAa",
        subscriptionId: "588",
        gasLane: "0x474e34a077df58807dbe9c96d3c009b23b3c6d0cce433e59bbf5b34f823bc56c", // 30 gwei
        callbackGasLimit: "500000", // 500,000 gas
    },
    11155111: {
        name: "goerli",
        epnsProxyAddress: "0xb3971BCef2D791bc4027BbfedFb47319A4AAaaAa",
        vrfCoordinatorAddress: "0x2Ca8E0C643bDe4C2E08ab1fA0da3401AdAD7734D",
    },
    80001: {
        name: "mumbai",
        epnsProxyAddress: "0xb3971BCef2D791bc4027BbfedFb47319A4AAaaAa",
        subscriptionId: "4205",
        gasLane: "0x4b09e658ed251bcafeebbc69400383d49f344ace09b9576fe248bb02c003fe9f", // 30 gwei
        callbackGasLimit: "2500000", // 500,000 gas
        vrfCoordinatorV2: "0x7a1BaC17Ccc5b313516C5E16fb24f7659aA5ebed",
        
    }
}

const developmentChains = ["hardhat", "localhost"]
const VERIFICATION_BLOCK_CONFIRMATIONS = 6

module.exports = {
    networkConfig,
    developmentChains,
    VERIFICATION_BLOCK_CONFIRMATIONS,
}