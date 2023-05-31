// SPDX-License-Identifier: MIT
pragma solidity ^0.6.0;

contract PriceFeedExt {
    address public gov;
    mapping(address => bool) admin;
    uint8 public decimals = 8;
    string public description;
    address public aggregator;

    uint80 roundId;
    int256 answer;
    mapping (uint80 => int256) answers;

    modifier onlyGov() {
        require(msg.sender == gov, "Not Governor");
        _;
    }

    modifier onlyAdmin() {
        require(admin[msg.sender], "Not Admin");
        _;
    }

    constructor (string memory _description, uint8 _decimals) public {
        gov = msg.sender;

        description = _description;
        decimals = _decimals;
    }

    function isAdmin(address user) external view returns (bool) {
        return admin[user];
    }

    function setAdmin(address user, bool set) external onlyGov {
        require(admin[user] != set, "Already Set");
        admin[user] = set;
    }

    function setGov(address newGov) external onlyGov {
        require(gov != newGov, "Already Set");
        gov = newGov;
    }

    function setDecimals(uint8 newDecimals) external onlyGov {
        require(decimals != newDecimals, "Already Set");
        decimals = newDecimals;
    }

    function setDescription(string calldata newDescription) external onlyGov {
        description = newDescription;
    }

    function transmit(int256 _answer) external onlyAdmin {
        roundId = roundId + 1;
        answer = _answer;
        answers[roundId] = _answer;
    }

    function latestAnswer() external view returns (int256) {
        return answer;
    }

    function latestRound() external view returns (uint80) {
        return roundId;
    }

    function getRoundData(uint80 _roundId) external view returns (uint80, int256, uint256, uint256, uint80) {
        return (_roundId, answers[_roundId], 0, 0, 0);
    }
}