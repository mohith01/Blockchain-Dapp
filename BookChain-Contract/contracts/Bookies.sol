//SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

// Tokens for buying NFT
contract Bookies is ERC20 {
    constructor() ERC20("Bookies", "BK"){
    }

    function GenerateToken (address SmartContract) public {
        _mint(SmartContract, 100 * 10 ** 18);
    }

    function TransferTokens (address from, address to, uint256 Token) public {
        _transfer(from, to, Token);
    }
}