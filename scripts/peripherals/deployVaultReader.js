const { deployContract } = require("../shared/helpers")

async function deployVaultReader() {
  await deployContract("VaultReader", [], "VaultReader")
}

module.exports = deployVaultReader