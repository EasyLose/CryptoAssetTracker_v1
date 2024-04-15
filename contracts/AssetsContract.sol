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

    event AssetRegistered(uint assetId, address owner, string name, string description);
    event AssetTransferred(uint assetId, address from, address to);
    event AuthorizationChanged(address account, bool isAuthorized);

    modifier onlyOwner(uint assetId) {
        require(assets[assetId].exists, "Asset does not exist.");
        require(assets[assetId].owner == msg.sender, "Not the asset owner.");
        _;
    }
    
    modifier onlyAuthorized() {
        require(authorizedAccounts[msg.sender], "Not authorized.");
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
        assets[_assetId].owner = _newOwner;
        assetHistory[_assetId].push(_newOwner);
        ownerAssets[_newOwner].push(_assetId);
        emit AssetTransferred(_assetId, msg.sender, _newOwner);
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