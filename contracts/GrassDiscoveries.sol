// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract GrassDiscoveries is ERC721, Ownable {
    using Counters for Counters.Counter;

    Counters.Counter private _tokenIdCounter;
    string private baseURI;

    struct Discovery {
        string name;
        string rarity; // common, uncommon, rare
        string location;
        uint256 timestamp;
    }

    struct NetworkConfig {
        string title;
        uint256 tokenCount;
        uint256 connectionCount;
        uint256 timestamp;
    }

    mapping(uint256 => Discovery) public discoveries;
    mapping(uint256 => NetworkConfig) public networks;
    mapping(uint256 => bool) public isNetwork;

    event DiscoveryMinted(uint256 indexed tokenId, string name, string rarity);
    event NetworkMinted(uint256 indexed tokenId, string title, uint256 tokens);

    constructor(string memory _baseURI) ERC721("Grass Discoveries", "GRASS") {
        baseURI = _baseURI;
    }

    function mintDiscovery(
        address to,
        string memory name,
        string memory rarity,
        string memory location
    ) public onlyOwner returns (uint256) {
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();

        _safeMint(to, tokenId);
        discoveries[tokenId] = Discovery(name, rarity, location, block.timestamp);
        isNetwork[tokenId] = false;

        emit DiscoveryMinted(tokenId, name, rarity);
        return tokenId;
    }

    function mintNetwork(
        address to,
        string memory title,
        uint256 tokenCount,
        uint256 connectionCount
    ) public onlyOwner returns (uint256) {
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();

        _safeMint(to, tokenId);
        networks[tokenId] = NetworkConfig(title, tokenCount, connectionCount, block.timestamp);
        isNetwork[tokenId] = true;

        emit NetworkMinted(tokenId, title, tokenCount);
        return tokenId;
    }

    function setBaseURI(string memory _baseURI) public onlyOwner {
        baseURI = _baseURI;
    }

    function _baseURI() internal view override returns (string memory) {
        return baseURI;
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(_exists(tokenId), "Token does not exist");
        return string(abi.encodePacked(baseURI, uint2str(tokenId), ".json"));
    }

    function uint2str(uint256 _i) internal pure returns (string memory) {
        if (_i == 0) return "0";
        uint256 j = _i;
        uint256 len;
        while (j != 0) {
            len++;
            j /= 10;
        }
        bytes memory bstr = new bytes(len);
        uint256 k = len;
        while (_i != 0) {
            k = k-1;
            uint8 temp = (48 + uint8(_i - _i / 10 * 10));
            bstr[k] = bytes1(temp);
            _i /= 10;
        }
        return string(bstr);
    }
}
