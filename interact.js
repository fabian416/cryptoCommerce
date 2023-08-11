const { ethers } = require('ethers');
const { JsonRpcProvider } = require('ethers/providers');
const fs = require('fs');

// Load environment variables
require('dotenv').config();

console.log("Starting script...");

const provider = new JsonRpcProvider(process.env.MATIC_RPC_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

console.log("Connected to Matic network...");
console.log("Loaded account:", wallet.address);

const contractData = JSON.parse(fs.readFileSync('out/market_transaction.sol/ShoppingTransaction.json', 'utf8'));
const contract = new ethers.Contract('0x99B5d4F29Cc6E8165245764cEeCdD37dA94F1f07', contractData.abi, wallet);
contract.address = '0x99B5d4F29Cc6E8165245764cEeCdD37dA94F1f07';
console.log("Contract instantiated at:", '0x99B5d4F29Cc6E8165245764cEeCdD37dA94F1f07');

const erc20Abi = [ 
    {
        "constant": false,
        "inputs": [
            {
                "name": "spender",
                "type": "address"
            },
            {
                "name": "amount",
                "type": "uint256"
            }
        ],
        "name": "approve",
        "outputs": [
            {
                "name": "",
                "type": "bool"
            }
        ],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
    }
];
async function checkAddresses() {
    const usdtAddress = await contract.usdtToken();
    const usdcAddress = await contract.usdcToken();

    console.log("USDT Address in Contract:", usdtAddress);
    console.log("USDC Address in Contract:", usdcAddress);
}


async function checkBalance() {
    let balanceWei = await provider.getBalance(wallet.address);
    let balance = ethers.formatEther(balanceWei);
    console.log(`Balance for account ${wallet.address}: ${balance} Matic`);
}


async function approveTokens(tokenAddress, amount) {
    if (!tokenAddress) {
        console.error("Token address is not defined!");
        return;
    }
    console.log(`Approving tokens. Token address: ${tokenAddress}, Amount: ${amount}`);

    console.log("Approving contract address:", contract.address); 

    const token = new ethers.Contract(tokenAddress, erc20Abi, wallet);
    const tx = await token.approve(contract.address, amount);
    await tx.wait();
    console.log(`Tokens approved for contract: ${amount}`);
}


async function simulatePurchase() {
    try {
        console.log("Making purchase...");
        const totalToPay = ethers.parseUnits('2', 18);// Simulate a 2 USDT purchase
        const orderUUID = "123456"; // Just an example, you should generate a unique UUID in practice
        console.log("USDC_ADDRESS:", process.env.USDT_ADDRESS);

        console.log("Token Contract Address:", process.env.USDT_ADDRESS);
        console.log("Shopping Contract Address:", contract.address);

        await approveTokens(process.env.USDT_ADDRESS, totalToPay); // Ensure to set the USDT_ADDRESS in your .env file

        const transactionResponse = await contract.purchase(orderUUID, totalToPay, 0, { gasLimit: 2000000 }); // 0 is for USDT, 1 for USDC
        console.log("Transaction sent. Awaiting confirmation...");

        const receipt = await transactionResponse.wait();
        console.log("Purchase successfully made. Receipt:", receipt);
    } catch (error) {
        console.error("An error occurred during purchase simulation:", error);
    }
}
checkAddresses();
checkBalance();
simulatePurchase();

