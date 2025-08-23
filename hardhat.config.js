require("@nomicfoundation/hardhat-ethers");;

module.exports = {
  solidity: "0.8.20",
  networks: {
    skale: {
      url: process.env.RPC_URL,
      chainId: Number(process.env.CHAIN_ID),
      accounts: [process.env.PRIVATE_KEY],
    },
  },
};
