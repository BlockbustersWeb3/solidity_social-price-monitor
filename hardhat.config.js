require("@nomicfoundation/hardhat-toolbox");
require("hardhat-deploy");
require("dotenv").config();

const { GOERLI_ALCHEMY_APIKEY, GOERLI_PRIVATE_KEY, MUMBAI_APIKEY } =
  process.env;

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    compilers: [
      {
        version: "0.8.18",
      },
    ],
  },
  networks: {
    hardhat: {
      chainId: 31337,
      forking: {
        url: `https://eth-goerli.g.alchemy.com/v2/${GOERLI_ALCHEMY_APIKEY}`,
        blockNumber: 8789763,
      },
    },
    goerli: {
      url: `https://eth-goerli.g.alchemy.com/v2/${GOERLI_ALCHEMY_APIKEY}`,
      accounts: [GOERLI_PRIVATE_KEY],
      chainId: 5,
    },
    mumbai: {
      url: `https://polygon-mumbai.g.alchemy.com/v2/${MUMBAI_APIKEY}`,
      accounts: [GOERLI_PRIVATE_KEY],
      chainId: 80001,
    },
  },
  namedAccounts: {
    deployer: {
      default: 0, // here this will by default take the first account as deployer
    },
  },
};
