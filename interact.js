const Web3 = require('web3');
const fs = require('fs');

// Carga las variables de entorno Charge the environment variables
require('dotenv').config();

console.log("Iniciando script...");

// Conectar a la red Mumbai de Matic usando web3
const web3 = new Web3(process.env.MATIC_RPC_URL);

console.log("Conectado a la red de Matic...");

// Asegúrate de que la clave privada tiene el formato adecuado
const privateKey = process.env.PRIVATE_KEY.startsWith('0x') ? process.env.PRIVATE_KEY : '0x' + process.env.PRIVATE_KEY;
const account = web3.eth.accounts.privateKeyToAccount(privateKey);

console.log("Cuenta cargada:", account.address);


// Cargar el ABI y bytecode de tu contrato desde el archivo
const contractData = JSON.parse(fs.readFileSync('out/market_transaction.sol/ShoppingTransaction.json', 'utf8'));
const abi = contractData.abi;
console.log("ABI cargado...");

// Instancia de tu contrato
const contractAddress = '0x56C4c8dbb6E9598b90119686c40271a969e1eE44';
const contract = new web3.eth.Contract(abi, contractAddress);

console.log("Contrato instanciado en:", contractAddress);

async function interactuar() {
    try {
        console.log("Intentando obtener la longitud del historial de compras...");
        // Ejemplo de llamada a una función 'view' en tu contrato
        const longitud = await contract.methods.getPurchaseHistoryLength().call();
        console.log(`Longitud del historial de compras: ${longitud}`);

        console.log("Intentando cambiar la dirección del token...");
        // Ejemplo de llamada a una función que cambia el estado del contrato
        const gasPrice = await web3.eth.getGasPrice();
        const gasEstimate = await contract.methods.setTokenAddress('USDT', 'Nueva_Dirección_USDT').estimateGas({ from: account.address });

        const tx = {
            from: account.address,
            to: contractAddress,
            gas: gasEstimate,
            gasPrice: gasPrice,
            data: contract.methods.setTokenAddress('USDT', 'Nueva_Dirección_USDT').encodeABI()
        };

        const signedTx = await account.signTransaction(tx);
        web3.eth.sendSignedTransaction(signedTx.rawTransaction)
            .on('receipt', (receipt) => {
                console.log("Transacción completada con éxito. Recibo:", receipt);
            })
            .on('error', (error) => {
                console.error("Error al enviar la transacción:", error);
            });
    } catch (error) {
        console.error("Se produjo un error durante la interacción:", error);
    }
}

interactuar();
