const deployTokenManager = require("../access/deployTokenManager");
const deployOrderBook = require("../core/deployOrderBook");
const deployPositionManager = require("../core/deployPositionManager");
const deployPositionRouter = require("../core/deployPositionRouter");
const deployReferralReader = require("../core/deployReferralReader");
const deployReferralStorage = require("../core/deployReferralStorage");
const deployVault = require("../core/deployVault")
const deployGMX = require("../gmx/deployGMX");
const deployTokens = require("../gmx/deployTokens");
const deployWETH = require("../gmx/deployWETH");
const deployOrderBookReader = require("../peripherals/deployOrderBookReader");
const deployPriceFeedTimelock = require("../peripherals/deployPriceFeedTimelock");
const deployReader = require("../peripherals/deployReader");
const deployRewardReader = require("../peripherals/deployRewardReader");
const deployShortsTrackerTimelock = require("../peripherals/deployShortsTrackerTimelock");
const deployTimelock = require("../peripherals/deployTimelock");
const deployVaultReader = require("../peripherals/deployVaultReader");
const deployRewardRouterV2 = require("../staking/deployRewardRouterV2");
const deployPriceFeed = require("../core/deployPriceFeed");
const deployPriceFeedExt = require("../core/deployPriceFeedExt");
const deployMulticall = require("../core/deployMulticall"); 
const { getGasUsed, syncDeployInfo } = require("../shared/syncParams");

const deploy_localhost = async () => {
  // syncDeployInfo("USDT", {
  //   name: "USDT",
  //   imple: "0x81bCEa03678D1CEF4830942227720D542Aa15817",
  // });
  syncDeployInfo("MultiSigner1", {
    name: "MultiSigner1",
    imple: "0x2faf8ab2b9ac8Bd4176A0B9D31502bA3a59B4b41",
  });
  syncDeployInfo("MultiSigner2", {
    name: "MultiSigner2",
    imple: "0x10494fbe1b966824Dd98a2bcD7bc983e2307F60F",
  });
  syncDeployInfo("MultiSigner3", {
    name: "MultiSigner3",
    imple: "0x84f8bF4bB72F4BE2C131a5F7B519b23958A76980",
  });
  syncDeployInfo("MultiSigner4", {
    name: "MultiSigner4",
    imple: "0xa63afBB98eB3580799022A64648adC355244DD6c",
  });
  syncDeployInfo("MultiSigner5", {
    name: "MultiSigner5",
    imple: "0xC8f2227Cf7dA427fe4EF762886dC0F6D2D7c8399",
  });
  syncDeployInfo("MultiSigner6", {
    name: "MultiSigner6",
    imple: "0xfA9E2084fc38DaFca0aea969bE314061E5F1d424",
  });
  await deployMulticall()
  await deployPriceFeedExt()

  await deployWETH()
  await deployGMX()
  await deployVault()
  await deployVaultReader()
  await deployReader()
  await deployRewardReader()
  await deployTokens()
  await deployRewardRouterV2()
  await deployOrderBook()
  await deployOrderBookReader()
  await deployReferralStorage()
  await deployReferralReader()
  await deployTokenManager()
  await deployPriceFeedTimelock()
  await deployTimelock()
  await deployShortsTrackerTimelock()
  await deployPositionRouter()
  await deployPositionManager()
  await deployPriceFeed()

  console.log('gas used:', getGasUsed())
};

module.exports = { deploy_localhost };
