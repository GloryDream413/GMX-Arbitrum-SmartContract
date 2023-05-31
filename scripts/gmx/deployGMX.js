const { deployContract, verifyContract } = require("../shared/helpers")
const { chainInfo } = require('../networks/chain')
const { getNetwork, getDeployFilteredInfo } = require('../shared/syncParams')

async function deployGMX() {
  const network = getNetwork()
  // deploy this manually for verification. ##################################################
  // ################################################## await deployContract("GMX", [chainInfo[network].gmx.name, chainInfo[network].gmx.symbol])
  await deployContract("GMX", [chainInfo[network].gmx.name, chainInfo[network].gmx.symbol])
  // await verifyContract("GMX", getDeployFilteredInfo("GMX").imple, "contracts/gmx/GMX.sol:GMX", [chainInfo[network].gmx.name, chainInfo[network].gmx.symbol])
  
  //await verifyContract("GMX", getDeployFilteredInfo("Test1").imple, "contracts/gmx/GMX.sol:GMX", ["Test1", "Test1"]) //0xD88C7Cc6C48AA05DAd9cdc02B56aE2f37e61BE46
}

module.exports = deployGMX
