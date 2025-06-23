import { Alchemy, Network } from "alchemy-sdk";
import axios from "axios";
import { NftFilters } from "alchemy-sdk";
import pool from "../utils/database";
import redis from "../utils/redis";

const MAIN_TOKENS = ["ETH", "USDT", "USDC", "DAI", "LINK", "WBTC"];

const alchemy = new Alchemy({
  apiKey: process.env.ALCHEMY_API_KEY!,
  network: Network.ETH_MAINNET,
});

/**
 * Get ERC20 tokens held by a specific address
 * @param address The wallet address to query
 * @returns An array of ERC20 tokens
 */
async function getERC20TokensByAddress(address: string) {
  const result = await alchemy.core.getTokensForOwner(address);
  return result.tokens.filter(
    (token) => token.symbol && MAIN_TOKENS.includes(token.symbol)
  );
}

/**
 * Get the price of a specific token
 * @param symbol The symbol of the token to query
 * @returns An object containing the currency, value, and last updated timestamp
 */
async function getTokenPriceBySymbol() {
  return await alchemy.prices.getTokenPriceBySymbol(MAIN_TOKENS);
}

/**
 * Get NFTs held by a specific address
 * @param address The wallet address to query
 * @returns An array of NFTs owned by the address
 */
async function getNftByAddress(address: string) {
  const nftsResult = await alchemy.nft.getNftsForOwner(address);
  const nfts = nftsResult.ownedNfts.slice(0, 12).map((nft) => ({
    name:
      nft.contract?.openSeaMetadata?.collectionName ||
      nft.contract?.name ||
      `${nft.contract?.symbol} #${nft.tokenId}` ||
      `#${nft.tokenId}`,
    image:
      nft.contract?.openSeaMetadata?.imageUrl ||
      nft.collection?.bannerImageUrl ||
      "https://static.alchemyapi.io/images/assets/unknown.png",
    contract: nft.contract.address,
    tokenId: nft.tokenId,
  }));
  return nfts;
}

/**
 * Get main assets held by a specific address
 * @param address  The wallet address to query
 * @returns An object containing the main assets held by the address
 */
export async function getMainAssets(address: string) {
  const cacheKey = `account_summary:${address}`;
  const cached = await redis.get(cacheKey);
  if (cached) {
    return JSON.parse(cached);
  }

  const pricesArray = await getTokenPriceBySymbol();
  const prices: Record<string, number> = {};
  pricesArray.data.forEach((item) => {
    prices[item.symbol] = Number(item.prices[0]?.value) || 0;
  });

  const ethRaw = await alchemy.core.getBalance(address);
  const ethBalance = Number(ethRaw) / 1e18;
  const ethValue = ethBalance * (prices["ETH"] ?? 0);

  const tokensResult = await getERC20TokensByAddress(address);
  const erc20 = tokensResult.map((token) => {
    const balance = Number(token.balance) / 10 ** (token.decimals ?? 0);
    const price = token.symbol ? prices[token.symbol] ?? 0 : 0;
    return {
      symbol: token.symbol,
      name: token.name,
      balance,
      price,
      value: balance * price,
      contract: token.contractAddress,
      logo: token.logo,
    };
  });

  const totalValue = ethValue + erc20.reduce((acc, t) => acc + t.value, 0);
  const nfts = await getNftByAddress(address);

  const summary = {
    address,
    eth: {
      balance: ethBalance,
      price: prices["ETH"] ?? 0,
      value: ethValue,
    },
    erc20,
    nfts,
    totalValue,
  };
  await redis.set(cacheKey, JSON.stringify(summary), "EX", 300);
  return summary;
}

/**
 * Get query history for a specific address
 * @param address The wallet address to query
 * @param snapshot The snapshot of the queried data
 */
export async function saveQueryHistory(address: string, snapshot: object) {
  await pool.query(
    "INSERT INTO address_query_history (address, snapshot) VALUES (?, ?)",
    [address, JSON.stringify(snapshot)]
  );
}

export async function getHistory(address: string) {
  const [rows] = await pool.query(
    "SELECT * FROM address_query_history WHERE address=? ORDER BY queried_at DESC LIMIT 20",
    [address]
  );
  return rows;
}
