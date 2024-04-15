const ethers = require('ethers');

require('dotenv').config();

const CONTRACT_ADDRESS = 'YOUR_CONTRACT_ADDRESS_HERE';
const CONTRACT_ABI = [];

const provider = new ethers.providers.JsonRpcProvider(process.env.INFURA_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, wallet);

const cache = {};

const cacheKeyGenerator = (prefix, ...args) => `${prefix}-${args.join('-')}`;

async function fetchWithCache(prefix, contractFunc, ...args) {
    const cacheKey = cacheKeyGenerator(prefix, ...args);
    if (cache[cacheKey]) {
        console.log(`Cached ${prefix}: `, cache[cacheKey]);
        return cache[cacheKey];
    }

    try {
        const result = await contract[contractFunc](...args);
        console.log(`${prefix}: `, result);
        cache[cacheKey] = result;
        return result;
    } catch (error) {
        console.error(`Failed to retrieve ${prefix}: ${error.message}`);
    }
}

function validateId(id) {
    if (!id) throw new Error("Valid ID is required.");
}

function validateOwnerAddress(owner) {
    if (!ethers.utils.isAddress(owner)) throw new Error("Valid owner address is required.");
}

module.exports = {
    createAsset: async (name, description) => {
        try {
            if (!name || !description) throw new Error("Asset name or description cannot be empty.");
            const tx = await contract.createAsset(name, description);
            await tx.wait();
            console.log(`Asset created: ${name}`);
        } catch (error) {
            console.error(`Failed to create asset: ${error.message}`);
        }
    },
    initiateAssetTransfer: async (assetId, newOwner) => {
        try {
            validateId(assetId);
            validateOwnerAddress(newOwner);
            const tx = await contract.initiateAssetTransfer(assetId, newOwner);
            await tx.wait();
            console.log(`Transfer initiated for asset ID ${assetId} to ${newOwner}`);
        } catch (error) {
            console.error(`Failed to initiate asset transfer: ${error.message}`);
        }
    },
};