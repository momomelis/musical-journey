// Deploy script for Base network
// Usage: npx hardhat run scripts/deploy-base.js --network base

const hre = require("hardhat");

async function main() {
    const baseURI = "https://gateway.pinata.cloud/ipfs/"; // IPFS gateway or your own

    console.log("Deploying GrassDiscoveries to Base...");

    const GrassDiscoveries = await hre.ethers.getContractFactory("GrassDiscoveries");
    const contract = await GrassDiscoveries.deploy(baseURI);

    await contract.deployed();

    console.log("GrassDiscoveries deployed to:", contract.address);
    console.log("\nAdd this to your config:");
    console.log(`GRASS_CONTRACT_ADDRESS=${contract.address}`);
    console.log(`NETWORK=base`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
