# Web3 Asset Dashboard
A full-stack dashboard to aggregate, analyze, and visualize on-chain assets (ETH, ERC20, NFTs) for any Ethereum address.

## Features
- **ETH/ERC20/NFT Aggregation** — Get real-time holdings and valuation for any Ethereum address
- **NFT Gallery** — Preview NFT images and metadata
- **Asset Valuation** — Auto-updated prices and total value
- 
## Quick Start

### 1. Clone
```bash
git clone https://github.com/yourname/web3-asset-dashboard.git
cd web3-asset-dashboard
```

### 2. Start Backend
```bash
cd backend
yarn install
cp .env.example .env   # Fill in your Alchemy API key, etc.
yarn dev
```
Backend runs at http://localhost:3001

### 3. Start Frontend
```bash
cd ../frontend
yarn install
yarn dev
```
Frontend runs at http://localhost:5173 (default)

