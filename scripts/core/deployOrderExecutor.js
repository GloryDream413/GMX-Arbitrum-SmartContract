const { deployContract, contractAt , sendTxn } = require("../shared/helpers")
const { getDeployFilteredInfo } = require("../shared/syncParams")

async function deployOrderExecutor() {
  const vault = getDeployFilteredInfo("Vault").imple
  const orderBook = getDeployFilteredInfo("OrderBook").imple
  await deployContract("OrderExecutor", [vault, orderBook])
}

module.exports = deployOrderExecutor