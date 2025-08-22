// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract Vault {
    address public owner;
    uint256 public totalFunds;

    constructor() {
        owner = msg.sender;
    }

    function deposit() external payable {
        totalFunds += msg.value;
    }

    function withdraw(uint256 amount) external {
        require(msg.sender == owner, "Not authorized");
        require(amount <= totalFunds, "Insufficient funds");
        totalFunds -= amount;
        payable(owner).transfer(amount);
    }
}
