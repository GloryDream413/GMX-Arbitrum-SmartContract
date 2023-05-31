const { deployContract } = require("../shared/helpers")
const { chainInfo } = require('../networks/chain')
const { getNetwork } = require('../shared/syncParams')

async function deployTokens() {
  const network = getNetwork()
  // deploy this manually for verification. ##################################################
  // ################################################## await deployContract("EsGMX", [chainInfo[network].esgmx.name, chainInfo[network].esgmx.symbol], undefined, undefined, "EsGMX")
  await deployContract("EsGMX", [chainInfo[network].esgmx.name, chainInfo[network].esgmx.symbol], undefined, undefined, "EsGMX")
  await deployContract("MintableBaseToken", [chainInfo[network].esgmxiou.name, chainInfo[network].esgmxiou.symbol, 0], undefined, undefined, "EsGMXIOU")
}

module.exports = deployTokens
