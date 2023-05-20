# Social Price Monitor

## 1. The problem
In times of hyperinflation, basic goods tend to rise its price dramatically and speculating business appears to steal people's money. This also happen in scarcity times. Countries likes Argentina and Venezuela have been suffering this sutuation for a few years now.

## 2. The Solution
A decentralized application (Dapp) that runs on Ethereum that allows a local community to track prices for chosen products and then take communioty or legal actions or help saving some money when buying those products.
We looked at a decentralized solution since it could serve as a legal proof for legal actions, every action is public, each price report will be validated by randomnly assigned validators.

## 3. Expected results
We want to release an MVP with these main features:
* Allow an user to login (connect) with their metamask wallet
* Allow an user to report prices including product, brand and store, and visual proofs (stored in IPFS)
* Allow a price report to be validated by randomly chosen validators
* Allow validators to receive a reward in Tokens for validating price reports
* Allow to subscribe to a product in order to receive notifications when there's a price report for it (via PUSH notifications)
* Allow an user to see a chart with price history and trends
* Allow to enable different roles for users like SuperAdmin, Admin, Validator, User

# About the Team: BlockBusters
* Victor Inojosa: [@vijoin](https://twitter.com/vijoin)
* Edgar Lopez: [@edgarlopez241](https://twitter.com/edgarlopez241)
* Hector Saldaña Benitez: [@s_hector](https://twitter.com/s_hector)
* Victor Daniel Ome: [in: victor-ome](https://www.linkedin.com/in/victor-ome/)
* David Santiago Garcia Chicangana: [@Tisandg](https://twitter.com/Tisandg)

## Communication:
* Discord for realtime communication
* Notion for documentation and tasks

# HOW TO RUN THE PROJECT

## Usage

### Pre Requisites

Before running any command, make sure to install dependencies:

```sh
yarn install
```

### Compile
```sh
yarn hardhdat compile
```

### Test
```sh
yarn hardhat test
```

### Test deploy locally
```sh
`yarn hardhat deploy`
```

### Start a local node and deploy everything in that local node
```sh
`yarn hardhat node`
```

### Deploy contract to a test network (requires Mnemonic and Infura API key)
```sh
npx hardhat deploy --network mumbai
```

## Thanks
If you like it than you shoulda put a start ⭐ on it

## License

MIT