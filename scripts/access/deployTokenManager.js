const { deployContract, contractAt, writeTmpAddresses, sendTxn } = require("../shared/helpers")
const { getDeployFilteredInfo } = require("../shared/syncParams")

async function deployTokenManager() {
  await deployContract("TokenManager", [2], "TokenManager")

  const tokenManager = await contractAt("TokenManager", getDeployFilteredInfo("TokenManager").imple)

  const multiSigners = [
    getDeployFilteredInfo("MultiSigner1").imple, // Dovey
    getDeployFilteredInfo("MultiSigner2").imple, // G
    // getDeployFilteredInfo("MultiSigner3").imple, // Han Wen
    // getDeployFilteredInfo("MultiSigner4").imple, // Krunal Amin
    // getDeployFilteredInfo("MultiSigner5").imple, // xhiroz
    // getDeployFilteredInfo("MultiSigner6").imple // Bybit Security Team
  ]

  await sendTxn(tokenManager.initialize(multiSigners), "tokenManager.initialize")
}

module.exports = deployTokenManager