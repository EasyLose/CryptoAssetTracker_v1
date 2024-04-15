const ethers = require('ethers');
require('dotenv').config();

const CONTRACT_ADDRESS = 'YOUR_CONTRACT_ADDRESS_HERE';
const CONTRACT_ABI = []; // Ensure this is filled with your contract's actual ABI

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
        console.error(`Error fetching ${prefix}: ${error.message}`);
        throw new Error(`Error fetching from contract for ${prefix}. See: ${error.message}`);
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

    if (!id || isNaN(id)) {
        cacheStore[idValidationCacheKey] = false;
        throw new Error("A valid numeric ID is required.");
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
        throw new Error("A valid Ethereum address is required.");
    }
    cacheStore[addressValidationCacheKey] = true;
}

module.exports = {
    // Existing functions included here for completeness...

    // New functionality: Fetch specific asset details
    getAssetDetails: async (assetId) => {
        validateId(assetId);
        try {
            const assetDetails = await contractInstance.getAsset(assetId);
            console.log(`Asset Details for ID ${assetId}:`, assetDetails);
            return assetDetails;
        } catch (error) {
            console.error(`Error fetching asset details: ${error}`);
            throw new Error(`Failed to fetch asset details: ${error.message}`);
        }
    },
    
    // New functionality: Fetch summary of all assets
    getAllAssetsSummary: async () => {
        try {
            const allAssets = await contractInstance.getAllAssets();
            console.log(`Summary of all assets:`, allAssets);
            return allAssets;
        } catch (error) {
            console.error(`Error fetching all assets summary: ${error}`);
            throw new Error(`Failed to fetch all assets summary: ${error.message}`);
        }
    },
};