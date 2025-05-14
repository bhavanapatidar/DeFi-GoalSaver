// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract SaverBadge is ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;
    
    // Mapping to track claimed badges per user
    mapping(address => mapping(uint256 => bool)) public claimedBadges;
    
    // Badge thresholds in ETH
    uint256[] public badgeThresholds = [1 ether, 5 ether, 10 ether, 25 ether, 50 ether];
    
    // Badge metadata URIs
    string[] public badgeURIs = [
        "ipfs://QmX1...", // Bronze Saver
        "ipfs://QmX2...", // Silver Saver
        "ipfs://QmX3...", // Gold Saver
        "ipfs://QmX4...", // Platinum Saver
        "ipfs://QmX5..."  // Diamond Saver
    ];
    
    // Reference to the savings contract
    address public savingsContract;
    
    event BadgeMinted(address indexed user, uint256 badgeId, uint256 threshold);
    
    constructor() ERC721("Saver Badge", "SAVERBADGE") {}
    
    function setSavingsContract(address _savingsContract) external onlyOwner {
        savingsContract = _savingsContract;
    }
    
    function claimBadge(uint256 badgeIndex) external {
        require(badgeIndex < badgeThresholds.length, "Invalid badge");
        require(!claimedBadges[msg.sender][badgeIndex], "Already claimed");
        
        // Verify savings amount through savings contract
        (bool success, bytes memory data) = savingsContract.staticcall(
            abi.encodeWithSignature("getTotalSaved(address)", msg.sender)
        );
        require(success, "Failed to verify savings");
        uint256 totalSaved = abi.decode(data, (uint256));
        
        require(totalSaved >= badgeThresholds[badgeIndex], "Threshold not reached");
        
        // Mark as claimed and mint badge
        claimedBadges[msg.sender][badgeIndex] = true;
        _tokenIds.increment();
        uint256 newBadgeId = _tokenIds.current();
        
        _safeMint(msg.sender, newBadgeId);
        _setTokenURI(newBadgeId, badgeURIs[badgeIndex]);
        
        emit BadgeMinted(msg.sender, newBadgeId, badgeThresholds[badgeIndex]);
    }
    
    function getAvailableBadges(address user) external view returns (uint256[] memory) {
        uint256[] memory available = new uint256[](badgeThresholds.length);
        uint256 count = 0;
        
        (bool success, bytes memory data) = savingsContract.staticcall(
            abi.encodeWithSignature("getTotalSaved(address)", user)
        );
        require(success, "Failed to verify savings");
        uint256 totalSaved = abi.decode(data, (uint256));
        
        for (uint256 i = 0; i < badgeThresholds.length; i++) {
            if (totalSaved >= badgeThresholds[i] && !claimedBadges[user][i]) {
                available[count] = i;
                count++;
            }
        }
        
        // Resize array to actual count
        uint256[] memory result = new uint256[](count);
        for (uint256 i = 0; i < count; i++) {
            result[i] = available[i];
        }
        
        return result;
    }
    
    function getBadgeDetails(uint256 badgeIndex) external view returns (uint256 threshold, string memory uri) {
        require(badgeIndex < badgeThresholds.length, "Invalid badge");
        return (badgeThresholds[badgeIndex], badgeURIs[badgeIndex]);
    }
} 