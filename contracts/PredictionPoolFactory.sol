// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import {PredictionPool} from "./PredictionPool.sol";

/**
 * @title PredictionPoolFactory
 * @dev Factory contract to create and manage PredictionPool contracts.
 *      Allows users to create their own prediction pools.
 */
contract PredictionPoolFactory {
    address public owner;   // Owner of the factory contract
    bool public paused;     // Indicates if the factory is paused

    /**
     * @dev Structure representing a prediction pool created by a user.
     * @param poolAddress Address of the deployed PredictionPool contract.
     * @param owner Address of the pool creator.
     * @param name Name of the prediction pool.
     * @param creationTime Timestamp when the pool was created.
     */
    struct Pool {
        address poolAddress;
        address owner;
        string name;
        uint256 creationTime;
    }

    Pool[] public pools;                             // Array of all created pools
    mapping(address => Pool[]) public userPools;     // Mapping of user addresses to their pools

    // Modifiers
    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner.");
        _;
    }

    modifier notPaused() {
        require(!paused, "Factory is paused");
        _;
    }

    /**
     * @dev Constructor that sets the factory owner.
     */
    constructor() {
        owner = msg.sender;
    }

    /**
     * @dev Creates a new PredictionPool contract.
     * @param _name Name of the prediction pool.
     * @param _description Description of the prediction pool.
     * @param _maxLimit Maximum total bets allowed (0 for no limit).
     * @param _durationInDays Duration of the betting period in days.
     * @return poolAddress Address of the newly created PredictionPool contract.
     */
    function createPool(
        string memory _name,
        string memory _description,
        uint256 _maxLimit,
        uint256 _durationInDays,
        address _tokenAddress
    ) external notPaused returns (address poolAddress) {
        // Deploy a new PredictionPool contract
        PredictionPool newPool = new PredictionPool(
            msg.sender,
            _name,
            _description,
            _maxLimit,
            _durationInDays,
            _tokenAddress,
          0x1B6877c6Dac4b6De4c5817925DC40E2BfdAFc01b
        );
        poolAddress = address(newPool);

        // Store the new pool information
        Pool memory pool = Pool({
            poolAddress: poolAddress,
            owner: msg.sender,
            name: _name,
            creationTime: block.timestamp
        });

        pools.push(pool);
        userPools[msg.sender].push(pool);
    }

    /**
     * @dev Returns the list of pools created by a specific user.
     * @param _user Address of the user.
     * @return Array of Pool structs.
     */
    function getUserPools(address _user) external view returns (Pool[] memory) {
        return userPools[_user];
    }

    /**
     * @dev Returns the list of all pools created.
     * @return Array of Pool structs.
     */
    function getAllPools() external view returns (Pool[] memory) {
        return pools;
    }

    /**
     * @dev Toggles the paused state of the factory.
     */
    function togglePause() external onlyOwner {
        paused = !paused;
    }
}
