const { deployContract, sendTxn, contractAt } = require("../shared/helpers")
const { getDeployFilteredInfo } = require("../shared/syncParams")

async function deployPriceFeedExt() {
  await deployContract("PriceFeedExt", ["Price Feed USDT/USD", 8], undefined, undefined, "PriceFeedUSDT")
  const priceFeedUSDT = await contractAt("PriceFeedExt", getDeployFilteredInfo("PriceFeedUSDT").imple)
  await sendTxn(priceFeedUSDT.setAdmin(await priceFeedUSDT.gov(), true), "priceFeedUSDT.setAdmin(gov,true)")
  await sendTxn(priceFeedUSDT.setAdmin(getDeployFilteredInfo("MultiSigner1").imple, true), "priceFeedUSDT.setAdmin(signer1,true)")
  await sendTxn(priceFeedUSDT.transmit("100239000"), "priceFeedUSDT.transmit()")

  await deployContract("PriceFeedExt", ["Price Feed CORE/USD", 8], undefined, undefined, "PriceFeedCORE")
  const priceFeedCORE = await contractAt("PriceFeedExt", getDeployFilteredInfo("PriceFeedCORE").imple)
  await sendTxn(priceFeedCORE.setAdmin(await priceFeedCORE.gov(), true), "priceFeedCORE.setAdmin(gov,true)")
  await sendTxn(priceFeedCORE.setAdmin(getDeployFilteredInfo("MultiSigner1").imple, true), "priceFeedCORE.setAdmin(signer1,true)")
  await sendTxn(priceFeedCORE.transmit("207000000"), "priceFeedCORE.transmit()")

  await deployContract("PriceFeedExt", ["Price Feed BTC/USD", 8], undefined, undefined, "PriceFeedBTC")
  const priceFeedBTC = await contractAt("PriceFeedExt", getDeployFilteredInfo("PriceFeedBTC").imple)
  await sendTxn(priceFeedBTC.setAdmin(await priceFeedBTC.gov(), true), "priceFeedBTC.setAdmin(gov,true)")
  await sendTxn(priceFeedBTC.setAdmin(getDeployFilteredInfo("MultiSigner1").imple, true), "priceFeedBTC.setAdmin(signer1,true)")
  await sendTxn(priceFeedBTC.transmit("2739150000000"), "priceFeedBTC.transmit()")

  await deployContract("PriceFeedExt", ["Price Feed ETH/USD", 8], undefined, undefined, "PriceFeedETH")
  const priceFeedETH = await contractAt("PriceFeedExt", getDeployFilteredInfo("PriceFeedETH").imple)
  await sendTxn(priceFeedETH.setAdmin(await priceFeedETH.gov(), true), "priceFeedETH.setAdmin(gov,true)")
  await sendTxn(priceFeedETH.setAdmin(getDeployFilteredInfo("MultiSigner1").imple, true), "priceFeedETH.setAdmin(signer1,true)")
  await sendTxn(priceFeedETH.transmit("180360000000"), "priceFeedETH.transmit()")
}

module.exports = deployPriceFeedExt