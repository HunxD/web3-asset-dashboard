import React, { useState } from "react";
import axios from "axios";

type Erc20Asset = {
  symbol: string;
  name: string;
  balance: number;
  price: number;
  value: number;
  contract: string;
  logo?: string;
};

type EthAsset = {
  balance: number;
  price: number;
  value: number;
};

type NftAsset = {
  contract: string;
  name: string;
  tokenId: string;
  image?: string;
};

type ApiResp = {
  address: string;
  eth: EthAsset;
  erc20: Erc20Asset[];
  nfts: NftAsset[];
  totalValue: number;
};

const API_BASE = "http://localhost:3001/api/account";

const ERC20_MIN_BALANCE = 0.0001; // Minimum balance threshold to show

const App = () => {
  const [address, setAddress] = useState("");
  const [result, setResult] = useState<ApiResp | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleQuery = async () => {
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const resp = await axios.get<ApiResp>(`${API_BASE}/${address}/summary`);
      setResult(resp.data);
    } catch (e) {
      setError("Invalid address or network error.");
    }
    setLoading(false);
  };

  // Filter ERC20 by minimum balance
  const filteredErc20 =
    result?.erc20.filter((asset) => asset.balance >= ERC20_MIN_BALANCE) ?? [];

  return (
    <div
      className="min-h-screen flex flex-col items-center p-6"
      style={{
        background:
          "linear-gradient(135deg,#221451 0%,#152144 70%,#0c2556 100%)",
      }}
    >
      {/* Title */}
      <h1 className="text-4xl font-extrabold mb-8 bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-500 text-transparent bg-clip-text animate-pulse drop-shadow-lg">
        Web3 Asset Dashboard
      </h1>

      {/* Address input */}
      <div className="flex gap-2 mb-6">
        <input
          className="border-none outline-none rounded-xl px-4 py-2 w-80 shadow bg-white/20 text-white placeholder:text-gray-300"
          placeholder="Enter Ethereum address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
        />
        <button
          className="bg-gradient-to-tr from-blue-500 via-cyan-400 to-purple-500 shadow-lg text-white px-7 py-2 rounded-xl font-bold hover:scale-105 transition disabled:opacity-40"
          onClick={handleQuery}
          disabled={loading || !/^0x[a-fA-F0-9]{40}$/.test(address.trim())}
        >
          {loading ? "Loading..." : "Query"}
        </button>
      </div>

      {error && (
        <div className="text-red-400 bg-white/20 rounded-lg px-4 py-2 mb-4">
          {error}
        </div>
      )}

      {result && (
        <div className="w-full max-w-2xl mt-6 space-y-8">
          {/* Total value */}
          <div className="backdrop-blur-md bg-white/10 border border-white/20 shadow-2xl rounded-2xl p-8 flex flex-col items-center">
            <div className="text-lg text-white/80 mb-1">Total Asset Value</div>
            <div
              className="text-4xl font-extrabold"
              style={{
                color: "#13E0F5",
                textShadow: "0 0 24px #6b5cff",
                letterSpacing: "1px",
              }}
            >
              $
              {result.totalValue.toLocaleString(undefined, {
                maximumFractionDigits: 2,
              })}
            </div>
          </div>

          {/* ETH asset */}
          <div className="backdrop-blur-md bg-white/10 border border-white/20 shadow-xl rounded-2xl p-6 flex items-center gap-6">
            <img
              src="https://s2.coinmarketcap.com/static/img/coins/64x64/1027.png"
              onError={(e) =>
                (e.currentTarget.src =
                  "https://assets.trustwalletapp.com/blockchains/ethereum/info/logo.png")
              }
              className="w-14 h-14 rounded-full shadow-lg bg-white/20"
              alt="ETH"
            />
            <div className="flex-1">
              <div className="text-white font-bold text-xl flex items-center gap-2">
                ETH
                <span className="bg-gradient-to-r from-blue-400 to-purple-400 text-xs font-mono rounded px-2 py-0.5 ml-2">
                  {result.address.slice(0, 6)}...{result.address.slice(-6)}
                </span>
              </div>
              <div className="text-gray-200 mt-1 text-sm">
                Amount:{" "}
                <span className="font-mono">
                  {result.eth.balance.toFixed(4)}
                </span>
              </div>
              <div className="text-gray-200 text-sm">
                Price:{" "}
                <span className="font-mono">
                  ${result.eth.price.toFixed(2)}
                </span>
              </div>
              <div className="text-gray-200 text-sm">
                Value:{" "}
                <span className="font-mono">
                  ${result.eth.value.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* ERC20 assets */}
          <div className="backdrop-blur-md bg-white/10 border border-white/20 shadow-xl rounded-2xl p-6">
            <div className="font-bold text-white mb-3">Main ERC20 Assets</div>
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-white/10 text-cyan-200">
                  <th className="px-2 py-1 font-medium">Token</th>
                  <th className="px-2 py-1 font-medium">Balance</th>
                  <th className="px-2 py-1 font-medium">Price</th>
                  <th className="px-2 py-1 font-medium">Value</th>
                  <th className="px-2 py-1 font-medium">Contract</th>
                </tr>
              </thead>
              <tbody>
                {filteredErc20.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center text-gray-400 py-2">
                      No ERC20 assets found
                    </td>
                  </tr>
                ) : (
                  filteredErc20.map((asset) => (
                    <tr key={asset.contract} className="hover:bg-white/5">
                      <td className="flex items-center gap-2 py-1">
                        {asset.logo ? (
                          <img
                            src={asset.logo}
                            className="w-6 h-6 rounded-full shadow"
                            alt={asset.symbol}
                          />
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-gray-400 opacity-30" />
                        )}
                        <span className="text-white font-bold">
                          {asset.symbol}
                        </span>
                      </td>
                      <td className="font-mono text-cyan-200">
                        {asset.balance.toFixed(6)}
                      </td>
                      <td className="font-mono text-purple-300">
                        ${asset.price.toFixed(4)}
                      </td>
                      <td className="font-mono text-green-300">
                        ${asset.value.toFixed(4)}
                      </td>
                      <td>
                        <a
                          className="font-mono text-blue-400 hover:underline text-xs"
                          href={`https://etherscan.io/token/${asset.contract}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {asset.contract.slice(0, 8)}...
                          {asset.contract.slice(-4)}
                        </a>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* NFT Gallery */}
          {result.nfts && result.nfts.length > 0 && (
            <div className="backdrop-blur-md bg-white/10 border border-white/20 shadow-xl rounded-2xl p-6">
              <div className="font-bold text-white mb-3">NFT Collection</div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {result.nfts.map((nft) => (
                  <div
                    key={nft.contract + nft.tokenId}
                    className="flex flex-col items-center"
                  >
                    <img
                      src={nft.image}
                      alt={nft.name}
                      className="w-28 h-28 object-cover rounded-xl mb-2 border border-white/20 shadow"
                      onError={(e) =>
                        (e.currentTarget.src = "/default-nft.png")
                      }
                    />
                    <div className="text-xs text-white text-center break-all">
                      {nft.name}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default App;
