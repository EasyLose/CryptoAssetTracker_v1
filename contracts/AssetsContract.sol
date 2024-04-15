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

    error AssetDoesNotExist();
    error NotAssetOwner();
    error NotAuthorized();
    error NoPendingTransfer(address to);

    event AssetRegistered(uint32 assetId, address owner, string name, string description);
    event AssetTransferred(uint32 assetId, address from, address to);
    event AssetRemoved(uint32 assetId);
    event AuthorizationChanged(address account, bool isAuthorized);
    event TransferInitiated(uint32 assetId, address from, address to);
    event TransferAccepted(uint32 assetId, address to);

    modifier onlyOwner(uint32 assetId) {
        if (!assets[assetId].exists) revert AssetDoesNotExist();
        if (assets[assetId].owner != msg.sender) revert NotAssetOwner();
        _;
    }
    
    modifier onlyAuthorized() {
        if (!authorizedAccounts[msg.sender]) revert NotAuthorized();
        _;
    }

    modifier onlyPendingTransfer(uint32 _assetId, address _to) {
        if (pendingTransfers[_assetId] != _to) revert NoPendingTransfer(_to);
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
    }

    function removeAsset(uint32 _assetId) public onlyOwner(_assetId) {
        delete assets[_assetId];
        emit AssetRemoved(_assetId);
    }

    function getAsset(uint32 _assetId) public view returns (Asset memory) {
        if (!assets[_assetId].exists) revert AssetDoesNotExist();
        return assets[_assetId];
    }

    function getAssetHistory(uint32 _assetId) public view returns (address[] memory) {
        if (!assets[_assetId].exists) revert AssetDoesNotExist();
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