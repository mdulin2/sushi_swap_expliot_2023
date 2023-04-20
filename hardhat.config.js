require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.18",
  networks: {
    hardhat: {
      forking: {
        url: "https://eth-mainnet.g.alchemy.com/v2/rhOD4adN-0KbCwUAkN8B_jv-CjjQ0di_",
        block: 17007838
      }
    }
  }
};
