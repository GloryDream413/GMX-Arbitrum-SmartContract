const { deployContract } = require("../shared/helpers")

async function deployOrderBookReader() {
  await deployContract("OrderBookReader", [])
}

module.exports = deployOrderBookReader