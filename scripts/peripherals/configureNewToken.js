const { deployContract, contractAt, sleep, sendTxn } = require("../shared/helpers")
const { getNetwork, getDeployFilteredInfo } = require("../shared/syncParams")
const tokenList = require('../core/tokens')

async function configureNewToken() {
    const network = getNetwork()
    const tokens = tokenList[network]

    // ######################## await deployContract("MintableBaseToken", ["Bitcoin (WBTC)", "BTC", 0], undefined, undefined, "BTC")
    // ######################## await deployContract("MintableBaseToken", ["Wrapped Ether", "ETH", 0], undefined, undefined, "ETH")

    const vaultContract = await contractAt("Vault", getDeployFilteredInfo("Vault").imple)
    const vaultPriceFeedContract = await contractAt("VaultPriceFeed", getDeployFilteredInfo("VaultPriceFeed").imple)
    const timelockContract = await contractAt("Timelock", getDeployFilteredInfo("Timelock").imple)
    const priceFeedTimelockContract = await contractAt("PriceFeedTimelock", getDeployFilteredInfo("PriceFeedTimelock").imple)
    const fastPriceFeedContract = await contractAt("FastPriceFeed", getDeployFilteredInfo("FastPriceFeed").imple)

    const admin = await priceFeedTimelockContract.admin()
    console.log('admin', admin)

    const tlbuffer = await timelockContract.buffer()
    console.log('Timelock buffer', tlbuffer.toString())

    const prtlbuffer = await priceFeedTimelockContract.buffer()
    console.log('PriceFeedTimelock buffer', prtlbuffer.toString())

    if (parseInt(tlbuffer.toString()) !== 0) {
        await sendTxn(timelockContract.setBuffer(0), 'timelock.setBuffer(0)')
    }

    if (parseInt(prtlbuffer.toString()) !== 0) {
        await sendTxn(priceFeedTimelockContract.setBuffer(0), 'priceFeedTimelock.setBuffer(0)')
    }

    if (admin !== await fastPriceFeedContract.gov()) {
        await sendTxn(priceFeedTimelockContract.signalSetGov(fastPriceFeedContract.address, admin), "priceFeedTimelockContract.signalSetGov(fastPriceFeed, admin)")
        await sleep(3000)
        await sendTxn(priceFeedTimelockContract.setGov(fastPriceFeedContract.address, admin), "priceFeedTimelockContract.setGov(fastPriceFeed, admin)")
    }

    let fastPriceTokenArray = []
    let fastPricePrecisionArray = []
    for (const t in tokens) {
        if (tokens[t] === undefined) continue

        fastPriceTokenArray = [...fastPriceTokenArray, tokens[t].address]
        fastPricePrecisionArray = [...fastPricePrecisionArray, tokens[t].fastPricePrecision ?? 1000]
    }

    await sendTxn(fastPriceFeedContract.setTokens(fastPriceTokenArray, fastPricePrecisionArray), "fastPriceFeedContract.setTokens([...])")

    await sendTxn(fastPriceFeedContract.setGov(priceFeedTimelockContract.address), 'fastPriceFeedContract.setGov(priceFeedTimelockContract)')

    for (const t in tokens) {
        const info = tokens[t]
        const used = await vaultContract.whitelistedTokens(info.address)
        if (used === true) continue

        console.log('Adding', t, '***')

        await sendTxn(timelockContract.signalVaultSetTokenConfig(
            vaultContract.address, info.address, info.decimals, info.tokenWeight, info.minProfitBps, info.maxUsdgAmount, info.isStable, info.isShortable
        ), `timelockContract.signalVaultSetTokenConfig(${t})`)

        await sendTxn(priceFeedTimelockContract.signalPriceFeedSetTokenConfig(
            vaultPriceFeedContract.address, info.address, info.priceFeed, info.priceDecimals, info.stable
        ), `priceFeedTimelockContract.signalPriceFeedSetTokenConfig(${t})`)

        await sleep(3000)

        await sendTxn(timelockContract.vaultSetTokenConfig(
            vaultContract.address, info.address, info.decimals, info.tokenWeight, info.minProfitBps, info.maxUsdgAmount, info.isStable, info.isShortable
        ), `timelockContract.vaultSetTokenConfig(${t})`)
        await sendTxn(priceFeedTimelockContract.priceFeedSetTokenConfig(
            vaultPriceFeedContract.address, info.address, info.priceFeed, info.priceDecimals, info.stable
        ), `priceFeedTimelockContract.priceFeedSetTokenConfig(${t})`)
    }

    await sendTxn(timelockContract.setBuffer(86400), 'timelock.setBuffer(86400)')
    await sendTxn(priceFeedTimelockContract.setBuffer(86400), 'priceFeedTimelock.setBuffer(86400)')
}

module.exports = configureNewToken