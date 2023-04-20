# SushiSwap RouteProcesser2 Exploit PoC

- SushiSwap was hacked because of an untrusted address being used as a UniswapV3 pool without valdiation
- This is a proof of concept (PoC) of this vulnerability. 

## Learn More
- Want to understand this bug inside and out? Go to https://maxwelldulin.com/BlogPost/sushiswap-exploit-explained-2023. 

## Instructions for running
- Node and yarn should be installed
- Download the code using 'git' or download as a zip
- Install dependencies (mainly hardhat):
    - ``yarn``
- Run exploit code:
    - ``yarn hardhat run ./scripts/hackSushi.js``
    - Runs a forked blockchain prior to the hack and executes the attack
- Hack everyone: 
    - Start up a node:
        - ``yarn hardhat node --fork RPC_PROVIDER_URL --fork-block-number 17007838``
    - Get vulnerable users: 
        - May need to install web3 for python3 and other libraries
        - ``python3 get_logs_for_address.py``
    - Run exploit for everyone: 
        - ``yarn hardhat run ./scripts/hackSushiEveryone.js --network localhost``

## Files
- ./contracts
    - Exploit.sol:
        - Full PoC code
    - ExploitEveryone.sol: 
        - Contract that takes in dynamic values instead of creating a user
    - RouteProcesser2.sol:
        - Vulnerable code copied from etherscan
        - https://etherscan.io/address/0x044b75f554b886a065b9567891e45c79542d7357#code#F6#L3
    - InputStream.sol:
        - Code that is used for parsing the input of the route. Comes from the contract.
    - IUniswapV3Pool.sol: 
        - Interface for UniswapV3 pool
- scripts:
    - hackSushi.js:
        - The javascript code for deploying the contracts and executing the attack
    - hackSushiEveryone.js: 
        - The javascript code for deploying the exploit contract
        - Iterates through all vulnerable users and steals their funds
- get_logs_for_address.py:
    - Find all usres vulnerable to the attack
    - Outputs to 'exploit.json'
- erc20.abi:
    - JSON file that contains the ERC20 abi
- Everything else is standard hardhat(hardhat.config.js,...)

