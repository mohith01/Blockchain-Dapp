//SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "./Bookies.sol";
import "./BookNFT.sol";

// Application Smart Contract
contract Bookchain { 
    Bookies token;
    BookNFT nft;

    struct Book {
        address owner;
        string bookname;
        uint256 bookid; 
        string bookId;
    }

    struct User {
        string username;
        string userId;
        uint256 flag;
    }

    // Mappings 
    mapping (address => User) public UserTable;
    mapping (address => uint256[]) public UserBookTable;
    mapping (uint256 => Book) public BookTable;

    constructor(address TokenAddress, address NFTAddress) {
        token = Bookies(TokenAddress);
        nft = BookNFT(NFTAddress);
        token.GenerateToken(address(this));
    }

    // Events
    event UserSignup(address UserAddress, string username, string message);
    event BookMint(address UserAddress, uint256 bookid, string message);
    event NftTransfer(address buyer, address owner, uint256 bookid, string message);

    // Modifiers
    modifier NotOwner(address buyer, address owner) {
        require(buyer != owner, "Buyer is the owner");
        _;
    }

    modifier ValidUser(address UserAddress) {
        require(UserTable[UserAddress].flag == 1, "The user does not exist !");
        _;
    }

    modifier ExistingUser(address UserAddress) {
        require(UserTable[UserAddress].flag == 0, "The user already exists !");
        _;
    }

    modifier SufficientFunds(address UserAddress, uint256 PriceNFT) {
        require(UserBalance(UserAddress) >= PriceNFT, "Insufficient Funds !");
        _;
    }
    
    // Functions
    function NewUser(address UserAddress, string memory username, string memory userId) public ExistingUser(UserAddress) {
        UserTable[UserAddress] = User(username,userId, 1);
        token.transfer(UserAddress, 1000);

        emit UserSignup(UserAddress, username, "New User Signed Up");
    }

    function NewBook(address UserAddress, uint256 bookid, string memory bookname, string memory bookId) public ValidUser(UserAddress) {
        UserBookTable[UserAddress].push(bookid);
        BookTable[bookid] = Book(UserAddress, bookname, bookid, bookId);
        nft.MintNFT(UserAddress, address(this), bookid);

        emit BookMint(UserAddress, bookid, "New Book NFT Minted");
    }

    function BuyNFT(address payable owner, address payable buyer, uint256 bookid, uint256 PriceNFT) public NotOwner(buyer, owner) SufficientFunds(buyer, PriceNFT) {
        nft.TransferNFT(owner, buyer, bookid, address(this));
        token.TransferTokens(buyer, owner, PriceNFT);
        UserBookTable[buyer].push(bookid);

        // Move last value to index of to be removed value and pop to remove last value

        for(uint i=0;i<UserBookTable[owner].length;i++){
            if(UserBookTable[owner][i] == bookid){
                UserBookTable[owner][i] = UserBookTable[owner][UserBookTable[owner].length-1];
                UserBookTable[owner].pop();  
            }
        }

        string memory bookname = BookTable[bookid].bookname;
        string memory bookId = BookTable[bookid].bookId;
        BookTable[bookid] = Book(buyer, bookname, bookid, bookId);

        emit NftTransfer(buyer, owner, bookid, "Book NFT Transferred");
    }
    
    function UserBalance(address UserAddress) view public returns(uint) {
        return token.balanceOf(UserAddress);
    }

    function ContractBalance() view public returns(uint) {
        return token.balanceOf(address(this));
    }
}

