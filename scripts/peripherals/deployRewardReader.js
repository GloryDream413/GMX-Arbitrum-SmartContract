const { deployContract } = require("../shared/helpers")

async function deployRewardReader() {
  await deployContract("RewardReader", [], "RewardReader")
}

module.exports = deployRewardReader
