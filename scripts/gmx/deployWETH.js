const { deployContract } = require("../shared/helpers")

async function deployWETH() {
  await deployContract("WETH", ["Wrapped Ether", "WETH", 18])
}

module.exports = deployWETH
