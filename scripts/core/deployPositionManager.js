const { deployContract, contractAt, sendTxn } = require("../shared/helpers");
const { getDeployFilteredInfo } = require("../shared/syncParams");

const depositFee = 30; // 0.3%

async function deployPositionManager() {
  const { imple: vaultAddr } = getDeployFilteredInfo("Vault");
  const { imple: timelockAddr } = getDeployFilteredInfo("Timelock");
  const { imple: routerAddr } = getDeployFilteredInfo("Router");
  const { imple: shortsTrackerAddr } = getDeployFilteredInfo("ShortsTracker");
  const { imple: wethAddr } = getDeployFilteredInfo("WETH");
  const { imple: orderBookAddr } = getDeployFilteredInfo("OrderBook");
  const { imple: referralStorageAddr } =
    getDeployFilteredInfo("ReferralStorage");
  const { imple: positionUtilsAddr } = getDeployFilteredInfo("PositionUtils");

  const orderKeepers = [
    { address: getDeployFilteredInfo("MultiSigner1").imple },
    { address: getDeployFilteredInfo("MultiSigner2").imple },
  ];

  const liquidators = [
    { address: getDeployFilteredInfo("MultiSigner3").imple },
  ];

  const partnerContracts = [];

  const positionManagerArgs = [
    vaultAddr,
    routerAddr,
    shortsTrackerAddr,
    wethAddr,
    depositFee,
    orderBookAddr,
  ]

  await deployContract(
    "PositionManager",
    positionManagerArgs,
    "PositionManager",
    {
      libraries: {
        PositionUtils: positionUtilsAddr,
      },
    }
  )

  const positionManager = await contractAt("PositionManager", getDeployFilteredInfo("PositionManager").imple, undefined, {
    libraries: {
      PositionUtils: positionUtilsAddr,
    },
  })

  if (
    (await positionManager.referralStorage()).toLowerCase() !=
    referralStorageAddr.toLowerCase()
  ) {
    await sendTxn(
      positionManager.setReferralStorage(referralStorageAddr),
      "positionManager.setReferralStorage"
    );
  }

  if (await positionManager.shouldValidateIncreaseOrder()) {
    await sendTxn(
      positionManager.setShouldValidateIncreaseOrder(false),
      "positionManager.setShouldValidateIncreaseOrder(false)"
    );
  }

  for (let i = 0; i < orderKeepers.length; i++) {
    const orderKeeper = orderKeepers[i];
    if (!(await positionManager.isOrderKeeper(orderKeeper.address))) {
      await sendTxn(
        positionManager.setOrderKeeper(orderKeeper.address, true),
        "positionManager.setOrderKeeper(orderKeeper)"
      );
    }
  }

  for (let i = 0; i < liquidators.length; i++) {
    const liquidator = liquidators[i];
    if (!(await positionManager.isLiquidator(liquidator.address))) {
      await sendTxn(
        positionManager.setLiquidator(liquidator.address, true),
        "positionManager.setLiquidator(liquidator)"
      );
    }
  }

  const timelock = await contractAt("Timelock", timelockAddr)

  if (!(await timelock.isHandler(positionManager.address))) {
    await sendTxn(
      timelock.setContractHandler(positionManager.address, true),
      "timelock.setContractHandler(positionManager)"
    );
  }

  const vault = await contractAt("Vault", vaultAddr);

  if (!(await vault.isLiquidator(positionManager.address))) {
    await sendTxn(
      timelock.setLiquidator(vault.address, positionManager.address, true),
      "timelock.setLiquidator(vault, positionManager, true)"
    );
  }
  
  const shortsTracker = await contractAt("ShortsTracker", shortsTrackerAddr)

  if (!(await shortsTracker.isHandler(positionManager.address))) {
    await sendTxn(
      shortsTracker.setHandler(positionManager.address, true),
      "shortsTracker.setContractHandler(positionManager.address, true)"
    );
  }

  const router = await contractAt("Router", routerAddr)

  if (!(await router.plugins(positionManager.address))) {
    await sendTxn(
      router.addPlugin(positionManager.address),
      "router.addPlugin(positionManager)"
    );
  }

  for (let i = 0; i < partnerContracts.length; i++) {
    const partnerContract = partnerContracts[i];
    if (!(await positionManager.isPartner(partnerContract))) {
      await sendTxn(
        positionManager.setPartner(partnerContract, true),
        "positionManager.setPartner(partnerContract)"
      );
    }
  }

  if ((await positionManager.gov()) != (await vault.gov())) {
    await sendTxn(
      positionManager.setGov(await vault.gov()),
      "positionManager.setGov"
    );
  }

  console.log("done.");
}

module.exports = deployPositionManager;
