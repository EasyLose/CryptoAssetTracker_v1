// Define the crypto asset portfolio
const cryptoAssetPortfolio = [
    { id: "btc", name: "Bitcoin", priceUSD: 20000 },
    { id: "eth", name: "Ethereum", priceUSD: 1500 },
    { id: "ltc", name: "Litecoin", priceUSD: 100 },
];

// Function to get a crypto asset by its ID
const getCryptoAssetById = assetId => cryptoAssetPortfolio.find(asset => asset.id === assetId);

// Function to display the price of a crypto asset
const displayCryptoAssetPrice = assetId => {
    const cryptoAsset = getCryptoAssetById(assetId);
    if (cryptoAsset) {
        console.log(`The price of ${cryptoAsset.name} is $${cryptoAsset.priceUSD}.`);
    } else {
        console.log("Cryptocurrency not found.");
    }
};

// Function to update the price of a crypto asset
const updateCryptoAssetPrice = (assetId, updatedPrice) => {
    const cryptoAsset = getCryptoAssetById(assetId);
    if (cryptoAsset) {
        cryptoAsset.priceUSD = updatedPrice;
        console.log(`${cryptoAsset.name}'s price has been updated to $${updatedPrice}.`);
    } else {
        console.log("Failed to update price. Cryptocurrency not found.");
    }
};

// Function to add a new crypto asset to the portfolio
const addCryptoAssetToPortfolio = (assetId, assetName, assetPrice) => {
    const assetExists = cryptoAssetPortfolio.some(asset => asset.id === assetId);
    if (!assetExists) {
        cryptoAssetPortfolio.push({ id: assetId, name: assetName, priceUSD: assetPrice });
        console.log(`${assetName} has been added to the tracker.`);
    } else {
        console.log("This cryptocurrency is already being tracked.");
    }
};

// Example usage
displayCryptoAssetPrice("btc");
updateCryptoAssetPrice("eth", 1600);
addCryptoAssetToPortfolio("xrp", "Ripple", 0.5);
displayCryptoAssetPrice("xrp");