const {
  deployContract,
  contractAt,
  sendTxn,
  getFrameSigner
} = require("../shared/helpers")

const { getDeployFilteredInfo } = require("../shared/syncParams");

async function deployShortsTrackerTimelock() {
  const signer = await getFrameSigner()
  const admin = signer.address
  const handlers = [
    getDeployFilteredInfo("MultiSigner1").imple,
  ]

  const buffer = 60 // 60 seconds
  const updateDelay = 300 // 300 seconds, 5 minutes
  const maxAveragePriceChange = 20 // 0.2%

  await deployContract("ShortsTrackerTimelock", [admin, buffer, updateDelay, maxAveragePriceChange])

  const shortsTrackerTimelock = await contractAt("ShortsTrackerTimelock", getDeployFilteredInfo("ShortsTrackerTimelock").imple)

  console.log("Setting handlers")
  for (const handler of handlers) {
    await sendTxn(
      shortsTrackerTimelock.setContractHandler(handler, true),
      `shortsTrackerTimelock.setContractHandler ${handler}`
    )
  }
}

module.exports = deployShortsTrackerTimelock