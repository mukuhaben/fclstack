import express from "express"
import { query } from "../utils/database.js"
import { authenticateToken } from "../middleware/auth.js"

const router = express.Router()

// GET /api/wallet - Get user's wallet balance and transactions
router.get("/", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id
    const { page = 1, limit = 10 } = req.query
    const offset = (page - 1) * limit

    // Get wallet balance
    const walletResult = await query("SELECT balance FROM wallets WHERE user_id = $1", [userId])

    const balance = walletResult.rows.length > 0 ? Number.parseFloat(walletResult.rows[0].balance) : 0

    // Get transaction history
    const transactionsResult = await query(
      `
      SELECT id, transaction_type, amount, description, created_at
      FROM wallet_transactions
      WHERE user_id = $1
      ORDER BY created_at DESC
      LIMIT $2 OFFSET $3
    `,
      [userId, limit, offset],
    )

    const countResult = await query("SELECT COUNT(*) as total FROM wallet_transactions WHERE user_id = $1", [userId])

    res.json({
      success: true,
      wallet: {
        balance,
        transactions: transactionsResult.rows.map((transaction) => ({
          id: transaction.id,
          type: transaction.transaction_type,
          amount: Number.parseFloat(transaction.amount),
          description: transaction.description,
          createdAt: transaction.created_at,
        })),
      },
      pagination: {
        page: Number.parseInt(page),
        limit: Number.parseInt(limit),
        total: Number.parseInt(countResult.rows[0].total),
        pages: Math.ceil(countResult.rows[0].total / limit),
      },
    })
  } catch (error) {
    console.error("Wallet fetch error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

// POST /api/wallet/add-funds - Add funds to wallet
router.post("/add-funds", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id
    const { amount } = req.body

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: "Valid amount is required" })
    }

    await query("BEGIN")

    try {
      // Create or update wallet
      await query(
        `
        INSERT INTO wallets (user_id, balance) VALUES ($1, $2)
        ON CONFLICT (user_id) DO UPDATE SET balance = wallets.balance + $2
      `,
        [userId, amount],
      )

      // Record transaction
      await query(
        "INSERT INTO wallet_transactions (user_id, transaction_type, amount, description) VALUES ($1, 'credit', $2, 'Funds added to wallet')",
        [userId, amount],
      )

      await query("COMMIT")

      res.json({
        success: true,
        message: "Funds added successfully",
      })
    } catch (error) {
      await query("ROLLBACK")
      throw error
    }
  } catch (error) {
    console.error("Add funds error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

export default router
