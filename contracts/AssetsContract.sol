// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract DigitalAssetTracker {
    struct Asset {
        uint id;
        address owner;
        string name;
        string description;
        bool exists;
    }
    uint private nextAssetId;
    mapping(uint => Asset) public assets;
    mapping(uint => address[]) public assetHistory;
    mapping(address => uint[]) public ownerAssets;
    mapping(address => bool) public authorizedAccounts;
    mapping(uint => address) public pendingTransfers;

    event AssetRegistered(uint assetId, address owner, string name, string description);
    event AssetTransferred(uint assetId, address from, address to);
    event AssetRemoved(uint assetId);
    event AuthorizationChanged(address account, bool isAuthorized);
    event TransferInitiated(uint assetId, address from, address to);
    event TransferAccepted(uint assetId, address to);

    modifier onlyOwner(uint assetId) {
        require(assets[assetId].exists, "Asset does not exist.");
        require(assets[assetId].owner == msg.sender, "Not the asset owner.");
        _;
    }
    
    modifier onlyAuthorized() {
        require(authorizedAccounts[msg.sender], "Not authorized.");
        _;
    }

    modifier onlyPendingTransfer(uint _assetId, address _to) {
        require(pendingTransfers[_assetId] == _to, "No pending transfer to this address for this asset.");
        _;
    }

    constructor() {
        authorizedAccounts[msg.sender] = true;
        emit AuthorizationChanged(msg.sender, true);
    }

    function registerAsset(string memory _name, string memory _description) public onlyAuthorized {
        assets[nextAssetId] = Asset(nextAssetId, msg.sender, _name, _description, true);
        assetHistory[nextAssetId].push(msg.sender);
        ownerAssets[msg.sender].push(nextAssetId);
        emit AssetRegistered(nextAssetId, msg.sender, _name, _description);
        nextAssetId++;
    }

    function transferAsset(uint _assetId, address _newOwner) public onlyOwner(_assetId) {
        pendingTransfers[_assetId] = _newOwner;
        emit TransferInitiated(_assetId, msg.sender, _newOwner);
    }

    function acceptTransfer(uint _assetId) public onlyPendingTransfer(_assetId, msg.sender) {
        address oldOwner = assets[_assetId].owner;
        assets[_assetId].owner = msg.sender;
        assetHistory[_assetId].push(msg.sender);
        ownerAssets[msg.sender].push(_assetId);
        delete pendingTransfers[_assetId];
        emit AssetTransferred(_assetId, oldOwner, msg.sender);
    }

    function removeAsset(uint _assetId) public onlyOwner(_assetId) {
        delete assets[_assetId];
        delete ownerAssets[msg.sender][_assetId];
        // Optionally clear history or keep it for record purposes
        // delete assetHistory[_assetId];
        emit AssetRemoved(_assetId);
    }

    function getAsset(uint _assetId) public view returns (Asset memory) {
        require(assets[_assetId].exists, "Asset does not exist.");
        return assets[_assetId];
    }

    function getAssetHistory(uint _assetId) public view returns (address[] memory) {
        require(assets[_assetId].exists, "Asset does not exist.");
        return assetHistory[_assetId];
    }

    function getOwnerAssets(address _owner) public view returns (uint[] memory) {
        return ownerAssets[_owner];
    }

    function setAuthorization(address _account, bool _isAuthorized) public onlyAuthorized {
        authorizedAccounts[_account] = _isAuthorized;
        emit AuthorizationChanged(_account, _isAuthorized);
    }
}