const { deployContract } = require("../shared/helpers")

async function deployMulticall() {
  await deployContract("Multicall3", []);
}

module.exports = deployMulticall