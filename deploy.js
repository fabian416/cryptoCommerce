const Web3 = require('web3');
const fs = require('fs');

require('dotenv').config();

const web3 = new Web3(process.env.MATIC_RPC_URL);

const privateKey = process.env.PRIVATE_KEY.startsWith('0x') ? process.env.PRIVATE_KEY.substring(2) : process.env.PRIVATE_KEY;

const account = web3.eth.accounts.privateKeyToAccount(privateKey);

console.log("Usando la dirección:", account.address); 

// Configura la cuenta por defecto y agrega la clave privada al wallet
web3.eth.defaultAccount = account.address;
web3.eth.accounts.wallet.add(privateKey);

const contractData = JSON.parse(fs.readFileSync('out/market_transaction.sol/ShoppingTransaction.json', 'utf8'));
const abi = contractData.abi;
const bytecode = contractData.bytecode.object;

const contract = new web3.eth.Contract(abi);

async function deploy() {
    const deployTransaction = contract.deploy({
        data: bytecode,
        arguments: ['0x1BD7B233B054AD4D1FBb767eEa628f28fdE314c6', '0x0FA8781a83E46826621b3BC094Ea2A0212e71B23']
    });
    
    const gas = await deployTransaction.estimateGas();
    console.log("Gas Estimado:", gas);
    const gasPrice = await web3.eth.getGasPrice();
    console.log("Precio del Gas:", gasPrice);
    const totalCost = gas * gasPrice;
    console.log("Costo Total (en wei):", totalCost);
    console.log("Costo Total (en MATIC):", web3.utils.fromWei(totalCost.toString(), 'ether'));

    let balance = await web3.eth.getBalance(account.address);
    console.log(`Saldo actual de ${account.address}: ${web3.utils.fromWei(balance, 'ether')} MATIC`);

    const options = {
        from: account.address,
        data: deployTransaction.encodeABI(),
        gas: gas
    };

    const signed = await web3.eth.accounts.signTransaction(options, privateKey);
    const receipt = await web3.eth.sendSignedTransaction(signed.rawTransaction);
    console.log(`Contract deployed at address: ${receipt.contractAddress}`);
}

deploy();
