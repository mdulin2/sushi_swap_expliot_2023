
- What's this bug?
    - Trust Whitehat hack: https://twitter.com/trust__90/status/1644895249058131971
    - Peckshield: https://twitter.com/peckshield/status/1644907207530774530
    - Slowmist: https://twitter.com/SlowMist_Team/status/1644936375924584449
    - Router address: 
        - https://etherscan.io/address/0x044b75f554b886a065b9567891e45c79542d7357
    - Victim user 0xsifu address: 
        - 0x31d3243CfB54B34Fc9C73e1CB1137124bD6B13E1
- Slowmist/Peckshield description/learnings: 
    - Approval bug in contract
    - UniswapV3 functionality
    - processRoute entrypoint
- Hitting the functionality:
    - processRoute->processRouteInternal->processOnePool->swap->swapUniV3
    - Control lots of inputs via ``stream``
    - uniswapV3Callback - why is this here?
- Vulnerability: 
    - Lack of input validation for pool address
    - Trusted entity on the callback
- Exploitation strategy: 
    - Call processRoute with a malicious pool address 
    - Implement ``swap`` on the pool that we provided
    - Call ``uniswapV3Callback`` while in the swap function of our malicious contract
    - Specify the user, token and amount to steal.
- Writing the contract: 
    - Router
    - Token (wETH) 
    - Victim user - 0xsifu
    - Route interface
    - Calling route
    - Hitting uniswapv3
    - Interface the callback 
    - Calling the callback
    - Show users current funds
    - Exploit!
    - Show new funds (should be 0) 
- Iterating through vulnerable users:
    - Get all transactions by users on the contract
    - Parse events from the transactions for 'Transfer' from the receiptents name
    - Check if allowance for the router and balance are greater than 0
    - All the victims! : 
- Contract modifications:
    - Control the token and user dynamically
- Script mods: 
    - Parse the JSON output 
        ```
        const fs = require('fs');

        users = JSON.parse(fs.readFileSync("../../tools/etherscan/exploit.json"));

        for(let i = 1; i < users.length; i++){ 
        ```
    - Add addresses of token and victim to the 'attacker'
    - Find balances
        - ```
            const tokenContract = await hre.ethers.getContractAt('IERC20', victimToken, accounts[0]);
            console.log(await tokenContract.balanceOf(victimAddress));
            ```
    - Do this in a LOOP to steal all of the funds
