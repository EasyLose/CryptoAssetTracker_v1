const ethers = require('ethers');
require('dotenv').config();

const CONTRACT_ADDRESS = 'YOUR_CONTRACT_ADDRESS_HERE';
const CONTRACT_ABI = []; // Ensure this contains all necessary contract function definitions

const provider = new ethers.providers.JsonRpcProvider(process.env.INFURA_URL);
const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
const cryptoAssetContract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

const cacheStorage = {};

const createCacheKey = (prefix, ...params) => `${prefix}-${params.join('-')}`;

async function fetchDataWithCache(prefix, contractMethodName, ...params) {
    const cacheKey = createCacheKey(prefix, ...params);
    if (cacheStorage[cacheKey]) {
        console.log(`Returning cached result for ${prefix}: `, cacheStorage[cacheKey]);
        return cacheStorage[cacheKey];
    }

    try {
        const contractReply = await cryptoAssetContract[contractMethodName](...params);
        console.log(`${prefix} retrieved: `, contractReply);
        cacheStorage[cacheKey] = contractReply;
        return contractReply;
    } catch (error) {
        console.error(`Error retrieving ${prefix}: ${error.message}`);
        throw new Error(`Failed to retrieve data from contract for ${prefix}. See: ${error.message}`);
    }
}

function checkValidId(id) {
    const cacheKeyForIdValidation = createCacheKey('checkValidId', id);
    if (cacheStorage[cacheKeyForIdValidation] !== undefined) {
        if (!cacheStorage[cacheKeyForIdValidation]) {
            throw new Error("Cached: A valid numeric ID is mandatory.");
        }
        return;
    }

    if (!id || isNaN(id)) {
        cacheStorage[cacheKeyForIdValidation] = false;
        throw new Error("A valid numeric ID is mandatory.");
    }
    cacheStorage[cacheKeyForIdValidation] = true;
}

function checkValidEthereumAddress(address) {
    const cacheKeyForAddressValidation = createCacheKey('checkValidEthereumAddress', address);
    if (cacheStorage[cacheKeyForAddressValidation] !== undefined) {
        if (!cacheStorage[cacheKeyForAddressValidation]) {
            throw new Error("Cached: A valid Ethereum address is required.");
        }
        return;
    }

    if (!ethers.utils.isAddress(address)) {
        cacheStorage[cacheKeyForAddressValidation] = false;
        throw new Error("A valid Ethereum address is required.");
    }
    cacheStorage[cacheKeyForAddressValidation] = true;
}

// New functionality to get ownership history
const getAssetOwnerHistory = async (assetId) => {
    checkValidId(assetId); // Reusing existing validation
    try {
        const ownershipHistory = await fetchDataWithCache('getAssetOwnerHistory', 'getOwnershipHistory', assetId);
        console.log(`Ownership History for Asset ID ${assetId}:`, ownershipHistory);
        return ownershipHistory;
    } catch (error) {
        console.error(`Error fetching ownership history: ${error}`);
        throw new Error(`Failed to fetch ownership history for asset: ${error.message}`);
    }
};

module.exports = {
    getDetailsOfAsset: async (assetId) => {
        checkValidId(assetId);
        try {
            const detailsOfAsset = await fetchDataWithCache('getDetailsOfAsset', 'getAsset', assetId);
            console.log(`Details for Asset ID ${assetId}:`, detailsOfAsset);
            return detailsOfAsset;
        } catch (error) {
            console.error(`Error fetching details of asset: ${error}`);
            throw new Error(`Failed to fetch details for asset: ${error.message}`);
        }
    },
    
    getSummaryOfAllAssets: async () => {
        try {
            const summaryOfAllAssets = await fetchDataWithCache('getSummaryOfAllAssets', 'getAllAssets');
            console.log(`Summary of All Assets:`, summaryOfAllAssets);
            return summaryOfAllAssets;
        } catch (error) {
            console.error(`Error fetching summary of all assets: ${error}`);
            throw new Error(`Failed to fetch summary of all assets: ${error.message}`);
        }
    },

    getAssetOwnerHistory, // Exposing the new function
};