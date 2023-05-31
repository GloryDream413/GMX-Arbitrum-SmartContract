const { readTmpAddresses, contractAt, callWithRetries, getFrameSigner } = require("../shared/helpers")
const { expandDecimals } = require("../../test/shared/utilities")

async function main() {
	const signer = await getFrameSigner()
	const account = signer
	const {BTC, ETH, USDC, USDT} = readTmpAddresses()

	for (const tokenAddress of [BTC, USDC, USDT]) {
		const amount = expandDecimals(100000, 18)
		console.log(`Minting ${amount} of tokens ${tokenAddress}`)
		const tokenContract = await contractAt("FaucetToken", tokenAddress)
		await callWithRetries(tokenContract.mint.bind(tokenContract), [account.address, amount])
	}
}

main()