//SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

// NFT for Books
contract BookNFT is ERC721 { 
    constructor () ERC721("BookNFT", "BFT") {   
    }

    function MintNFT (address user, address SmartContract, uint256 uid) public {
        uint256 newtoken = uid;
        _safeMint(user, newtoken);
        _approve(SmartContract, newtoken);
    }

    function TransferNFT (address from, address to, uint256 TokenId, address SmartContract) public {
        safeTransferFrom(from, to, TokenId);
        _approve(SmartContract, TokenId);
    }
}