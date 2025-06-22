import { Request, Response } from "express";
import { getMainAssets, saveQueryHistory } from "../services/assetService";

export async function getAccountSummary(req: Request, res: Response) {
  const { address } = req.params;
  if (!address || !/^0x[a-fA-F0-9]{40}$/.test(address)) {
    res.status(400).json({ error: "Invalid address format" });
    return;
  }
  try {
    const summary = await getMainAssets(address);
    await saveQueryHistory(address, summary);
    res.json(summary);
  } catch (err) {
    console.error("getAccountSummary error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}
