const { deployContract, contractAt , sendTxn } = require("../shared/helpers")

async function deployReferralStorage() {
  // const positionRouter = await contractAt("PositionRouter", "0x3D6bA331e3D9702C5e8A8d254e5d8a285F223aba")
  // const positionManager = await contractAt("PositionManager", "0x87a4088Bd721F83b6c2E5102e2FA47022Cb1c831")

  await deployContract("ReferralStorage", [])

  // const referralStorage = await contractAt("ReferralStorage", await positionRouter.referralStorage())

  // await sendTxn(positionRouter.setReferralStorage(referralStorage.address), "positionRouter.setReferralStorage")
  // await sendTxn(positionManager.setReferralStorage(referralStorage.address), "positionManager.setReferralStorage")

  // await sendTxn(referralStorage.setHandler(positionRouter.address, true), "referralStorage.setHandler(positionRouter)")
}

module.exports = deployReferralStorage
