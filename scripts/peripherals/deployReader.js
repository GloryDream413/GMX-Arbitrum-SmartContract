const { deployContract } = require("../shared/helpers")

async function deployReader() {
  await deployContract("Reader", [], "Reader")
}

module.exports = deployReader