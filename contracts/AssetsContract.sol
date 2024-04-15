// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract DigitalAssetTracker {
    struct Asset {
        uint32 id;
        address owner;
        string name;
        string description;
        bool exists;
    }
    uint32 private nextAssetId = 1;
    mapping(uint32 => Asset) public assets;
    mapping(uint32 => address[]) public assetHistory;
    mapping(address => uint32[]) public ownerAssets;
    mapping(address => bool) public authorizedAccounts;
    mapping(uint32 => address) public pendingTransfers;

    event AssetRegistered(uint32 assetId, address owner, string name, string description);
    event AssetTransferred(uint32 assetId, address from, address to);
    event AssetRemoved(uint32 assetId);
    event AuthorizationChanged(address account, bool isAuthorized);
    event TransferInitiated(uint32 assetId, address from, address to);
    event TransferAccepted(uint32 assetId, address to);

    modifier onlyOwner(uint32 assetId) {
        require(assets[assetId].exists, "Asset does not exist.");
        require(assets[assetId].owner == msg.sender, "Not the asset owner.");
        _;
    }
    
    modifier onlyAuthorized() {
        require(authorizedAccounts[msg.sender], "Not authorized.");
        _;
    }

    modifier onlyPendingTransfer(uint32 _assetId, address _to) {
        require(pendingTransfers[_assetId] == _to, "No pending transfer to this address for this asset.");
        _;
    }

    constructor() {
        authorizedAccounts[msg.sender] = true;
        emit AuthorizationChanged(msg.sender, true);
    }

    function registerAsset(string memory _name, string memory _description) public onlyAuthorized {
        uint32 assetId = nextAssetId++;
        assets[assetId] = Asset(assetId, msg.sender, _name, _description, true);
        assetHistory[assetId].push(msg.sender);
        ownerAssets[msg.sender].push(assetId);
        emit AssetRegistered(assetId, msg.sender, _name, _description);
    }

    function transferAsset(uint32 _assetId, address _newOwner) public onlyOwner(_assetId) {
        pendingTransfers[_assetId] = _newOwner;
        emit TransferInitiated(_assetId, msg.sender, _newOwner);
    }

    function acceptTransfer(uint32 _assetId) public onlyPendingTransfer(_assetId, msg.sender) {
        address oldOwner = assets[_assetId].owner;
        assets[_assetId].owner = msg.sender;
        assetHistory[_assetId].push(msg.sender);
        ownerAssets[msg.sender].push(_assetId);
        delete pendingTransfers[_assetId];
        emit AssetTransferred(_assetId, oldOwner, msg.sender);
        // Removing an asset from the previous owner's array is not handled here.
    }

    function removeAsset(uint32 _assetId) public onlyOwner(_assetId) {
        delete assets[_assetId];
        // Direct deletion in an array of `ownerAssets[msg.sender][_assetId]` is not possible; needs complex logic to manage.
        emit AssetRemoved(_assetId);
    }

    function getAsset(uint32 _assetId) public view returns (Asset memory) {
        require(assets[_assetId].exists, "Asset does not exist.");
        return assets[_assetId];
    }

    function getAssetHistory(uint32 _assetId) public view returns (address[] memory) {
        require(assets[_assetId].exists, "Asset does not exist.");
        return assetHistory[_assetId];
    }

    function getOwnerAssets(address _owner) public view returns (uint32[] memory) {
        return ownerAssets[_owner];
    }

    function setAuthorization(address _account, bool _isAuthorized) public onlyAuthorized {
        authorizedAccounts[_account] = _isAuthorized;
        emit AuthorizationChanged(_account, _isAuthorized);
    }
}