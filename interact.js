const Web3 = require('web3');
const fs = require('fs');

// Carga las variables de entorno
require('dotenv').config();

console.log("Iniciando script...");

// Conectar a la red Mumbai de Matic usando web3
const web3 = new Web3(process.env.MATIC_RPC_URL);
console.log("Conectado a la red de Matic...");

// Asegúrate de que la clave privada tiene el formato adecuado
const privateKey = process.env.PRIVATE_KEY.startsWith('0x') ? process.env.PRIVATE_KEY : '0x' + process.env.PRIVATE_KEY;
const account = web3.eth.accounts.privateKeyToAccount(privateKey);
console.log("Cuenta cargada:", account.address);

// Cargar el ABI de tu contrato desde el archivo
const contractData = JSON.parse(fs.readFileSync('out/market_transaction.sol/ShoppingTransaction.json', 'utf8'));
const abi = contractData.abi;
console.log("ABI cargado...");

// Instancia de tu contrato
const contractAddress = '0x5ba1B40c2503B716BCB67c439A63BBfe3071147d';
const contract = new web3.eth.Contract(abi, contractAddress);
console.log("Contrato instanciado en:", contractAddress);

async function interact() {
    try {
        console.log("Intentando obtener la longitud del historial de compras...");
        // Ejemplo de llamada a una función 'view' en tu contrato
        const longitud = await contract.methods.getPurchaseHistoryLength().call();
        console.log(`Longitud del historial de compras: ${longitud}`);
    } catch (error) {
        console.error("Se produjo un error durante la interacción:", error);
    }
}

interact();
