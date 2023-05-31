// SPDX-License-Identifier: MIT
pragma solidity 0.6.12;

interface IToken {
    function totalSupply() external view returns (uint256);
    function balanceOf(address account) external view returns (uint256);
    function transfer(address recipient, uint256 amount) external returns (bool);
    function allowance(address owner, address spender) external view returns (uint256);
    function approve(address spender, uint256 amount) external returns (bool);
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
    function decimals() external view returns (uint8);
}

library MerkleProof {
    function verify(
        bytes32[] memory proof,
        bytes32 root,
        bytes32 leaf
    ) internal pure returns (bool) {
        return processProof(proof, leaf) == root;
    }

    function verifyCalldata(
        bytes32[] calldata proof,
        bytes32 root,
        bytes32 leaf
    ) internal pure returns (bool) {
        return processProofCalldata(proof, leaf) == root;
    }

    function processProof(bytes32[] memory proof, bytes32 leaf) internal pure returns (bytes32) {
        bytes32 computedHash = leaf;
        for (uint256 i = 0; i < proof.length; i++) {
            computedHash = _hashPair(computedHash, proof[i]);
        }
        return computedHash;
    }

    function processProofCalldata(bytes32[] calldata proof, bytes32 leaf) internal pure returns (bytes32) {
        bytes32 computedHash = leaf;
        for (uint256 i = 0; i < proof.length; i++) {
            computedHash = _hashPair(computedHash, proof[i]);
        }
        return computedHash;
    }

    function multiProofVerify(
        bytes32[] memory proof,
        bool[] memory proofFlags,
        bytes32 root,
        bytes32[] memory leaves
    ) internal pure returns (bool) {
        return processMultiProof(proof, proofFlags, leaves) == root;
    }

    function multiProofVerifyCalldata(
        bytes32[] calldata proof,
        bool[] calldata proofFlags,
        bytes32 root,
        bytes32[] memory leaves
    ) internal pure returns (bool) {
        return processMultiProofCalldata(proof, proofFlags, leaves) == root;
    }

    function processMultiProof(
        bytes32[] memory proof,
        bool[] memory proofFlags,
        bytes32[] memory leaves
    ) internal pure returns (bytes32 merkleRoot) {
        // This function rebuild the root hash by traversing the tree up from the leaves. The root is rebuilt by
        // consuming and producing values on a queue. The queue starts with the `leaves` array, then goes onto the
        // `hashes` array. At the end of the process, the last hash in the `hashes` array should contain the root of
        // the merkle tree.
        uint256 leavesLen = leaves.length;
        uint256 totalHashes = proofFlags.length;

        // Check proof validity.
        require(leavesLen + proof.length - 1 == totalHashes, "MerkleProof: invalid multiproof");

        // The xxxPos values are "pointers" to the next value to consume in each array. All accesses are done using
        // `xxx[xxxPos++]`, which return the current value and increment the pointer, thus mimicking a queue's "pop".
        bytes32[] memory hashes = new bytes32[](totalHashes);
        uint256 leafPos = 0;
        uint256 hashPos = 0;
        uint256 proofPos = 0;
        // At each step, we compute the next hash using two values:
        // - a value from the "main queue". If not all leaves have been consumed, we get the next leaf, otherwise we
        //   get the next hash.
        // - depending on the flag, either another value for the "main queue" (merging branches) or an element from the
        //   `proof` array.
        for (uint256 i = 0; i < totalHashes; i++) {
            bytes32 a = leafPos < leavesLen ? leaves[leafPos++] : hashes[hashPos++];
            bytes32 b = proofFlags[i] ? leafPos < leavesLen ? leaves[leafPos++] : hashes[hashPos++] : proof[proofPos++];
            hashes[i] = _hashPair(a, b);
        }

        if (totalHashes > 0) {
            return hashes[totalHashes - 1];
        } else if (leavesLen > 0) {
            return leaves[0];
        } else {
            return proof[0];
        }
    }

    function processMultiProofCalldata(
        bytes32[] calldata proof,
        bool[] calldata proofFlags,
        bytes32[] memory leaves
    ) internal pure returns (bytes32 merkleRoot) {
        // This function rebuild the root hash by traversing the tree up from the leaves. The root is rebuilt by
        // consuming and producing values on a queue. The queue starts with the `leaves` array, then goes onto the
        // `hashes` array. At the end of the process, the last hash in the `hashes` array should contain the root of
        // the merkle tree.
        uint256 leavesLen = leaves.length;
        uint256 totalHashes = proofFlags.length;

        // Check proof validity.
        require(leavesLen + proof.length - 1 == totalHashes, "MerkleProof: invalid multiproof");

        // The xxxPos values are "pointers" to the next value to consume in each array. All accesses are done using
        // `xxx[xxxPos++]`, which return the current value and increment the pointer, thus mimicking a queue's "pop".
        bytes32[] memory hashes = new bytes32[](totalHashes);
        uint256 leafPos = 0;
        uint256 hashPos = 0;
        uint256 proofPos = 0;
        // At each step, we compute the next hash using two values:
        // - a value from the "main queue". If not all leaves have been consumed, we get the next leaf, otherwise we
        //   get the next hash.
        // - depending on the flag, either another value for the "main queue" (merging branches) or an element from the
        //   `proof` array.
        for (uint256 i = 0; i < totalHashes; i++) {
            bytes32 a = leafPos < leavesLen ? leaves[leafPos++] : hashes[hashPos++];
            bytes32 b = proofFlags[i] ? leafPos < leavesLen ? leaves[leafPos++] : hashes[hashPos++] : proof[proofPos++];
            hashes[i] = _hashPair(a, b);
        }

        if (totalHashes > 0) {
            return hashes[totalHashes - 1];
        } else if (leavesLen > 0) {
            return leaves[0];
        } else {
            return proof[0];
        }
    }

    function _hashPair(bytes32 a, bytes32 b) private pure returns (bytes32) {
        return a < b ? _efficientHash(a, b) : _efficientHash(b, a);
    }

    function _efficientHash(bytes32 a, bytes32 b) private pure returns (bytes32 value) {
        /// @solidity memory-safe-assembly
        assembly {
            mstore(0x00, a)
            mstore(0x20, b)
            value := keccak256(0x00, 0x40)
        }
    }
}

contract Presale {
    address public targetToken;
    address public contributeCoin;

    uint256 private constant RESOLUTION_CV_RATIO = 10 ** 9;
    uint256 public salePrice;

    mapping (address => uint256) public targetTokenRequested;
    mapping (address => uint256) public targetTokenClaimed;
    mapping (address => uint256) public coinContributed;
    uint256 public totalTargetTokenRequested;
    uint256 public totalCoinContributed;

    uint256 public minPerWallet;
    uint256 public maxPerWallet;

    uint256 public totalTargetCap;

    uint256 public startTimestamp;
    uint256 public endTimestamp;

    bytes32 public merkleRoot;
    uint256 public saleType;

    address public owner;
    bool private initialized;

    event TransferOwnership(address _oldOwner, address _newOwner);
    event Requested(address user, uint256 deposit, uint256 coin);
    event Gifted(address user, uint256 amount);
    event Refunded(address user, uint256 amount, uint256 coin);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    modifier isWhitelistMode() {
        require(saleType == 0, "Sale type is not set to WHITELIST");
        _;
    }

    modifier isPublicMode() {
        require(saleType == 1, "Sale type is not set to PUBLIC_SALE");
        _;
    }

    modifier isWhitelisted(bytes32[] calldata merkleProof) {
        require(checkWhitelisted(merkleProof, merkleRoot, msg.sender), "Not whitelisted account");
        _;
    }

    modifier underWay() {
        require(block.timestamp >= startTimestamp, "Presale not started");
        require(block.timestamp <= endTimestamp, "Presale ended");
        _;
    }

    modifier whenExpired() {
        require(block.timestamp > endTimestamp, "Presale not ended");
        _;
    }

    function initialize(address _targetToken, address _coinToken) external {
        require (!initialized, "Already initialized");
        initialized = true;

        owner = msg.sender;
        emit TransferOwnership(address(0), owner);

        targetToken = _targetToken;
        contributeCoin = _coinToken;

        salePrice = RESOLUTION_CV_RATIO; // 1 $CRUST = 1 $CORE
        minPerWallet = 10 * (10 ** 18); // 10 $CRUST per wallet at minimum
        maxPerWallet = 500 * (10 ** 18); // 500 $CRUST per wallet at maximum

        totalTargetCap = 150_000 * (10 ** 18); // 150k $CRUST at maximum
        saleType = 0; // 0: whitelist, 1: public sale
    }

    function transferOwnership(address _newOwner) external onlyOwner {
        require(_newOwner != address(0), "Zero address");
        emit TransferOwnership(owner, _newOwner);
        owner = _newOwner;
    }

    function renounceOwnership() external onlyOwner {
        emit TransferOwnership(owner, address(0));
        owner = address(0);
    }

    function launchPresale(uint256 _secAfter, uint256 _secDuration) external onlyOwner {
        startTimestamp = block.timestamp + _secAfter;
        endTimestamp = block.timestamp + _secAfter + _secDuration;
    }

    function expandPresale(uint256 _secDuration) external onlyOwner underWay {
        endTimestamp = block.timestamp + _secDuration;
    }

    function updateVTokenPrice(uint256 _newSalePriceInResolution9) external onlyOwner {
        require(salePrice != _newSalePriceInResolution9, "Already set");
        salePrice = _newSalePriceInResolution9;
    }

    function updateMinMaxTokenPerWallet(uint256 _minAmount, uint256 _maxAmount) external onlyOwner {
        minPerWallet = _minAmount;
        maxPerWallet = _maxAmount;
    }

    function setTotalCap(uint256 _totalAmount) external onlyOwner {
        totalTargetCap = _totalAmount;
    }

    function updateSaleType(uint256 _saleType) external onlyOwner {
        require(saleType != _saleType, "Already set");
        require(saleType == 0 || saleType == 1, "Unknown sale type");
        saleType = _saleType;
    }

    function udpateMerkleRoot(bytes32 _merkelRoot) external onlyOwner {
        merkleRoot = _merkelRoot;
    }

    function updateTokens(address _targetToken, address _coinToken) external onlyOwner {
        require(totalTargetTokenRequested == 0, "Unable to update token addresses");
        targetToken = _targetToken;
        contributeCoin = _coinToken;
    }

    function convertC2V(uint256 _cAmount) internal view returns (uint256) {
        uint256 cDecimal = 18;
        if (contributeCoin != address(0)) {
            cDecimal = IToken(contributeCoin).decimals();
        }
        uint256 vDecimal = IToken(targetToken).decimals();
        return _cAmount * RESOLUTION_CV_RATIO * (10 ** vDecimal) / (salePrice * (10 ** cDecimal));
    }

    function convertV2C(uint256 _vAmount) internal view returns (uint256) {
        uint256 cDecimal = 18;
        if (contributeCoin != address(0)) {
            cDecimal = IToken(contributeCoin).decimals();
        }

        uint256 vDecimal = IToken(targetToken).decimals();
        return _vAmount * salePrice * (10 ** cDecimal) / (RESOLUTION_CV_RATIO * (10 ** vDecimal));
    }

    function sellVToken(address _to, uint256 _coinAmount) internal returns (uint256, uint256) {
        uint256 cReceived;
        if (contributeCoin == address(0)) {
            cReceived = msg.value;
        } else {
            address feeRx = address(this);
            uint256 _oldCBalance = IToken(contributeCoin).balanceOf(feeRx);
            IToken(contributeCoin).transferFrom(_to, feeRx, _coinAmount);
            uint256 _newCBalance = IToken(contributeCoin).balanceOf(feeRx);

            cReceived = _newCBalance - _oldCBalance;
        }

        uint256 targetAmount = convertC2V(cReceived);

        require(targetTokenRequested[_to] + targetAmount <= maxPerWallet, "Too much requested");
        require(targetTokenRequested[_to] + targetAmount >= minPerWallet, "Too small requested");

        totalTargetTokenRequested += targetAmount;
        totalCoinContributed += cReceived;

        targetTokenRequested[_to] += targetAmount;
        coinContributed[_to] += cReceived;

        return (targetAmount, cReceived);
    }

    function giftVToken(address _to, uint256 _vAmount) internal returns (uint256) {
        uint256 targetAmount = _vAmount;

        totalTargetTokenRequested += targetAmount;
        targetTokenRequested[_to] += targetAmount;

        return targetAmount;
    }

    function refundVToken(address to) internal returns (uint256, uint256) {
        uint256 targetAmount = targetTokenRequested[to];
        uint256 coinAmount = coinContributed[to];

        totalTargetTokenRequested -= targetTokenRequested[to];
        targetTokenRequested[to] = 0;
        coinContributed[to] = 0;

        if (coinAmount > 0) {
            payCoin(to, coinAmount);
        }

        return (targetAmount, coinAmount);
    }

    function sellWhitelist(bytes32[] calldata merkleProof, uint256 _coinAmount) external payable
        isWhitelistMode isWhitelisted(merkleProof) underWay
    {
        (uint256 target, uint256 coin) = sellVToken(msg.sender, _coinAmount);
        emit Requested(msg.sender, target, coin);
    }

    function sellPublic(uint256 _coinAmount) external payable
        isPublicMode underWay
    {
        (uint256 target, uint256 coin) = sellVToken(msg.sender, _coinAmount);
        emit Requested(msg.sender, target, coin);
    }

    function gift(address _to, uint256 _vAmount) external 
        onlyOwner underWay
    {
        uint256 amount = giftVToken(_to, _vAmount);
        emit Gifted(_to, amount);
    }

    function forceRefund(address _user) external payable
        onlyOwner
    {
        (uint256 target, uint256 coin) = refundVToken(_user);
        emit Refunded(_user, target, coin);
    }

    function checkWhitelisted(bytes32[] calldata _merkleProof, bytes32 _merkleRoot, address _user) public pure returns (bool) {
        bytes32 leaf = keccak256(abi.encodePacked(_user));
        return MerkleProof.verify(_merkleProof, _merkleRoot, leaf);
    }

    function recoverCoin(address _to, uint256 _amount) external payable onlyOwner {
        if (_amount == 0) {
            if (contributeCoin == address(0)) {
                _amount = address(this).balance;
            } else {
                _amount = IToken(contributeCoin).balanceOf(address(this));
            }
        }

        payCoin(_to, _amount);
    }

    function payCoin(address _to, uint256 _amount) internal {
        if (contributeCoin == address(0)) {
            (bool success,) = payable(_to).call{value: _amount}("");
            require(success, "Failed to recover");
        } else {
            IToken(contributeCoin).transfer(_to, _amount);
        }
    }

    function claim(uint256 _amount) external payable whenExpired {
        address user = msg.sender;
        uint256 claimableAmount = getClaimableAmount(user);
        require(_amount <= claimableAmount, "Claiming too much");

        if (totalTargetCap < totalTargetTokenRequested) { // overflown
            uint256 _targetTokenAmount = _amount * totalTargetCap / totalTargetTokenRequested;
            IToken(targetToken).transfer(user, _targetTokenAmount);

            uint256 _totalCoinOverflownAmount = convertV2C(totalTargetTokenRequested - totalTargetCap);
            payCoin(user, _totalCoinOverflownAmount * _amount / totalTargetTokenRequested);
        } else {
            IToken(targetToken).transfer(user, _amount);
        }

        targetTokenClaimed[user] += _amount;

        require(targetTokenClaimed[user] <= targetTokenRequested[user], "Claimed too much");
    }

    function getClaimableAmount(address user) public view returns (uint256) {
        uint256 requestedAmount = targetTokenRequested[user];
        uint256 claimedAmount = targetTokenClaimed[user];

        uint256 ret;
        if (block.timestamp < endTimestamp) {
            ret = 0;
        } else if (block.timestamp < endTimestamp + (30 days)) {
            ret = ((requestedAmount * 80) / 100) - claimedAmount;
        } else if (block.timestamp < endTimestamp + (60 days)) {
            ret = ((requestedAmount * 90) / 100) - claimedAmount;
        } else {
            ret = requestedAmount - claimedAmount;
        }

        return ret;
    }

    receive() external payable {}
}
