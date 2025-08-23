const hre = require("hardhat");

async function main() {
  // Compile before deploying
  await hre.run("compile");

  // Get contract factory
  const Token = await hre.ethers.getContractFactory("GENENOUT");

  // Deploy contract
  const token = await Token.deploy();

  // Wait until deployed
  await token.waitForDeployment();

  console.log("GENENOUT deployed to:", await token.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
