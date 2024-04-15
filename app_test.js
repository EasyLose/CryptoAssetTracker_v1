const ethers = require('ethers');
require('dotenv').config();

const ASSET_CONTRACT_ADDRESS = 'YOUR_CONTRACT_ADDRESS_HERE';
const ASSET_CONTRACT_ABI = [];

const blockchainProvider = new ethers.providers.JsonRpcProvider(process.env.INFURA_URL);
const signerWallet = new ethers.Wallet(process.env.PRIVATE_KEY, blockchainProvider);
const assetContract = new ethers.Contract(ASSET_CONTRACT_ADDRESS, ASSET_CONTRACT_ABI, signerWallet);

const resultCache = {};

const buildCacheKey = (prefix, ...args) => `${prefix}-${args.join('-')}`;

async function fetchWithCaching(prefix, contractMethod, ...args) {
    const cacheKey = buildCacheKey(prefix, ...args);
    if (resultCache[cacheKey]) {
        console.log(`Cached ${prefix}: `, resultCache[cacheKey]);
        return resultCache[cacheKey];
    }

    try {
        const queryResult = await assetContract[contractMethod](...args);
        console.log(`${prefix}: `, queryResult);
        resultCache[cacheKey] = queryResult;
        return queryResult;
    } catch (error) {
        console.error(`Failed to retrieve ${prefix}: ${error}`);
        console.error(error.stack);
        throw new Error(`Fetch operation for ${prefix} failed.`);
    }
}

function ensureValidId(id) {
    if (!id) throw new Error("A valid ID is required.");
}

function ensureValidOwnerAddress(ownerAddress) {
    if (!ethers.utils.isAddress(ownerAddress)) throw new Error("A valid owner address is required.");
}

module.exports = {
    createAsset: async (assetName, assetDescription) => {
        if (!assetName || !assetDescription) {
            console.error("Asset creation failed: missing name or description.");
            throw new Error("Asset name and description are required fields.");
        }

        try {
            const creationTransaction = await assetContract.createAsset(assetName, assetDescription);
            await creationTransaction.wait();
            console.log(`Asset created: ${assetName}`);
        } catch (error) {
            console.error(`Failed to create asset: ${error.message}`);
            throw new Error(`Asset creation failed: ${error.message}`);
        }
    },

    initiateAssetTransfer: async (assetId, newOwnerAddress) => {
        try {
            ensureValidId(assetId);
            ensureValidOwnerAddress(newOwnerAddress);
            const transferTransaction = await assetContract.initiateAssetTransfer(assetId, newOwnerAddress);
            await transferTransaction.wait();
            console.log(`Transfer initiated for asset ID ${assetId} to ${newOwnerAddress}`);
        } catch (error) {
            console.error(`Failed to initiate asset transfer: ${error}`);
            throw new Error(`Asset transfer initiation failed: ${error.message}`);
        }
    },
};