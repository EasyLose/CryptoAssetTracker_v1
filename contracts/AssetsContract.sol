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
    mapping(uint32 => Asset) public assetsById;
    mapping(uint32 => address[]) public assetOwnershipHistory;
    mapping(address => uint32[]) public assetsOwnedByAddress;
    mapping(address => bool) public isAccountAuthorized;
    mapping(uint32 => address) public awaitingTransferApproval;

    error AssetNotFound();
    error UnauthorizedAccess();
    error AssetOwnershipMismatch();
    error TransferNotInitiated(address recipient);

    event AssetCreated(uint32 assetId, address owner, string name, string description);
    event AssetOwnershipTransferred(uint32 assetId, address from, address to);
    event AssetDeleted(uint32 assetId);
    event AuthorizationStatusChanged(address account, bool isAuthorized);
    event TransferRequestStarted(uint32 assetId, address from, address to);
    event TransferApprovalGranted(uint32 assetId, address to);

    modifier assetExists(uint32 assetId) {
        if (!assetsById[assetId].exists) revert AssetNotFound();
        _;
    }
    
    modifier onlyAssetOwner(uint32 assetId) {
        if (assetsById[assetId].owner != msg.sender) revert AssetOwnershipMismatch();
        _;
    }
    
    modifier onlyAuthorizedAccount() {
        if (!isAccountAuthorized[msg.sender]) revert UnauthorizedAccess();
        _;
    }

    modifier pendingTransferApproval(uint32 assetId, address to) {
        if (awaitingTransferApproval[assetId] != to) revert TransferNotInitiated(to);
        _;
    }

    constructor() {
        isAccountAuthorized[msg.sender] = true;
        emit AuthorizationStatusChanged(msg.sender, true);
    }

    function createAsset(string memory name, string memory description) public onlyAuthorizedAccount {
        uint32 assetId = nextAssetId++;
        assetsById[assetId] = Asset(assetId, msg.sender, name, description, true);
        assetOwnershipHistory[assetId].push(msg.sender);
        assetsOwnedByAddress[msg.sender].push(assetId);
        emit AssetCreated(assetId, msg.sender, name, description);
    }

    function initiateAssetTransfer(uint32 assetId, address newOwner) public assetExists(assetId) onlyAssetOwner(assetId) {
        awaitingTransferApproval[assetId] = newOwner;
        emit TransferRequestStarted(assetId, msg.sender, newOwner);
    }

    function approveAssetTransfer(uint32 assetId) public pendingTransferApproval(assetId, msg.sender) {
        address originalOwner = assetsById[assetId].owner;
        assetsById[assetId].owner = msg.sender;
        assetOwnershipHistory[assetId].push(msg.sender);
        assetsOwnedByAddress[msg.sender].push(assetId);
        delete awaitingTransferApproval[assetId];
        emit AssetOwnershipTransferred(assetId, originalOwner, msg.sender);
    }

    function deleteAsset(uint32 assetId) public onlyAssetOwner(assetId) assetExists(assetId) {
        delete assetsById[assetId];
        emit AssetDeleted(assetId);
    }

    function retrieveAssetDetails(uint32 assetId) public view assetExists(assetId) returns (Asset memory) {
        return assetsById[assetId];
    }

    function retrieveAssetHistory(uint32 assetId) public view assetExists(assetId) returns (address[] memory) {
        return assetOwnershipHistory[assetId];
    }

    function listAssetsOwned(address owner) public view returns (uint32[] memory) {
        return assetsOwnedByAddress[owner];
    }

    function adjustAuthorizationStatus(address account, bool newStatus) public onlyAuthorizedAccount {
        isAccountAuthorized[account] = newStatus;
        emit AuthorizationStatusChanged(account, newStatus);
    }
}