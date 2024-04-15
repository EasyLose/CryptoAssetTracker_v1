const DigitalAssetTracker = artifacts.require("DigitalAssetTracker");

module.exports = function (deployer, network, accounts) {
    if(network === 'development') {
        deployer.deploy(DigitalAssetTracker).then(() => {
            console.log("DigitalAssetTracker deployed on development network");
        });
    } else if(network === 'ropsten' || network === 'mainnet') {
        deployer.deploy(DigitalAssetTracker).then(() => {
            console.log(`DigitalAssetTracker deployed on ${network} network`);
        });
    } else {
        deployer.deploy(DigitalAssetTracker).then(() => {
            console.log(`DigitalAssetTracker deployed on unknown or unspecified network (${network})`);
        });
    }
};