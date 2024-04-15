const ethers = require('ethers');
require('dotenv').config();

const CONTRACT_ADDRESS = 'YOUR_CONTRACT_ADDRESS_HERE';
const CONTRACT_ABI = []; 

const provider = new ethers.providers.JsonRpcProvider(process.env.INFURA_URL);
const walletWithProvider = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
const contractInstance = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, walletWithProvider);

const cacheStore = {};

const generateCacheKey = (prefix, ...parameters) => `${prefix}-${parameters.join('-')}`;

async function fetchFromContractWithCache(prefix, contractMethod, ...parameters) {
    const cacheKey = generateCacheKey(prefix, ...parameters);
    if (cacheStore[cacheKey]) {
        console.log(`Returning cached result for ${prefix}: `, cacheStore[cacheKey]);
        return cacheStore[cacheKey];
    }

    try {
        const contractResponse = await contractInstance[contractMethod](...parameters);
        console.log(`${prefix} fetched: `, contractResponse);
        cacheStore[cacheKey] = contractResponse;
        return contractResponse;
    } catch (error) {
        console.error(`Error fetching ${prefix}: ${error}`);
        throw new Error(`Error during fetch for ${prefix}.`);
    }
}

function validateId(id) {
    const idValidationCacheKey = generateCacheKey('validateId', id);
    if (cacheStore[idValidationCacheKey] !== undefined) {
        if (!cacheStore[idValidationCacheKey]) {
            throw new Error("Cached: Valid ID is required.");
        }
        return;
    }

    if (!id) {
        cacheStore[idValidationCacheKey] = false;
        throw new Error("Valid ID is required.");
    }
    cacheStore[idValidationCacheKey] = true;
}

function validateOwnerAddress(ownerAddress) {
    const addressValidationCacheKey = generateCacheKey('validateOwnerAddress', ownerAddress);
    if (cacheStore[addressValidationCacheKey] !== undefined) {
        if (!cacheStore[addressValidationCacheKey]) {
            throw new Error("Cached: Valid owner address is required.");
        }
        return;
    }

    if (!ethers.utils.isAddress(ownerAddress)) {
        cacheStore[addressValidationCacheKey] = false;
        throw new Error("Valid owner address is required.");
    }
    cacheStore[addressValidationCacheKey] = true;
}

module.exports = {
    addAsset: async (name, description) => {
        const additionCacheKey = generateCacheKey('addAsset', name, description);
        if (cacheStore[additionCacheKey]) {
            console.log(`Cached: Asset ${name} already added.`);
            return;
        }

        if (!name || !description) {
            console.error("Asset addition failed: Name or description missing.");
            throw new Error("Name and description for asset are mandatory.");
        }

        try {
            const creationTx = await contractInstance.createAsset(name, description);
            await creationTx.wait();
            console.log(`New asset added: ${name}`);
            cacheStore[additionCacheKey] = true;
        } catch (error) {
            console.error(`Asset addition error: ${error.message}`);
            throw new Error(`Failed to add asset: ${error.message}`);
        }
    },

    transferAsset: async (assetId, recipientAddress) => {
        const transferCacheKey = generateCacheKey('transferAsset', assetId, recipientAddress);
        if (cacheStore[transferCacheKey]) {
            console.log(`Cached: Asset ID ${assetId} transfer already initiated to ${recipientAddress}`);
            return;
        }

        try {
            validateId(assetId);
            validateOwnerAddress(recipientAddress);
            const transferTx = await contractInstance.initiateAssetTransfer(assetId, recipientAddress);
            await transferTx.wait();
            console.log(`Asset ID ${assetId} transfer initiated to ${recipientAddress}`);
            cacheStore[transferCacheKey] = true;
        } catch (error) {
            console.error(`Error initiating asset transfer: ${error}`);
            throw new Error(`Failed to initiate asset transfer: ${error.message}`);
        }
    },
};