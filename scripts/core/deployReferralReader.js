const { deployContract } = require("../shared/helpers")

async function deployReferralReader() {
  await deployContract("ReferralReader", [], "ReferralReader")
}

module.exports = deployReferralReader