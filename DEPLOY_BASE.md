# Deploy GrassDiscoveries to Base

## Prerequisites
- Node.js 18+
- A Base account with ~0.001 ETH (for gas)
- Hardhat installed

## Steps

### 1. Install dependencies
```bash
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox
npm install @openzeppelin/contracts
```

### 2. Create `hardhat.config.js` (if not exists)
```javascript
require("@nomicfoundation/hardhat-toolbox");

module.exports = {
    solidity: "0.8.20",
    networks: {
        base: {
            url: "https://mainnet.base.org",
            accounts: [process.env.PRIVATE_KEY]
        }
    }
};
```

### 3. Set environment variable
```bash
export PRIVATE_KEY=your_private_key_here
```
Or add to `.env` and use `dotenv`:
```bash
npm install dotenv
```

### 4. Deploy
```bash
npx hardhat run scripts/deploy-base.js --network base
```

## Output
You'll get the contract address. Save it — you'll need it for `grass.html` and `jupiter.html`.

## Verify (optional)
```bash
npx hardhat verify --network base CONTRACT_ADDRESS "https://gateway.pinata.cloud/ipfs/"
```

## Contract Features
- `mintDiscovery(to, name, rarity, location)` — Mint a grass discovery
- `mintNetwork(to, title, tokenCount, connectionCount)` — Mint a Jupiter network config
- `setBaseURI(uri)` — Update metadata base URI

## Gas Estimate
- Deployment: ~0.0008 ETH
- Each mint: ~0.0003 ETH
