//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract NFT is ERC721URIStorage{
    using Counters for Counters.Counter;
    Counters.Counter tokenIdCounter;

    address contractAddress;

    constructor(address marketPlaceAdress) ERC721("Ocean Tokens", "OCNT"){
        contractAddress = marketPlaceAdress;
    }


    function createToken(string memory tokenUri) public returns(uint){

        tokenIdCounter.increment();
        uint newTokenId = tokenIdCounter.current();

        _mint(msg.sender, newTokenId);
        _setTokenURI(newTokenId, tokenUri);
        setApprovalForAll(contractAddress, true);


        return newTokenId;
    }
}