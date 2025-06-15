const { Alchemy, Network, Wallet, Utils } = require("alchemy-sdk");
require("dotenv").config();

const { TEST_API_KEY, TEST_PRIVATE_KEY, RECEIVER_ADDRESS } = process.env;

const settings = {
  apiKey: TEST_API_KEY,
  network: Network.ETH_SEPOLIA,
};

const alchemy = new Alchemy(settings);

let wallet = new Wallet(TEST_PRIVATE_KEY, alchemy.core);

async function main() {
  const nonce = await alchemy.core.getTransactionCount(
    wallet.address,
    "latest",
  );

  let transaction = {
    to: RECEIVER_ADDRESS,
    value: Utils.parseEther("0.01"), // 0.01 worth of ETH being sent
    // gasLimit: "31000", // Initially 21000
    maxPriorityFeePerGas: Utils.parseUnits("5", "gwei"),
    maxFeePerGas: Utils.parseUnits("20", "gwei"),
    nonce: nonce,
    type: 2,
    chainId: 11155111, // sepolia transaction
  };

  // let Alchemy to estimate the gasLimit
  transaction.gasLimit = await wallet.estimateGas(transaction);

  let rawTransaction = await wallet.signTransaction(transaction);
  console.log("Raw tx: ", rawTransaction);
  let tx = await alchemy.core.sendTransaction(rawTransaction);
  console.log(`Etherscan URL: https://sepolia.etherscan.io/tx/${tx.hash}`);
}

main().catch((err) => {
  console.error("Error sending transaction", err);
});
