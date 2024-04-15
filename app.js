let cryptoAssets = [
    { id: "btc", name: "Bitcoin", priceUSD: 20000 },
    { id: "eth", name: "Ethereum", priceUSD: 1500 },
    { id: "ltc", name: "Litecoin", priceUSD: 100 },
];

function getCryptoById(cryptoId) {
    return cryptoAssets.find(asset => asset.id === cryptoId);
}

function displayCryptoPrice(cryptoId) {
    const crypto = getCryptoById(cryptoId);
    if (crypto) {
        console.log(`The price of ${crypto.name} is $${crypto.priceUSD}.`);
    } else {
        console.log("Cryptocurrency not found.");
    }
}

function updateCryptoPrice(cryptoId, newPrice) {
    const crypto = getCryptoById(cryptoId);
    if (crypto) {
        crypto.priceUSD = newPrice;
        console.log(`${crypto.name}'s price has been updated to $${newPrice}.`);
    } else {
        console.log("Failed to update price. Cryptocurrency not found.");
    }
}

function addNewCryptoAsset(cryptoId, cryptoName, cryptoPrice) {
    const exists = cryptoAssets.some(asset => asset.id === cryptoId);
    if (!exists) {
        cryptoAssets.push({ id: cryptoId, name: cryptoName, priceUSD: cryptoPrice });
        console.log(`${cryptoName} has been added to the tracker.`);
    } else {
        console.log("This cryptocurrency is already being tracked.");
    }
}

displayCryptoPrice("btc");
updateCryptoPrice("eth", 1600);
addNewCryptoAsset("xrp", "Ripple", 0.5);
displayCryptoPrice("xrp");