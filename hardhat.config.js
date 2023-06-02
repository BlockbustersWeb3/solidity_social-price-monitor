require("@nomicfoundation/hardhat-toolbox");
require("@nomiclabs/hardhat-ethers");
require("hardhat-deploy");
require("dotenv").config();
require("hardhat-gas-reporter");

const {
  GOERLI_ALCHEMY_APIKEY,
  MUMBAI_ALCHEMY_APIKEY,
  DEPLOYER_PRIVATE_KEY,
  USER1_PRIVATE_KEY,
  // USER2_PRIVATE_KEY,
  // USER3_PRIVATE_KEY,
  // USER4_PRIVATE_KEY,
} = process.env;

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    compilers: [
      {
        version: "0.8.18",
      },
    ],
  },
  defaultNetwork: 'hardhat',
  paths:{
    artifacts:'./artifacts',
  },
  networks: {
    hardhat: {
      chainId: 31337,
    },
    goerli: {
      url: `https://eth-goerli.g.alchemy.com/v2/${GOERLI_ALCHEMY_APIKEY}`,
      accounts: [DEPLOYER_PRIVATE_KEY],
      chainId: 5,
    },
    mumbai: {
      url: `https://polygon-mumbai.g.alchemy.com/v2/${MUMBAI_ALCHEMY_APIKEY}`,
      accounts: [
        DEPLOYER_PRIVATE_KEY,
        USER1_PRIVATE_KEY,
        // USER2_PRIVATE_KEY,
        // USER3_PRIVATE_KEY,
        // USER4_PRIVATE_KEY,
      ],
      chainId: 80001,
    },
  },
  namedAccounts: {
    deployer: {
      default: 0, // here this will by default take the first account as deployer
    },
    user1: {
      default: 1,
    },
    user2: {
      default: 2,
    },
    user3: {
      default: 3,
    },
    user4: {
      default: 4,
    },
  },
  gasReporter: {
    enabled: true,
    currency: 'USD',
    gasPrice: 150
  
  }
};
