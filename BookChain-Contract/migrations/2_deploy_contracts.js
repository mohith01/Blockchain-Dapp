var Bookchain = artifacts.require("Bookchain");
var Bookies = artifacts.require("Bookies");
var BookNFT = artifacts.require("BookNFT");

module.exports = async function(deployer) { 
  await deployer.deploy(Bookies);
  const Bookiesres = await Bookies.deployed();

  await deployer.deploy(BookNFT);
  const BookNFTres = await BookNFT.deployed();
  
  await deployer.deploy(Bookchain, Bookies.address, BookNFT.address);
  const Bookchainres = await Bookchain.deployed();

  // await Bookchain.settokenaddress(Bookiesres.address)
  // await Bookchain.initializeNFT(BookNFTres.address)
  
};