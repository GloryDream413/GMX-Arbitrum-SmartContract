const { deployContract, contractAt, sendTxn, getFrameSigner } = require("../shared/helpers")
const { getDeployFilteredInfo } = require("../shared/syncParams");

async function deployPriceFeedTimelock() {
  const signer = await getFrameSigner()
  const admin = signer.address
  const buffer = 24 * 60 * 60

  const { imple: tokenManager } = getDeployFilteredInfo("TokenManager")

  await deployContract("PriceFeedTimelock", [
    admin,
    buffer,
    tokenManager
  ], "Timelock")

  const timelock = await contractAt("PriceFeedTimelock", getDeployFilteredInfo("PriceFeedTimelock").imple)

  const deployedTimelock = await contractAt("PriceFeedTimelock", timelock.address)

  const signers = [
    getDeployFilteredInfo("MultiSigner1").imple, // coinflipcanada
    getDeployFilteredInfo("MultiSigner2").imple, // G
    getDeployFilteredInfo("MultiSigner3").imple, // kr
    getDeployFilteredInfo("MultiSigner4").imple, // quat
    getDeployFilteredInfo("MultiSigner5").imple // xhiroz
  ]

  console.log("Signing contract handlers...", deployedTimelock.address)
  for (let i = 0; i < signers.length; i++) {
    const signer = signers[i]
    await sendTxn(deployedTimelock.setContractHandler(signer, true), `deployedTimelock.setContractHandler(${signer})`)
  }

  const keepers = [
    getDeployFilteredInfo("MultiSigner6").imple // X
  ]

  console.log("Signing keepers...")
  for (let i = 0; i < keepers.length; i++) {
    const keeper = keepers[i]
    await sendTxn(deployedTimelock.setKeeper(keeper, true), `deployedTimelock.setKeeper(${keeper})`)
  }
}

module.exports = deployPriceFeedTimelock