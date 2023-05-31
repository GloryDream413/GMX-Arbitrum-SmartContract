const { getFrameSigner, contractAt, sendTxn, updateTokensPerInterval } = require("../shared/helpers")

const network = (process.env.HARDHAT_NETWORK || 'mainnet');

async function getArbValues(signer) {
  const rewardToken = await contractAt("Token", "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1", signer)
  const tokenDecimals = 18

  const rewardTrackerArr = [
    {
      name: "feeGmxTracker",
      address: "0xd2D1162512F927a7e282Ef43a362659E4F2a728F",
      transferAmount: "1207"
    },
    {
      name: "feeGlpTracker",
      address: "0x4e971a87900b931fF39d1Aad67697F49835400b6",
      transferAmount: "2593"
    }
  ]

  return { rewardToken, tokenDecimals, rewardTrackerArr }
}

async function getAvaxValues(signer) {
  const rewardToken = await contractAt("Token", "0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7", signer)
  const tokenDecimals = 18

  const rewardTrackerArr = [
    {
      name: "feeGmxTracker",
      address: "0x4d268a7d4C16ceB5a606c173Bd974984343fea13",
      transferAmount: "7414"
    },
    {
      name: "feeGlpTracker",
      address: "0xd2D1162512F927a7e282Ef43a362659E4F2a728F",
      transferAmount: "38822"
    }
  ]

  return { rewardToken, tokenDecimals, rewardTrackerArr }
}

function getValues(signer) {
  if (network === "arbitrum") {
    return getArbValues(signer)
  }

  if (network === "avax") {
    return getAvaxValues(signer)
  }
}

async function main() {
  const signer = await getFrameSigner()
  const { rewardToken, tokenDecimals, rewardTrackerArr } = await getValues(signer)

  for (let i = 0; i < rewardTrackerArr.length; i++) {
    const rewardTrackerItem = rewardTrackerArr[i]
    const { transferAmount } = rewardTrackerItem
    const rewardTracker = await contractAt("RewardTracker", rewardTrackerItem.address)
    const rewardDistributorAddress = await rewardTracker.distributor()
    const rewardDistributor = await contractAt("RewardDistributor", rewardDistributorAddress)
    const convertedTransferAmount = ethers.utils.parseUnits(transferAmount, tokenDecimals)
    const rewardsPerInterval = convertedTransferAmount.div(7 * 24 * 60 * 60)
    console.log("rewardDistributorAddress", rewardDistributorAddress)
    console.log("convertedTransferAmount", convertedTransferAmount.toString())
    console.log("rewardsPerInterval", rewardsPerInterval.toString())

    await sendTxn(rewardToken.transfer(rewardDistributorAddress, convertedTransferAmount, { gasLimit: 1000000 }), `rewardToken.transfer ${i}`)
    await updateTokensPerInterval(rewardDistributor, rewardsPerInterval, "rewardDistributor")
  }
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
