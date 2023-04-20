import requests
from web3 import Web3
import web3
import json
from web3.logs import DISCARD

ETHERSCAN_API_KEY = "ADD_KEY_HERE"

# Get transactions for the sushi router
url = "https://api.etherscan.io"
path = "/api" 
parameters = "?module=account&action=txlist&address=0x044b75f554b886a065b9567891e45c79542d7357&startblock=0&endblock=17007838&apikey=" + ETHERSCAN_API_KEY

#parameters = "?module=account&action=txlistinternal&address=0x044b75f554b886a065b9567891e45c79542d7357&startblock=0&endblock=9999999999999&apikey=68AZESFRTTA3GXRFGKX1J73KW112YSB3TD"

# Make the request to get all of the transactions for this contract
r = requests.get(url + path + parameters)

# Remove the creation request
data = r.json()['result'][1:]

# https://web3py.readthedocs.io/en/stable/quickstart.html
provider_url = "http://localhost:8545" # local host. Otherwise, add ETH-RPC provider (alchemy and others) here
w3 = Web3(Web3.HTTPProvider(provider_url))

# ERC20 abi 
f = open('./erc20.abi', 'r') 
abi = json.load(f)
f.close() 

# Iterate through all transactions to find users who sent funds
logged_users = []
for transaction in data:
    transaction_data = w3.eth.get_transaction_receipt(transaction.get('hash'))

    events = dict(transaction_data)['logs']

    # https://www.tiger-222.fr/?d=2022/02/23/21/24/20-decoder-les-logs-dun-transfert-avec-web3py
    if(len(events) == 0):
        continue
    erc20 = w3.eth.contract(address=events[0]['address'], abi=abi)
    decoded_logs = erc20.events.Transfer().processReceipt(transaction_data, errors=DISCARD)

    # Iterate through each log entry
    for event in decoded_logs:
        # Only look for transfers
        if(event['event'] == 'Transfer'):
            tokenAddr = event['address']
            from_addr = event.args['from']
            to_addr = event.args['to']

            # Make sure the 'from' is from the user of the contract
            if(from_addr.lower() == transaction['from'].lower()):
                '''
                print("----------------------------------------") 
                print("Token Address: ", tokenAddr)
                print("From Addr:", from_addr)
                print("To Addr: ", to_addr)
                '''
                logged_users.append({"TokenAddress" : tokenAddr, "FromAddress": from_addr})


'''
Look up users balance and approval of the contract
'''
exploit_data = []
user_dict = {}
sushiRouter = "0x044b75f554b886A065b9567891e45c79542d7357"
for user in logged_users:

    # Don't want to double count a user
    if(user["FromAddress"] in user_dict):
        continue
    user_dict[user["FromAddress"]] = 1

    # Getting user balance and allowance
    erc20 = w3.eth.contract(address=user["TokenAddress"], abi=abi)
    balance = erc20.functions.balanceOf(user["FromAddress"]).call()
    allowance = erc20.functions.allowance(user["FromAddress"], sushiRouter).call()

    if(allowance > 0 and balance > 0):
        print("----------------------------------------")
        token_name = erc20.functions.name().call()
        print("Token: ", token_name)
        print("User: ", user['FromAddress'])
        print("Balance:", balance)
        print("Allowance:", allowance)
        exploit_data.append({"victimAddress" : user['FromAddress'], "tokenName" : token_name, "victimToken" : user["TokenAddress"], "victimBalance" : balance, "victimAllowance" : allowance})

# TODO - Calculate total assets at risk

# Write out the vulnerable users to a file
with open('exploit.json', 'w') as f:
        json.dump(exploit_data, f)



