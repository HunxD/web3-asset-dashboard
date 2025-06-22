import express from "express";
import { getAccountSummary } from "../controllers/accountController";

const router = express.Router();

router.get("/:address/summary", getAccountSummary);

export default router;
