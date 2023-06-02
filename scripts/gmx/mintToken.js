const { contractAt, sendTxn } = require("../shared/helpers")
const { expandDecimals, maxUint256 } = require("../../test/shared/utilities")

async function main() {
//   const wallet = { address: "0xE31bf8f9C0d036b0b3A0e0a76c131cB919af6134" }
  const gmx = await contractAt("GMX", "0x2083a1a936E72Aa77e134A1e18CD4E19B7C562A0")

//   await sendTxn(gmx.setMinter(wallet.address, "true"), "gmx.setMinter(minter, isActive)")
//   await sendTxn(gmx.mint(wallet.address, "100000000000000000000"), "gmx.mint(account, amount)")
  await sendTxn(gmx.approve("0xE67AC12f8d493504ea17CE06c0e6d22353F1Be0D", "100000000000000000000"), "gmx.approve(account, amount)")
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
