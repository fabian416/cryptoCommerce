const ethers = require('ethers');
const { JsonRpcProvider } = require('ethers/providers');
const { utils } = require('ethers');
console.log(utils)
const fs = require('fs');

// Load environment variables
require('dotenv').config();



console.log("Starting script...");


// Connect to Matic's Mumbai network using ethers
const provider = new JsonRpcProvider(process.env.MATIC_RPC_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
console.log(process.env.PRIVATE_KEY);
console.log(wallet);
console.log(utils); 
console.log("Connected to Matic network...");
console.log("Loaded account:", wallet.address);

const contractData = JSON.parse(fs.readFileSync('out/market_transaction.sol/ShoppingTransaction.json', 'utf8'));
const contract = new ethers.Contract('0x00F382A1E79b4159071faF7a608bD3F987cb9501', contractData.abi, wallet);
console.log("Contract instantiated at:", contract.address);

async function checkBalance() {
    let balanceWei = await wallet.getBalance();
    let balance = ethers.utils.formatEther(balanceWei);
    console.log(`Balance for account ${wallet.address}: ${balance} ETH (or Matic if you're on that network)`);
}

checkBalance();

async function simulatePurchase() {
    try {
        console.log("Making purchase...");
        const totalToPay = utils.parseEther('25'); // Simulate a 25 USDT purchase
        const orderUUID = "123456"; // Just an example, you should generate a unique UUID in practice

        const transactionResponse = await contract.purchase(orderUUID, totalToPay, 0, { gasLimit: 2000000 }); // 0 is for USDT, 1 for USDC
        console.log("Transaction sent. Awaiting confirmation...");

        const receipt = await transactionResponse.wait();
        console.log("Purchase successfully made. Receipt:", receipt);
    } catch (error) {
        console.error("An error occurred during purchase simulation:", error);
    }
}

simulatePurchase();
