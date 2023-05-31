const { deployContract, contractAt , sendTxn } = require("../shared/helpers")
const { expandDecimals } = require("../../test/shared/utilities")
const { toUsd } = require("../../test/shared/units")
const { errors } = require("../../test/core/Vault/helpers")
const { getNetwork, getDeployFilteredInfo } = require("../shared/syncParams")
const { chainInfo } = require('../networks/chain')

module.exports = async function () {
  const { imple: nativeToken } = getDeployFilteredInfo("WETH")

  await deployContract("Vault", [])

  const vault = await contractAt("Vault", getDeployFilteredInfo("Vault").imple)

  await deployContract("USDG", [vault.address])

  const usdg = await contractAt("USDG", getDeployFilteredInfo("USDG").imple)

  await deployContract("Router", [vault.address, usdg.address, nativeToken])

  const router = await contractAt("Router", getDeployFilteredInfo("Router").imple)

  await deployContract("VaultPriceFeed", [])

  const vaultPriceFeed = await contractAt("VaultPriceFeed", getDeployFilteredInfo("VaultPriceFeed").imple)

  await sendTxn(vaultPriceFeed.setMaxStrictPriceDeviation(expandDecimals(1, 28)), "vaultPriceFeed.setMaxStrictPriceDeviation") // 0.05 USD
  await sendTxn(vaultPriceFeed.setPriceSampleSpace(1), "vaultPriceFeed.setPriceSampleSpace")
  await sendTxn(vaultPriceFeed.setIsAmmEnabled(false), "vaultPriceFeed.setIsAmmEnabled")

  const network = getNetwork()
  // deploy this manually for verification. ##################################################
  // ################################################## await deployContract("GLP", [chainInfo[network].glp.name, chainInfo[network].glp.symbol])
  await deployContract("GLP", [chainInfo[network].glp.name, chainInfo[network].glp.symbol])

  const glp = await contractAt("GLP", getDeployFilteredInfo("GLP").imple)

  await sendTxn(glp.setInPrivateTransferMode(true), "glp.setInPrivateTransferMode")
  
  await deployContract("ShortsTracker", [vault.address]);

  const shortsTracker = await contractAt("ShortsTracker", getDeployFilteredInfo("ShortsTracker").imple)

  await deployContract("GlpManager", [vault.address, usdg.address, glp.address, shortsTracker.address, 15 * 60])

  const glpManager = await contractAt("GlpManager", getDeployFilteredInfo("GlpManager").imple)

  await sendTxn(glpManager.setInPrivateMode(true), "glpManager.setInPrivateMode")

  await sendTxn(glp.setMinter(glpManager.address, true), "glp.setMinter")
  await sendTxn(usdg.addVault(glpManager.address), "usdg.addVault(glpManager)")

  await sendTxn(vault.initialize(
    router.address, // router
    usdg.address, // usdg
    vaultPriceFeed.address, // priceFeed
    toUsd(2), // liquidationFeeUsd
    100, // fundingRateFactor
    100 // stableFundingRateFactor
  ), "vault.initialize")

  await sendTxn(vault.setFundingRate(60 * 60, 100, 100), "vault.setFundingRate")

  await sendTxn(vault.setInManagerMode(true), "vault.setInManagerMode")
  await sendTxn(vault.setManager(glpManager.address, true), "vault.setManager")

  await sendTxn(vault.setFees(
    10, // _taxBasisPoints
    5, // _stableTaxBasisPoints
    20, // _mintBurnFeeBasisPoints
    20, // _swapFeeBasisPoints
    1, // _stableSwapFeeBasisPoints
    10, // _marginFeeBasisPoints
    toUsd(2), // _liquidationFeeUsd
    24 * 60 * 60, // _minProfitTime
    true // _hasDynamicFees
  ), "vault.setFees")

  await deployContract("VaultErrorController", [])

  const vaultErrorController = await contractAt("VaultErrorController", getDeployFilteredInfo("VaultErrorController").imple)

  await sendTxn(vault.setErrorController(vaultErrorController.address), "vault.setErrorController")
  await sendTxn(vaultErrorController.setErrors(vault.address, errors), "vaultErrorController.setErrors")

  await deployContract("VaultUtils", [vault.address])

  const vaultUtils = await contractAt("VaultUtils", getDeployFilteredInfo("VaultUtils").imple)

  await sendTxn(vault.setVaultUtils(vaultUtils.address), "vault.setVaultUtils")
}
