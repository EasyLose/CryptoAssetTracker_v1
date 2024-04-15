const { ethers } = require('ethers');
require('dotenv').config();
const contractABI = [];
const contractAddress = 'CONTRACT_ADDRESS';
const provider = new ethers.providers.JsonRpcProvider(process.env.INFURA_URL);
const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
const assetsContract = new ethers.Contract(contractAddress, contractABI, signer);
async function registerAsset(name, description) {
    try {
        const tx = await assetsContract.registerAsset(name, description);
        console.log("Transaction hash:", tx.hash);
        const receipt = await tx.wait();
        console.log("Transaction confirmed in block:", receipt.blockNumber);
    } catch (error) {
        console.error("Failed to register asset:", error);
    }
}
async function transferAsset(assetId, newOwner) {
    try {
        const tx = await assetsContract.transferAsset(assetId, newOwner);
        console.log("Transaction hash:", tx.hash);
        const receipt = await tx.wait();
        console.log("Transaction confirmed in block:", receipt.blockNumber);
    } catch (error) {
        console.error("Failed to transfer asset:", error);
    }
}
async function acceptTransfer(assetId) {
    try {
        const tx = await assetsContract.acceptTransfer(assetId);
        console.log("Transaction hash:", tx.hash);
        const receipt = await tx.wait();
        console.log("Transaction confirmed in block:", receipt.blockNumber);
    } catch (error) {
        console.error("Failed to accept asset transfer:", error);
    }
}
async function getAssetHistory(assetId) {
    try {
        const history = await assetsContract.getAssetHistory(assetId);
        console.log("Asset history:", history);
    } catch (error) {
        console.error("Failed to fetch asset history:", error);
    }
}