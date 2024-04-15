const ethers = require('ethers');

require('dotenv').config();

const CONTRACT_ADDRESS = 'YOUR_CONTRACT_ADDRESS_HERE';
const CONTRACT_ABI = [
    "function createAsset(string memory name, string memory description) public",
    "function initiateAssetTransfer(uint32 assetId, address newOwner) public",
    "function approveAssetTransfer(uint32 assetId) public",
    "function retrieveAssetDetails(uint32 assetId) public view returns (uint32 id, address owner, string memory name, string memory description, bool exists)",
    "function retrieveAssetHistory(uint32 assetId) public view returns (address[] memory)",
    "function listAssetsOwned(address owner) public view returns (uint32[] memory)"
];

const provider = new ethers.providers.JsonRpcProvider(process.env.INFURA_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, wallet);

// Creating a simple cache object
const cache = {};

async function createAsset(name, description) {
    try {
        const tx = await contract.createAsset(name, description);
        await tx.wait();
        console.log(`Asset created: ${name}`);
    } catch (error) {
        console.error(`Failed to create asset: ${error.message}`);
    }
}

async function initiateAssetTransfer(assetId, newOwner) {
    try {
        const tx = await contract.initiateAssetTransfer(assetId, newOwner);
        await tx.wait();
        console.log(`Transfer initiated for asset ID ${assetId} to ${newOwner}`);
    } catch (error) {
        console.error(`Failed to initiate asset transfer: ${error.message}`);
    }
}

async function approveAssetTransfer(assetId) {
    try {
        const tx = await contract.approveAssetTransfer(assetId);
        await tx.wait();
        console.log(`Transfer approved for asset ID ${assetId}`);
    } catch (error) {
        console.error(`Failed to approve asset transfer: ${error.message}`);
    }
}

async function retrieveAssetDetails(assetId) {
    const cacheKey = `assetDetails-${assetId}`;
    if (cache[cacheKey]) {
        console.log(`Cached asset details: `, cache[cacheKey]);
        return cache[cacheKey];
    }

    try {
        const asset = await contract.retrieveAssetDetails(assetId);
        console.log(`Asset details: `, asset);
        cache[cacheKey] = asset; // Cache the result
    } catch (error) {
        console.error(`Failed to retrieve asset details: ${error.message}`);
    }
}

async function retrieveAssetHistory(assetId) {
    const cacheKey = `assetHistory-${assetId}`;
    if (cache[cacheKey]) {
        console.log(`Cached asset history: `, cache[cacheKey]);
        return cache[cacheKey];
    }

    try {
        const history = await contract.retrieveAssetHistory(assetId);
        console.log(`Asset history: `, history);
        cache[cacheKey] = history; // Cache the result
    } catch (error) {
        console.error(`Failed to retrieve asset history: ${error.message}`);
    }
}

async function listAssetsOwned(owner) {
    const cacheKey = `assetsOwned-${owner}`;
    if (cache[cacheKey]) {
        console.log(`Cached ${owner} owns assets: `, cache[cacheKey]);
        return cache[cacheKey];
    }

    try {
        const assets = await contract.listAssetsOwned(owner);
        console.log(`${owner} owns assets: `, assets);
        cache[cacheKey] = assets; // Cache the result
    } catch (error) {
        console.error(`Failed to list assets owned: ${error.message}`);
    }
}