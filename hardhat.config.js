require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-ethers");
require("dotenv").config();

module.exports = {
  solidity: "0.8.19",
  networks: {
    skale: {
      url: process.env.SKALE_RPC_URL,
      accounts: [process.env.SKALE_PRIVATE_KEY]
    }
  }
};
