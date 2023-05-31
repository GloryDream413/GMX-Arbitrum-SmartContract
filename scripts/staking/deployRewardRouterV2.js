const { deployContract, contractAt, sendTxn, getFrameSigner } = require("../shared/helpers")
const { getDeployFilteredInfo } = require("../shared/syncParams")
const { chainInfo } = require('../networks/chain')
const { getNetwork } = require('../shared/syncParams')

async function deployRewardRouterV2() {
  const signer = await getFrameSigner()
  const { imple: nativeToken } = getDeployFilteredInfo("WETH")

  const vestingDuration = 365 * 24 * 60 * 60

  const glpManagerInfo = getDeployFilteredInfo("GlpManager")
  const glpManager = await contractAt("GlpManager", glpManagerInfo.imple)
  const glpInfo = getDeployFilteredInfo("GLP")
  const glp = await contractAt("GLP", glpInfo.imple)

  const gmxInfo = getDeployFilteredInfo("GMX")
  const gmx = await contractAt("GMX", gmxInfo.imple);
  const esGmxInfo = getDeployFilteredInfo("EsGMX")
  const esGmx = await contractAt("EsGMX", esGmxInfo.imple);

  const network = getNetwork()

  await deployContract("MintableBaseToken", [chainInfo[network].bngmx.name, chainInfo[network].bngmx.symbol, 0], undefined, undefined, "BonusGMX");

  const bnGmx = await contractAt("MintableBaseToken", getDeployFilteredInfo("BonusGMX").imple)

  await sendTxn(esGmx.setInPrivateTransferMode(true), "esGmx.setInPrivateTransferMode")
  await sendTxn(glp.setInPrivateTransferMode(true), "glp.setInPrivateTransferMode")

  await deployContract("RewardTracker", [chainInfo[network].sgmx.name, chainInfo[network].sgmx.symbol], undefined, undefined, "RewardTrackerStakedGMX")

  const stakedGmxTracker = await contractAt("RewardTracker", getDeployFilteredInfo("RewardTrackerStakedGMX").imple)

  await deployContract("RewardDistributor", [esGmx.address, stakedGmxTracker.address], undefined, undefined, "RewardDistributorStakedGMX")

  const stakedGmxDistributor = await contractAt("RewardDistributor", getDeployFilteredInfo("RewardDistributorStakedGMX").imple)

  await sendTxn(stakedGmxTracker.initialize([gmx.address, esGmx.address], stakedGmxDistributor.address), "stakedGmxTracker.initialize")
  await sendTxn(stakedGmxDistributor.updateLastDistributionTime(), "stakedGmxDistributor.updateLastDistributionTime")

  await deployContract("RewardTracker", [chainInfo[network].sbgmx.name, chainInfo[network].sbgmx.symbol], undefined, undefined, "RewardTrackerStakedBonusGMX")

  const bonusGmxTracker = await contractAt("RewardTracker", getDeployFilteredInfo("RewardTrackerStakedBonusGMX").imple)

  await deployContract("BonusDistributor", [bnGmx.address, bonusGmxTracker.address], undefined, undefined, "BonusDistributorStakedGMX")

  const bonusGmxDistributor = await contractAt("BonusDistributor", getDeployFilteredInfo("BonusDistributorStakedGMX").imple)

  await sendTxn(bonusGmxTracker.initialize([stakedGmxTracker.address], bonusGmxDistributor.address), "bonusGmxTracker.initialize")
  await sendTxn(bonusGmxDistributor.updateLastDistributionTime(), "bonusGmxDistributor.updateLastDistributionTime")

  await deployContract("RewardTracker", [chainInfo[network].sbfgmx.name, chainInfo[network].sbfgmx.symbol], undefined, undefined, "RewardTrackerStakedBonusFeeGMX")

  const feeGmxTracker = await contractAt("RewardTracker", getDeployFilteredInfo("RewardTrackerStakedBonusFeeGMX").imple)

  await deployContract("RewardDistributor", [nativeToken, feeGmxTracker.address], undefined, undefined, "RewardDistributorStakedBonusFeeGMX")

  const feeGmxDistributor = await contractAt("RewardDistributor", getDeployFilteredInfo("RewardDistributorStakedBonusFeeGMX").imple)

  await sendTxn(feeGmxTracker.initialize([bonusGmxTracker.address, bnGmx.address], feeGmxDistributor.address), "feeGmxTracker.initialize")
  await sendTxn(feeGmxDistributor.updateLastDistributionTime(), "feeGmxDistributor.updateLastDistributionTime")

  await deployContract("RewardTracker", [chainInfo[network].fglp.name, chainInfo[network].fglp.symbol], undefined, undefined, "RewardTrackerFeeGLP")

  const feeGlpTracker = await contractAt("RewardTracker", getDeployFilteredInfo("RewardTrackerFeeGLP").imple)
  
  await deployContract("RewardDistributor", [nativeToken, feeGlpTracker.address], undefined, undefined, "RewardDistributorFeeGLP")

  const feeGlpDistributor = await contractAt("RewardDistributor", getDeployFilteredInfo("RewardDistributorFeeGLP").imple)

  await sendTxn(feeGlpTracker.initialize([glp.address], feeGlpDistributor.address), "feeGlpTracker.initialize")
  await sendTxn(feeGlpDistributor.updateLastDistributionTime(), "feeGlpDistributor.updateLastDistributionTime")

  await deployContract("RewardTracker", [chainInfo[network].fsglp.name, chainInfo[network].fsglp.symbol], undefined, undefined, "RewardTrackerFeeStakedGLP")

  const stakedGlpTracker = await contractAt("RewardTracker", getDeployFilteredInfo("RewardTrackerFeeStakedGLP").imple)

  await deployContract("RewardDistributor", [esGmx.address, stakedGlpTracker.address], undefined, undefined, "RewardDistributorFeeStakedGLP")

  const stakedGlpDistributor = await contractAt("RewardDistributor", getDeployFilteredInfo("RewardDistributorFeeStakedGLP").imple)

  await sendTxn(stakedGlpTracker.initialize([feeGlpTracker.address], stakedGlpDistributor.address), "stakedGlpTracker.initialize")
  await sendTxn(stakedGlpDistributor.updateLastDistributionTime(), "stakedGlpDistributor.updateLastDistributionTime")

  await sendTxn(stakedGmxTracker.setInPrivateTransferMode(true), "stakedGmxTracker.setInPrivateTransferMode")
  await sendTxn(stakedGmxTracker.setInPrivateStakingMode(true), "stakedGmxTracker.setInPrivateStakingMode")
  await sendTxn(bonusGmxTracker.setInPrivateTransferMode(true), "bonusGmxTracker.setInPrivateTransferMode")
  await sendTxn(bonusGmxTracker.setInPrivateStakingMode(true), "bonusGmxTracker.setInPrivateStakingMode")
  await sendTxn(bonusGmxTracker.setInPrivateClaimingMode(true), "bonusGmxTracker.setInPrivateClaimingMode")
  await sendTxn(feeGmxTracker.setInPrivateTransferMode(true), "feeGmxTracker.setInPrivateTransferMode")
  await sendTxn(feeGmxTracker.setInPrivateStakingMode(true), "feeGmxTracker.setInPrivateStakingMode")

  await sendTxn(feeGlpTracker.setInPrivateTransferMode(true), "feeGlpTracker.setInPrivateTransferMode")
  await sendTxn(feeGlpTracker.setInPrivateStakingMode(true), "feeGlpTracker.setInPrivateStakingMode")
  await sendTxn(stakedGlpTracker.setInPrivateTransferMode(true), "stakedGlpTracker.setInPrivateTransferMode")
  await sendTxn(stakedGlpTracker.setInPrivateStakingMode(true), "stakedGlpTracker.setInPrivateStakingMode")

  await deployContract("Vester", [
    chainInfo[network].vgmx.name, chainInfo[network].vgmx.symbol, // _name, _symbol
    vestingDuration, // _vestingDuration
    esGmx.address, // _esToken
    feeGmxTracker.address, // _pairToken
    gmx.address, // _claimableToken
    stakedGmxTracker.address, // _rewardTracker
  ], undefined, undefined, "VesterGMX")

  const gmxVester = await contractAt("Vester", getDeployFilteredInfo("VesterGMX").imple)

  await deployContract("Vester", [
    chainInfo[network].vglp.name, chainInfo[network].vglp.symbol, // _name, _symbol
    vestingDuration, // _vestingDuration
    esGmx.address, // _esToken
    stakedGlpTracker.address, // _pairToken
    gmx.address, // _claimableToken
    stakedGlpTracker.address, // _rewardTracker
  ], undefined, undefined, "VesterGLP")

  const glpVester = await contractAt("Vester", getDeployFilteredInfo("VesterGLP").imple)

  await deployContract("RewardRouterV2", [])

  const rewardRouter = await contractAt("RewardRouterV2", getDeployFilteredInfo("RewardRouterV2").imple)

  await sendTxn(rewardRouter.initialize(
    nativeToken,
    gmx.address,
    esGmx.address,
    bnGmx.address,
    glp.address,
    stakedGmxTracker.address,
    bonusGmxTracker.address,
    feeGmxTracker.address,
    feeGlpTracker.address,
    stakedGlpTracker.address,
    glpManager.address,
    gmxVester.address,
    glpVester.address
  ), "rewardRouter.initialize")

  await sendTxn(glpManager.setHandler(rewardRouter.address, true), "glpManager.setHandler(rewardRouter)")

  // allow rewardRouter to stake in stakedGmxTracker
  await sendTxn(stakedGmxTracker.setHandler(rewardRouter.address, true), "stakedGmxTracker.setHandler(rewardRouter)")
  // allow bonusGmxTracker to stake stakedGmxTracker
  await sendTxn(stakedGmxTracker.setHandler(bonusGmxTracker.address, true), "stakedGmxTracker.setHandler(bonusGmxTracker)")
  // allow rewardRouter to stake in bonusGmxTracker
  await sendTxn(bonusGmxTracker.setHandler(rewardRouter.address, true), "bonusGmxTracker.setHandler(rewardRouter)")
  // allow bonusGmxTracker to stake feeGmxTracker
  await sendTxn(bonusGmxTracker.setHandler(feeGmxTracker.address, true), "bonusGmxTracker.setHandler(feeGmxTracker)")
  await sendTxn(bonusGmxDistributor.setBonusMultiplier(10000), "bonusGmxDistributor.setBonusMultiplier")
  // allow rewardRouter to stake in feeGmxTracker
  await sendTxn(feeGmxTracker.setHandler(rewardRouter.address, true), "feeGmxTracker.setHandler(rewardRouter)")
  // allow stakedGmxTracker to stake esGmx
  await sendTxn(esGmx.setHandler(stakedGmxTracker.address, true), "esGmx.setHandler(stakedGmxTracker)")
  // allow feeGmxTracker to stake bnGmx
  await sendTxn(bnGmx.setHandler(feeGmxTracker.address, true), "bnGmx.setHandler(feeGmxTracker")
  // allow rewardRouter to burn bnGmx
  await sendTxn(bnGmx.setMinter(rewardRouter.address, true), "bnGmx.setMinter(rewardRouter")

  // allow stakedGlpTracker to stake feeGlpTracker
  await sendTxn(feeGlpTracker.setHandler(stakedGlpTracker.address, true), "feeGlpTracker.setHandler(stakedGlpTracker)")
  // allow feeGlpTracker to stake glp
  await sendTxn(glp.setHandler(feeGlpTracker.address, true), "glp.setHandler(feeGlpTracker)")

  // allow rewardRouter to stake in feeGlpTracker
  await sendTxn(feeGlpTracker.setHandler(rewardRouter.address, true), "feeGlpTracker.setHandler(rewardRouter)")
  // allow rewardRouter to stake in stakedGlpTracker
  await sendTxn(stakedGlpTracker.setHandler(rewardRouter.address, true), "stakedGlpTracker.setHandler(rewardRouter)")

  await sendTxn(esGmx.setHandler(rewardRouter.address, true), "esGmx.setHandler(rewardRouter)")
  await sendTxn(esGmx.setHandler(stakedGmxDistributor.address, true), "esGmx.setHandler(stakedGmxDistributor)")
  await sendTxn(esGmx.setHandler(stakedGlpDistributor.address, true), "esGmx.setHandler(stakedGlpDistributor)")
  await sendTxn(esGmx.setHandler(stakedGlpTracker.address, true), "esGmx.setHandler(stakedGlpTracker)")
  await sendTxn(esGmx.setHandler(gmxVester.address, true), "esGmx.setHandler(gmxVester)")
  await sendTxn(esGmx.setHandler(glpVester.address, true), "esGmx.setHandler(glpVester)")

  await sendTxn(esGmx.setMinter(gmxVester.address, true), "esGmx.setMinter(gmxVester)")
  await sendTxn(esGmx.setMinter(glpVester.address, true), "esGmx.setMinter(glpVester)")

  await sendTxn(gmxVester.setHandler(rewardRouter.address, true), "gmxVester.setHandler(rewardRouter)")
  await sendTxn(glpVester.setHandler(rewardRouter.address, true), "glpVester.setHandler(rewardRouter)")

  await sendTxn(feeGmxTracker.setHandler(gmxVester.address, true), "feeGmxTracker.setHandler(gmxVester)")
  await sendTxn(stakedGlpTracker.setHandler(glpVester.address, true), "stakedGlpTracker.setHandler(glpVester)")

  // ************************************
  // await sendTxn(esGmx.setMinter(signer.address, true), "esGmx.setMinter(deployer,true)")
  // await sendTxn(esGmx.mint(stakedGmxDistributor.address, '1000000000000000000000'), "esGmx.mint(stakedGmxDistributor,10000)")
}

module.exports = deployRewardRouterV2
