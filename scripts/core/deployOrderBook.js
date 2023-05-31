const { deployContract, sendTxn, contractAt } = require("../shared/helpers")
const { expandDecimals } = require("../../test/shared/utilities");
const { getDeployFilteredInfo } = require("../shared/syncParams");

async function deployOrderBook() {
  const { imple: nativeToken } = getDeployFilteredInfo("WETH")

  await deployContract("OrderBook", []);

  const orderBook = await contractAt("OrderBook", getDeployFilteredInfo("OrderBook").imple)

  const routerInfo = getDeployFilteredInfo("Router")
  const vaultInfo = getDeployFilteredInfo("Vault")
  const usdgInfo = getDeployFilteredInfo("USDG")

  await sendTxn(orderBook.initialize(
    routerInfo.imple, // router
    vaultInfo.imple, // vault
    nativeToken, // weth
    usdgInfo.imple, // usdg
    "10000000000000000", // 0.01 AVAX
    expandDecimals(10, 30) // min purchase token amount usd
  ), "orderBook.initialize")
}

module.exports = deployOrderBook