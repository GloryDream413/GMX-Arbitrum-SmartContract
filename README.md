# Crust Contracts
Contracts for Crust.

## Install Dependencies
If npx is not installed yet:
`npm install -g npx`

Install packages:
`npm i`

## Compile Contracts
`npx hardhat compile`

## Run Tests
`npx hardhat test`

*** npx hardhat run --network mumbai scripts/gmx/deployGMX.js
[V] GMX: 0xd7F5e9DAd9C544802eF5ceC23f3585AA05947C8E
*** npx hardhat verify --network mumbai 0xd7F5e9DAd9C544802eF5ceC23f3585AA05947C8E
-------------------------------------------------------------------------------
