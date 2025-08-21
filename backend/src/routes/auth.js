import express from "express"
import { query } from "../utils/database.js"
import { comparePassword, generateToken, hashPassword } from "../utils/auth.js"
import { authenticateToken } from "../middleware/auth.js"

const router = express.Router()

// POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" })
    }

    // Find user by email
    const result = await query("SELECT id, email, password_hash, role, name, is_active FROM users WHERE email = $1", [
      email,
    ])

    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Invalid credentials" })
    }

    const user = result.rows[0]
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" })
    }

    if (!user.is_active) {
      return res.status(401).json({ error: "Account is deactivated" })
    }

    // Verify password
    if (!comparePassword(password, user.password_hash)) {
      return res.status(401).json({ error: "Invalid credentials" })
    }

    // Generate JWT token
    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    })

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
      },
    })
  } catch (error) {
    console.error("Login error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

// POST /api/auth/register
router.post("/register", async (req, res) => {
  try {
    const { email, password, first_name, last_name, name, phone, salesAgentId, registrationType } = req.body

    // Combine first_name and last_name if provided separately, otherwise use name
    const fullName = first_name && last_name ? `${first_name} ${last_name}` : name

    if (!email || !password || !fullName) {
      return res.status(400).json({ error: "Email, password, and name are required" })
    }

    // Check if user already exists
    const existingUser = await query("SELECT id FROM users WHERE email = $1", [email])

    if (existingUser.rows.length > 0) {
      return res.status(409).json({ error: "User already exists with this email" })
    }

    // Hash password
    const passwordHash = hashPassword(password)

    await query("BEGIN")

    try {
      // Create user with optional sales agent assignment
      const result = await query(
        `INSERT INTO users (email, password_hash, name, phone, role, sales_agent_id) 
         VALUES ($1, $2, $3, $4, 'customer', $5) 
         RETURNING id, email, name, role`,
        [email, passwordHash, fullName, phone || null, salesAgentId || null],
      )

      if (!result.rows || result.rows.length === 0) {
        throw new Error("Failed to create user")
      }

      const user = result.rows[0]

      // Create wallet for new user
      await query("INSERT INTO user_wallets (user_id, balance) VALUES ($1, 0.00)", [user.id])

      if (salesAgentId && registrationType === "agent") {
        await query(
          "INSERT INTO customer_assignments (customer_id, sales_agent_id, assigned_at, is_active) VALUES ($1, $2, CURRENT_TIMESTAMP, true)",
          [user.id, salesAgentId],
        )
      }

      await query("COMMIT")

      // Generate JWT token
      const token = generateToken({
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
      })

      res.status(201).json({
        success: true,
        token,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          name: user.name,
        },
      })
    } catch (error) {
      await query("ROLLBACK")
      throw error
    }
  } catch (error) {
    console.error("Registration error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

// GET /api/auth/profile
router.get("/profile", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id

    const result = await query("SELECT id, email, name, phone, role, created_at FROM users WHERE id = $1", [userId])

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" })
    }

    res.json({
      success: true,
      user: result.rows[0],
    })
  } catch (error) {
    console.error("Profile fetch error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

// PUT /api/auth/profile
router.put("/profile", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id
    const { name, phone } = req.body

    if (!name) {
      return res.status(400).json({ error: "Name is required" })
    }

    const result = await query(
      "UPDATE users SET name = $1, phone = $2 WHERE id = $3 RETURNING id, email, name, phone, role",
      [name, phone || null, userId],
    )

    res.json({
      success: true,
      user: result.rows[0],
      message: "Profile updated successfully",
    })
  } catch (error) {
    console.error("Profile update error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

// POST /api/auth/change-password and /api/auth/update-password
router.post("/change-password", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id
    const { currentPassword, current_password, newPassword, new_password } = req.body

    const currentPwd = currentPassword || current_password
    const newPwd = newPassword || new_password

    if (!currentPwd || !newPwd) {
      return res.status(400).json({ error: "Current password and new password are required" })
    }

    // Get current password hash
    const userResult = await query("SELECT password_hash FROM users WHERE id = $1", [userId])

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: "User not found" })
    }

    const userPasswordHash = userResult.rows[0]?.password_hash
    if (!userPasswordHash) {
      return res.status(500).json({ error: "User password data is corrupted" })
    }

    // Verify current password
    if (!comparePassword(currentPwd, userPasswordHash)) {
      return res.status(401).json({ error: "Current password is incorrect" })
    }

    // Hash new password
    const newPasswordHash = hashPassword(newPwd)

    // Update password
    await query("UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2", [
      newPasswordHash,
      userId,
    ])

    res.json({
      success: true,
      message: "Password changed successfully",
    })
  } catch (error) {
    console.error("Password change error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

// Alias for update-password endpoint
router.patch("/update-password", authenticateToken, async (req, res) => {
  // Reuse the same logic as change-password
  req.url = "/change-password"
  req.method = "POST"
  return router.handle(req, res)
})

export default router
