const DigitalAssetTracker = artifacts.require("DigitalAssetTracker");

module.exports = function(deployer, network) {
    deployer.deploy(DigitalAssetTracker).then(() => {
        let networkMessage = "unknown or unspecified";

        if (network === 'development') {
            networkMessage = "development";
        } else if (network === 'ropsten' || network === 'mainnet') {
            networkMessage = network;
        }

        console.log(`DigitalAssetTracker deployed on ${networkMessage} network`);
    });
};