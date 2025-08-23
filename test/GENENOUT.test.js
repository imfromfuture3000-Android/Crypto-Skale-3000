const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("GENENOUT - OMEGA-PRIME/GITHUB GENE", function () {
    let genenout;
    let owner;
    let user1;
    let user2;

    beforeEach(async function () {
        [owner, user1, user2] = await ethers.getSigners();
        
        const GENENOUT = await ethers.getContractFactory("GENENOUT");
        genenout = await GENENOUT.deploy();
        await genenout.waitForDeployment();
    });

    describe("Deployment", function () {
        it("Should set the right owner", async function () {
            expect(await genenout.owner()).to.equal(owner.address);
        });

        it("Should initialize with zero genes", async function () {
            expect(await genenout.getTotalGenes()).to.equal(0);
        });

        it("Should initialize with zero OMEGA-PRIME count", async function () {
            expect(await genenout.getOmegaPrimeCount()).to.equal(0);
        });
    });

    describe("Gene Creation", function () {
        it("Should create genesis gene", async function () {
            const dna = ethers.keccak256(ethers.toUtf8Bytes("GENESIS"));
            
            await expect(genenout.connect(user1).createGenesis(dna))
                .to.emit(genenout, "GeneCreated")
                .withArgs(0, user1.address, dna);

            const gene = await genenout.getGene(0);
            expect(gene.id).to.equal(0);
            expect(gene.dnaSequence).to.equal(dna);
            expect(gene.creator).to.equal(user1.address);
            expect(gene.generation).to.equal(0);
            expect(gene.isAlive).to.be.true;
        });

        it("Should track user genes", async function () {
            const dna = ethers.keccak256(ethers.toUtf8Bytes("GENESIS"));
            await genenout.connect(user1).createGenesis(dna);
            
            const userGenes = await genenout.getUserGenes(user1.address);
            expect(userGenes.length).to.equal(1);
            expect(userGenes[0]).to.equal(0);
        });
    });

    describe("Gene Evolution", function () {
        beforeEach(async function () {
            // Create two parent genes
            const dna1 = ethers.keccak256(ethers.toUtf8Bytes("PARENT1"));
            const dna2 = ethers.keccak256(ethers.toUtf8Bytes("PARENT2"));
            
            await genenout.connect(user1).createGenesis(dna1);
            await genenout.connect(user1).createGenesis(dna2);
        });

        it("Should perform crossover between two genes", async function () {
            await expect(genenout.connect(user1).crossover(0, 1))
                .to.emit(genenout, "GeneCreated")
                .to.emit(genenout, "GeneEvolved");

            const offspring = await genenout.getGene(2);
            expect(offspring.generation).to.equal(1);
            expect(offspring.parentId1).to.equal(0);
            expect(offspring.parentId2).to.equal(1);
            expect(offspring.creator).to.equal(user1.address);
        });

        it("Should require alive parents for crossover", async function () {
            // Terminate first parent
            await genenout.connect(user1).terminateGene(0);
            
            await expect(genenout.connect(user1).crossover(0, 1))
                .to.be.revertedWith("Parents must be alive");
        });
    });

    describe("Fitness Management", function () {
        beforeEach(async function () {
            const dna = ethers.keccak256(ethers.toUtf8Bytes("FITNESS_TEST"));
            await genenout.connect(user1).createGenesis(dna);
        });

        it("Should update fitness", async function () {
            await expect(genenout.connect(user1).updateFitness(0, 500))
                .to.emit(genenout, "FitnessUpdated")
                .withArgs(0, 500);

            const gene = await genenout.getGene(0);
            expect(gene.fitness).to.equal(500);
        });

        it("Should emit OMEGA-PRIME achievement", async function () {
            const omegaThreshold = await genenout.OMEGA_PRIME_THRESHOLD();
            
            await expect(genenout.connect(user1).updateFitness(0, omegaThreshold))
                .to.emit(genenout, "OmegaPrimeAchieved")
                .withArgs(0, omegaThreshold);

            expect(await genenout.getOmegaPrimeCount()).to.equal(1);
        });

        it("Should only allow creator or owner to update fitness", async function () {
            await expect(genenout.connect(user2).updateFitness(0, 500))
                .to.be.revertedWith("Not authorized to update fitness");
        });
    });

    describe("Population Management", function () {
        beforeEach(async function () {
            // Create multiple genes for population
            for (let i = 0; i < 5; i++) {
                const dna = ethers.keccak256(ethers.toUtf8Bytes(`GENE_${i}`));
                await genenout.connect(user1).createGenesis(dna);
                await genenout.connect(user1).updateFitness(i, i * 100);
            }
        });

        it("Should create population", async function () {
            const geneIds = [0, 1, 2, 3, 4];
            
            await expect(genenout.connect(user1).createPopulation(geneIds))
                .to.emit(genenout, "PopulationEvolved");

            const population = await genenout.getPopulation(0);
            expect(population.geneIds.length).to.equal(5);
            expect(population.generation).to.equal(0);
            expect(population.evolutionOperator).to.equal(user1.address);
        });

        it("Should evolve population", async function () {
            const geneIds = [0, 1, 2, 3, 4];
            await genenout.connect(user1).createPopulation(geneIds);
            
            await expect(genenout.connect(user1).evolvePopulation(0))
                .to.emit(genenout, "PopulationEvolved");

            const population = await genenout.getPopulation(0);
            expect(population.generation).to.equal(1);
        });
    });

    describe("Constants and Thresholds", function () {
        it("Should have correct OMEGA-PRIME threshold", async function () {
            expect(await genenout.OMEGA_PRIME_THRESHOLD()).to.equal(1000000);
        });

        it("Should have correct mutation rate", async function () {
            expect(await genenout.MUTATION_RATE()).to.equal(5);
        });

        it("Should have correct crossover rate", async function () {
            expect(await genenout.CROSSOVER_RATE()).to.equal(70);
        });

        it("Should have correct max population size", async function () {
            expect(await genenout.MAX_POPULATION_SIZE()).to.equal(1000);
        });
    });
});