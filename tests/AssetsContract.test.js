const AssetLedger = artifacts.require("AssetLedger");

contract("AssetLedger", accounts => {
    const [admin, participantA, participantB] = accounts;

    before(async () => {
        this.ledger = await AssetLedger.deployed();
    });

    it("Allows authorized users to register a new asset", async () => {
        await this.ledger.authorizeUser(participantA, true, { from: admin });
        const transaction = await this.ledger.registerNewAsset("Asset1", "Description1", { from: participantA });
        assert.equal(transaction.logs[0].event, "AssetRegistered", "The asset should be registered successfully");
    });

    it("Prevents unauthorized users from registering a new asset", async () => {
        try {
            await this.ledger.registerNewAsset("Asset2", "Description2", { from: participantB });
            assert.fail("An unauthorized user was able to register a new asset");
        } catch (error) {
            assert.include(error.message, 'revert', "The error message should indicate a 'revert' due to unauthorized access");
        }
    });

    it("Enables the asset owner to initiate an asset transfer", async () => {
        await this.ledger.registerNewAsset("Asset3", "Description3", { from: participantA });
        const transaction = await this.ledger.initiateTransfer(1, participantB, { from: participantA });
        assert.equal(transaction.logs[0].event, "TransferInitiated", "The transfer initiation should be recorded");
    });

    it("Blocks non-owners from initiating an asset transfer", async () => {
        try {
            await this.ledger.initiateTransfer(1, participantB, { from: participantB });
            assert.fail("A non-owner was able to initiate an asset transfer");
        } catch (error) {
            assert.include(error.message, 'revert', "The error message should indicate a 'revert' due to non-ownership");
        }
    });

    it("Allows the recipient to complete the asset transfer", async () => {
        await this.ledger.completeTransfer(1, { from: participantB });
        const assetDetails = await this.ledger.retrieveAssetDetails(1);
        assert.equal(assetDetails.owner, participantB, "The asset ownership was not transferred correctly");
    });

    it("Restricts asset removal to unauthorized users", async () => {
        try {
            await this.ledger.removeAsset(1, { from: admin });
            assert.fail("An unauthorized user was able to remove the asset");
        } catch (error) {
            assert.include(error.message, 'revert', "The error message should indicate a 'revert' due to unauthorized access");
        }
    });

    it("Permits the asset owner to remove the asset", async () => {
        const transaction = await this.ledger.removeAsset(1, { from: participantB });
        assert.equal(transaction.logs[0].event, "AssetRemoved", "The asset removal should be recorded in the event log");
    });

    it("Prohibits unauthorized users from altering authorization settings", async () => {
        try {
            await this.ledger.authorizeUser(participantB, true, { from: participantA });
            assert.fail("An unauthorized user was able to modify authorization settings");
        } catch (error) {
            assert.include(error.message, 'revert', "The modification should revert due to the user being unauthorized");
        }
    });
});