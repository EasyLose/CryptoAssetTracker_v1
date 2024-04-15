const DigitalAssetTracker = artifacts.require("DigitalAssetTracker");

contract("DigitalAssetTracker", accounts => {
    const [deployer, user1, user2] = accounts;

    before(async () => {
        this.assetTracker = await DigitalAssetTracker.deployed();
    });

    it("Should allow authorized accounts to register an asset", async () => {
        await this.assetTracker.setAuthorization(user1, true, { from: deployer });
        const tx = await this.assetTracker.registerAsset("Asset1", "Description1", { from: user1 });
        assert.equal(tx.logs[0].event, "AssetRegistered", "Asset should be registered");
    });

    it("Should not allow unauthorized accounts to register an asset", async () => {
        try {
            await this.assetTracker.registerAsset("Asset2", "Description2", { from: user2 });
            assert.fail("Unauthorized account was able to register an asset");
        } catch (error) {
            assert(error.message.indexOf('revert') >= 0, "Error message must contain 'revert'");
        }
    });

    it("Should allow asset owner to initiate transfer", async () => {
        await this.assetTracker.registerAsset("Asset3", "Description3", { from: user1 });
        const tx = await this.assetTracker.transferAsset(1, user2, { from: user1 });
        assert.equal(tx.logs[0].event, "TransferInitiated", "Asset transfer should be initiated");
    });

    it("Should not allow non-owner to transfer asset", async () => {
        try {
            await this.assetTracker.transferAsset(1, user2, { from: user2 });
            assert.fail("Non-owner was able to initiate asset transfer");
        } catch (error) {
            assert(error.message.indexOf('revert') >= 0, "Error message must contain 'revert'");
        }
    });

    it("Allows asset transfer completion by the new owner", async () => {
        await this.assetTracker.acceptTransfer(1, { from: user2 });
        const asset = await this.assetTracker.getAsset(1);
        assert.equal(asset.owner, user2, "Asset ownership was not transferred correctly");
    });

    it("Should not allow unauthorized accounts to remove an asset", async () => {
        try {
            await this.assetTracker.removeAsset(1, { from: deployer });
            assert.fail("Non-owner was able to remove asset");
        } catch (error) {
            assert(error.message.indexOf('revert') >= 0, "Error message must contain 'revert'");
        }
    });

    it("Allows asset owner to remove the asset", async () => {
        const tx = await this.assetTracker.removeAsset(1, { from: user2 });
        assert.equal(tx.logs[0].event, "AssetRemoved", "Asset removal should be logged");
    });

    it("Restricts unauthorized access for setting authorization", async () => {
        try {
            await this.assetTracker.setAuthorization(user2, true, { from: user1 });
            assert.fail("Unauthorized account was able to set authorization");
        } catch (error) {
            assert(error.message.indexOf('revert') >= 0, "Authorization change should revert for unauthorized account");
        }
    });
});