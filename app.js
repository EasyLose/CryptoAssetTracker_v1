let cryptoAssetPortfolio = [
    { id: "btc", name: "Bitcoin", priceUSD: 20000 },
    { id: "eth", name: "Ethereum", priceUSD: 1500 },
    { id: "ltc", name: "Litecoin", priceUSD: 100 },
];

function getCryptoAssetById(assetId) {
    return cryptoAssetPortfolio.find(asset => asset.id === assetId);
}

function displayCryptoAssetPrice(assetId) {
    const cryptoAsset = getCryptoAssetById(assetId);
    if (cryptoAsset) {
        console.log(`The price of ${cryptoAsset.name} is $${cryptoAsset.priceUSD}.`);
    } else {
        console.log("Cryptocurrency not found.");
    }
}

function updateCryptoAssetPrice(assetId, updatedPrice) {
    const cryptoAsset = getCryptoAssetById(assetId);
    if (cryptoAsset) {
        cryptoAsset.priceUSD = updatedPrice;
        console.log(`${cryptoAsset.name}'s price has been updated to $${updatedPrice}.`);
    } else {
        console.log("Failed to update price. Cryptocurrency not found.");
    }
}

function addCryptoAssetToPortfolio(assetId, assetName, assetPrice) {
    const assetExists = cryptoAssetPortfolio.some(asset => asset.id === assetId);
    if (!assetExists) {
        cryptoAssetPortfolio.push({ id: assetId, name: assetName, priceUSD: assetPrice });
        console.log(`${assetName} has been added to the tracker.`);
    } else {
        console.log("This cryptocurrency is already being tracked.");
    }
}

// Example usage
displayCryptoAssetPrice("btc");
updateCryptoAssetPrice("eth", 1600);
addCryptoAssetToPortfolio("xrp", "Ripple", 0.5);
displayCryptoAssetPrice("xrp");