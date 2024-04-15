const DigitalAssetTracker = artifacts.require("DigitalAssetTracker");

async function getCurrentGasPrice() {
    let gasPrice = await web3.eth.getGasPrice();
    gasPrice = web3.utils.toBN(gasPrice);
    const adjustedGasPrice = gasPrice.mul(web3.utils.toBN(1.1)); // 10% more than the average
    return adjustedGasPrice.toString();
}

module.exports = async function(deployer, network) {
    const gasPrice = await getCurrentGasPrice(); // Fetch current average gas price with a slight increase
    console.log(`Current adjusted gas price for deployment: ${gasPrice}`);

    deployer.deploy(DigitalAssetTracker, {gasPrice: gasPrice}).then(() => {
        let networkMessage = "unknown or unspecified";

        if (network === 'development') {
            networkMessage = "development";
        } else if (network === 'ropsten' || network === 'mainnet') {
            networkMessage = network;
        }

        console.log(`DigitalAssetTracker deployed on ${networkMessage} network with gas price ${gasPrice}`);
    });
};