const hre = require("hardhat");

async function main() {
    console.log("🧬 OMEGA-PRIME/GITHUB GENE Interaction Demo");
    console.log("==========================================");

    // Get the deployed contract
    const GENENOUT = await hre.ethers.getContractFactory("GENENOUT");
    
    // For demo purposes, we'll deploy it locally first
    console.log("Deploying GENENOUT contract...");
    const genenout = await GENENOUT.deploy();
    await genenout.waitForDeployment();
    
    const contractAddress = await genenout.getAddress();
    console.log(`GENENOUT deployed to: ${contractAddress}`);
    
    // Get signers
    const [owner, user1, user2] = await hre.ethers.getSigners();
    console.log(`Owner: ${owner.address}`);
    console.log(`User1: ${user1.address}`);
    console.log(`User2: ${user2.address}`);

    console.log("\n🔬 Creating Genesis Genes...");
    
    // Create genesis genes
    const dna1 = hre.ethers.keccak256(hre.ethers.toUtf8Bytes("ALPHA_GENE"));
    const dna2 = hre.ethers.keccak256(hre.ethers.toUtf8Bytes("BETA_GENE"));
    
    await genenout.connect(user1).createGenesis(dna1);
    await genenout.connect(user1).createGenesis(dna2);
    
    console.log("✅ Genesis genes created!");
    
    // Display initial genes
    const gene0 = await genenout.getGene(0);
    const gene1 = await genenout.getGene(1);
    
    console.log(`Gene 0: DNA=${gene0.dnaSequence.slice(0, 10)}..., Generation=${gene0.generation}`);
    console.log(`Gene 1: DNA=${gene1.dnaSequence.slice(0, 10)}..., Generation=${gene1.generation}`);

    console.log("\n🧬 Performing Genetic Crossover...");
    
    // Perform crossover
    await genenout.connect(user1).crossover(0, 1);
    
    const offspring = await genenout.getGene(2);
    console.log(`Offspring: DNA=${offspring.dnaSequence.slice(0, 10)}..., Generation=${offspring.generation}`);
    console.log(`Parents: ${offspring.parentId1} x ${offspring.parentId2}`);

    console.log("\n📊 Updating Fitness Scores...");
    
    // Update fitness
    await genenout.connect(user1).updateFitness(0, 750000);
    await genenout.connect(user1).updateFitness(1, 850000);
    await genenout.connect(user1).updateFitness(2, 1200000); // OMEGA-PRIME!
    
    const updatedGene0 = await genenout.getGene(0);
    const updatedGene1 = await genenout.getGene(1);
    const updatedGene2 = await genenout.getGene(2);
    
    console.log(`Gene 0 Fitness: ${updatedGene0.fitness}`);
    console.log(`Gene 1 Fitness: ${updatedGene1.fitness}`);
    console.log(`Gene 2 Fitness: ${updatedGene2.fitness} 🏆 OMEGA-PRIME!`);

    console.log("\n🏆 OMEGA-PRIME Statistics:");
    const omegaCount = await genenout.getOmegaPrimeCount();
    const totalGenes = await genenout.getTotalGenes();
    console.log(`Total Genes: ${totalGenes}`);
    console.log(`OMEGA-PRIME Count: ${omegaCount}`);
    console.log(`OMEGA-PRIME Rate: ${(Number(omegaCount) / Number(totalGenes) * 100).toFixed(2)}%`);

    console.log("\n🧪 Creating Population for Group Evolution...");
    
    // Create more genes for population
    for (let i = 0; i < 3; i++) {
        const dna = hre.ethers.keccak256(hre.ethers.toUtf8Bytes(`POPULATION_GENE_${i}`));
        await genenout.connect(user1).createGenesis(dna);
        await genenout.connect(user1).updateFitness(3 + i, (i + 1) * 200000);
    }
    
    // Create population
    const populationGenes = [0, 1, 2, 3, 4, 5];
    await genenout.connect(user1).createPopulation(populationGenes);
    
    const population = await genenout.getPopulation(0);
    console.log(`Population 0: ${population.geneIds.length} genes, Average Fitness: ${population.averageFitness}`);

    console.log("\n🔄 Evolving Population...");
    
    // Evolve population
    await genenout.connect(user1).evolvePopulation(0);
    
    const evolvedPopulation = await genenout.getPopulation(0);
    console.log(`Evolved Population: Generation ${evolvedPopulation.generation}, Average Fitness: ${evolvedPopulation.averageFitness}`);

    console.log("\n📈 Final Statistics:");
    console.log(`Total Genes Created: ${await genenout.getTotalGenes()}`);
    console.log(`OMEGA-PRIME Achievements: ${await genenout.getOmegaPrimeCount()}`);
    console.log(`Contract Owner: ${await genenout.owner()}`);
    
    const userGenes = await genenout.getUserGenes(user1.address);
    console.log(`User1's Genes: [${userGenes.join(", ")}]`);

    console.log("\n🎯 OMEGA-PRIME/GITHUB GENE Demo Complete!");
    console.log("The genetic algorithm engine is ready for evolution! 🧬🚀");
}

main().catch((error) => {
    console.error("❌ Error:", error);
    process.exitCode = 1;
});