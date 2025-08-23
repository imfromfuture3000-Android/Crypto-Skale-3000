require("@nomiclabs/hardhat-ethers");

module.exports = {
  solidity: "0.8.20",
  networks: {
    hardhat: {
      // Local hardhat network for testing
    },
    skale: {
      url: process.env.RPC_URL || "https://staging-v3.skalenodes.com/v1/your-chain-id",
      chainId: Number(process.env.CHAIN_ID) || 1,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    },
  },
};
