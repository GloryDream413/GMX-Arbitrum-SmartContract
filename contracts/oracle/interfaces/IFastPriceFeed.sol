// SPDX-License-Identifier: MIT

pragma solidity 0.6.12;

interface IFastPriceFeed {
    function lastUpdatedAt() external view returns (uint256);
    function lastUpdatedBlock() external view returns (uint256);
    function setSigner(address _account, bool _isActive) external;
    function setUpdater(address _account, bool _isActive) external;
    function setPriceDuration(uint256 _priceDuration) external;
    function setMaxPriceUpdateDelay(uint256 _maxPriceUpdateDelay) external;
    function setSpreadBasisPointsIfInactive(uint256 _spreadBasisPointsIfInactive) external;
    function setSpreadBasisPointsIfChainError(uint256 _spreadBasisPointsIfChainError) external;
    function setMinBlockInterval(uint256 _minBlockInterval) external;
    function setIsSpreadEnabled(bool _isSpreadEnabled) external;
    function setMaxDeviationBasisPoints(uint256 _maxDeviationBasisPoints) external;
    function setMaxCumulativeDeltaDiffs(address[] memory _tokens,  uint256[] memory _maxCumulativeDeltaDiffs) external;
    function setPriceDataInterval(uint256 _priceDataInterval) external;
    function setVaultPriceFeed(address _vaultPriceFeed) external;
}
