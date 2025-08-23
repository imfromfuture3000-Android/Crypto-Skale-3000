// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title GENENOUT - OMEGA-PRIME/GITHUB GENE
 * @dev Advanced genetic algorithm smart contract for evolving digital organisms
 * Acts as the ultimate genetic engine for the Crypto-Skale-3000 ecosystem
 */
contract GENENOUT {
    struct Gene {
        uint256 id;
        bytes32 dnaSequence;
        uint256 fitness;
        uint256 generation;
        uint256 parentId1;
        uint256 parentId2;
        address creator;
        uint256 birthTime;
        bool isAlive;
    }

    struct Population {
        uint256[] geneIds;
        uint256 generation;
        uint256 averageFitness;
        uint256 maxFitness;
        address evolutionOperator;
    }

    // OMEGA-PRIME constants
    uint256 public constant OMEGA_PRIME_THRESHOLD = 1000000;
    uint256 public constant MAX_POPULATION_SIZE = 1000;
    uint256 public constant MUTATION_RATE = 5; // 5%
    uint256 public constant CROSSOVER_RATE = 70; // 70%
    
    // State variables
    mapping(uint256 => Gene) public genes;
    mapping(uint256 => Population) public populations;
    mapping(address => uint256[]) public userGenes;
    mapping(uint256 => bool) public isOmegaPrime; // Track OMEGA-PRIME achievements
    
    uint256 public currentGeneId;
    uint256 public currentPopulationId;
    uint256 public omegaPrimeCount;
    address public owner;
    
    // Events
    event GeneCreated(uint256 indexed geneId, address indexed creator, bytes32 dnaSequence);
    event GeneEvolved(uint256 indexed geneId, uint256 indexed parentId1, uint256 indexed parentId2);
    event OmegaPrimeAchieved(uint256 indexed geneId, uint256 fitness);
    event PopulationEvolved(uint256 indexed populationId, uint256 generation, uint256 averageFitness);
    event FitnessUpdated(uint256 indexed geneId, uint256 newFitness);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not authorized");
        _;
    }

    modifier geneExists(uint256 _geneId) {
        require(_geneId < currentGeneId, "Gene does not exist");
        _;
    }

    constructor() {
        owner = msg.sender;
        currentGeneId = 0;
        currentPopulationId = 0;
        omegaPrimeCount = 0;
    }

    /**
     * @dev Creates the genesis gene - the first digital organism
     */
    function createGenesis(bytes32 _initialDNA) external returns (uint256) {
        uint256 geneId = currentGeneId++;
        
        genes[geneId] = Gene({
            id: geneId,
            dnaSequence: _initialDNA,
            fitness: 0,
            generation: 0,
            parentId1: 0,
            parentId2: 0,
            creator: msg.sender,
            birthTime: block.timestamp,
            isAlive: true
        });

        userGenes[msg.sender].push(geneId);
        
        emit GeneCreated(geneId, msg.sender, _initialDNA);
        return geneId;
    }

    /**
     * @dev Performs crossover between two parent genes to create offspring
     */
    function crossover(uint256 _parentId1, uint256 _parentId2) 
        external 
        geneExists(_parentId1) 
        geneExists(_parentId2) 
        returns (uint256) 
    {
        Gene storage parent1 = genes[_parentId1];
        Gene storage parent2 = genes[_parentId2];
        
        require(parent1.isAlive && parent2.isAlive, "Parents must be alive");
        
        // Generate offspring DNA through crossover
        bytes32 offspringDNA = performCrossover(parent1.dnaSequence, parent2.dnaSequence);
        
        // Apply mutation
        if (_pseudoRandom() % 100 < MUTATION_RATE) {
            offspringDNA = mutate(offspringDNA);
        }
        
        uint256 geneId = currentGeneId++;
        uint256 newGeneration = (parent1.generation > parent2.generation ? parent1.generation : parent2.generation) + 1;
        
        genes[geneId] = Gene({
            id: geneId,
            dnaSequence: offspringDNA,
            fitness: 0,
            generation: newGeneration,
            parentId1: _parentId1,
            parentId2: _parentId2,
            creator: msg.sender,
            birthTime: block.timestamp,
            isAlive: true
        });

        userGenes[msg.sender].push(geneId);
        
        emit GeneCreated(geneId, msg.sender, offspringDNA);
        emit GeneEvolved(geneId, _parentId1, _parentId2);
        
        return geneId;
    }

    /**
     * @dev Updates the fitness of a gene based on its performance
     */
    function updateFitness(uint256 _geneId, uint256 _fitness) 
        external 
        geneExists(_geneId) 
    {
        Gene storage gene = genes[_geneId];
        require(gene.creator == msg.sender || msg.sender == owner, "Not authorized to update fitness");
        
        gene.fitness = _fitness;
        
        // Check if gene achieved OMEGA-PRIME status (only count once)
        if (_fitness >= OMEGA_PRIME_THRESHOLD && !isOmegaPrime[_geneId]) {
            isOmegaPrime[_geneId] = true;
            omegaPrimeCount++;
            emit OmegaPrimeAchieved(_geneId, _fitness);
        }
        
        emit FitnessUpdated(_geneId, _fitness);
    }

    /**
     * @dev Creates a new population for group evolution
     */
    function createPopulation(uint256[] memory _geneIds) external returns (uint256) {
        require(_geneIds.length <= MAX_POPULATION_SIZE, "Population too large");
        require(_geneIds.length > 0, "Population cannot be empty");
        
        uint256 populationId = currentPopulationId++;
        uint256 totalFitness = 0;
        uint256 maxFit = 0;
        
        for (uint256 i = 0; i < _geneIds.length; i++) {
            require(_geneIds[i] < currentGeneId, "Invalid gene ID");
            require(genes[_geneIds[i]].isAlive, "Gene must be alive");
            uint256 fitness = genes[_geneIds[i]].fitness;
            totalFitness += fitness;
            if (fitness > maxFit) maxFit = fitness;
        }
        
        populations[populationId] = Population({
            geneIds: _geneIds,
            generation: 0,
            averageFitness: totalFitness / _geneIds.length,
            maxFitness: maxFit,
            evolutionOperator: msg.sender
        });
        
        emit PopulationEvolved(populationId, 0, totalFitness / _geneIds.length);
        return populationId;
    }

    /**
     * @dev Evolves an entire population using natural selection
     */
    function evolvePopulation(uint256 _populationId) external {
        require(_populationId < currentPopulationId, "Population does not exist");
        Population storage pop = populations[_populationId];
        require(pop.evolutionOperator == msg.sender, "Not authorized");
        
        // Select the fittest genes for reproduction
        uint256[] memory newGeneration = selectFittest(pop.geneIds);
        
        // Update population
        pop.geneIds = newGeneration;
        pop.generation++;
        
        // Recalculate fitness metrics
        uint256 totalFitness = 0;
        uint256 maxFit = 0;
        
        for (uint256 i = 0; i < newGeneration.length; i++) {
            uint256 fitness = genes[newGeneration[i]].fitness;
            totalFitness += fitness;
            if (fitness > maxFit) maxFit = fitness;
        }
        
        pop.averageFitness = totalFitness / newGeneration.length;
        pop.maxFitness = maxFit;
        
        emit PopulationEvolved(_populationId, pop.generation, pop.averageFitness);
    }

    /**
     * @dev Internal function to perform genetic crossover
     */
    function performCrossover(bytes32 _dna1, bytes32 _dna2) internal view returns (bytes32) {
        uint256 crossoverPoint = _pseudoRandom() % 256;
        uint256 mask = (1 << crossoverPoint) - 1;
        
        uint256 dna1Uint = uint256(_dna1);
        uint256 dna2Uint = uint256(_dna2);
        
        uint256 offspring = (dna1Uint & mask) | (dna2Uint & ~mask);
        return bytes32(offspring);
    }

    /**
     * @dev Internal function to mutate DNA
     */
    function mutate(bytes32 _dna) internal view returns (bytes32) {
        uint256 dnaUint = uint256(_dna);
        uint256 mutationPoint = _pseudoRandom() % 256;
        dnaUint ^= (1 << mutationPoint); // Flip bit at mutation point
        return bytes32(dnaUint);
    }

    /**
     * @dev Internal function for natural selection using tournament selection
     * Note: This implementation allows duplicate selections, which is standard
     * for genetic algorithms to allow fitter individuals higher reproduction rates
     */
    function selectFittest(uint256[] memory _geneIds) internal view returns (uint256[] memory) {
        uint256[] memory selected = new uint256[](_geneIds.length);
        uint256 baseRandom = _pseudoRandom();
        
        for (uint256 i = 0; i < _geneIds.length; i++) {
            uint256 tournamentSize = _geneIds.length >= 3 ? 3 : _geneIds.length;
            uint256 winner = _geneIds[(baseRandom + i) % _geneIds.length];
            
            for (uint256 j = 1; j < tournamentSize; j++) {
                uint256 challenger = _geneIds[(baseRandom + i + j) % _geneIds.length];
                if (genes[challenger].fitness > genes[winner].fitness) {
                    winner = challenger;
                }
            }
            selected[i] = winner;
        }
        
        return selected;
    }

    /**
     * @dev Pseudo-random number generator (not cryptographically secure)
     */
    function _pseudoRandom() internal view returns (uint256) {
        return uint256(keccak256(abi.encodePacked(
            block.timestamp,
            block.prevrandao,
            block.coinbase,
            currentGeneId,
            msg.sender
        )));
    }

    // View functions
    function getGene(uint256 _geneId) external view geneExists(_geneId) returns (Gene memory) {
        return genes[_geneId];
    }

    function getPopulation(uint256 _populationId) external view returns (Population memory) {
        require(_populationId < currentPopulationId, "Population does not exist");
        return populations[_populationId];
    }

    function getUserGenes(address _user) external view returns (uint256[] memory) {
        return userGenes[_user];
    }

    function getTotalGenes() external view returns (uint256) {
        return currentGeneId;
    }

    function getOmegaPrimeCount() external view returns (uint256) {
        return omegaPrimeCount;
    }

    function getOmegaPrimeStatus(uint256 _geneId) external view geneExists(_geneId) returns (bool) {
        return isOmegaPrime[_geneId];
    }

    /**
     * @dev Emergency function to terminate a gene
     */
    function terminateGene(uint256 _geneId) external geneExists(_geneId) {
        Gene storage gene = genes[_geneId];
        require(gene.creator == msg.sender || msg.sender == owner, "Not authorized");
        gene.isAlive = false;
    }

    /**
     * @dev Transfer ownership of the contract
     */
    function transferOwnership(address _newOwner) external onlyOwner {
        require(_newOwner != address(0), "Invalid address");
        owner = _newOwner;
    }
}