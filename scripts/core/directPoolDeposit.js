const { contractAt, sendTxn } = require("../shared/helpers")
const { getDeployFilteredInfo } = require("../shared/syncParams");

async function directPoolDeposit(amount) {
  const router = await contractAt("Router", getDeployFilteredInfo("Router").imple)
  const WETH = await contractAt("WETH", getDeployFilteredInfo("WETH").imple)
  
  await sendTxn(WETH.approve(router.address, amount), "router.approve")
  await sendTxn(router.directPoolDeposit(WETH.address, amount), "router.directPoolDeposit")
}

module.exports = directPoolDeposit
