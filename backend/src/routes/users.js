import express from "express"
import { query } from "../utils/database.js"
import { authenticateToken, requireRole } from "../middleware/auth.js"
import { resolvePublicUrl } from "../utils/images.js"

const router = express.Router()

// GET /api/users/profile - Get current user's profile
router.get("/profile", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id

    const result = await query(
      `SELECT id, name, email, phone, role, is_active, created_at, updated_at,
              profile_image as avatar_url
       FROM users WHERE id = $1`,
      [userId],
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" })
    }

    const user = result.rows[0]

    // Split name into first_name and last_name for frontend compatibility
    const nameParts = user.name ? user.name.split(" ") : ["", ""]
    const profileData = {
      ...user,
      first_name: nameParts[0] || "",
      last_name: nameParts.slice(1).join(" ") || "",
      phone_number: user.phone, // Frontend expects phone_number
    }

    // Ensure avatar_url is a public URL
    profileData.avatar_url = resolvePublicUrl(profileData.avatar_url, "profiles")

    res.json({
      success: true,
      data: profileData,
    })
  } catch (error) {
    console.error("Profile fetch error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

// PUT /api/users/profile - Update current user's profile
router.put("/profile", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id
    const { first_name, last_name, name, phone, phone_number } = req.body

    // Handle both name formats - combine first_name/last_name or use name directly
    const fullName = first_name && last_name ? `${first_name} ${last_name}` : name
    const phoneValue = phone_number || phone // Handle both field names

    if (!fullName) {
      return res.status(400).json({ error: "Name is required" })
    }

    const result = await query(
      `UPDATE users SET name = $1, phone = $2, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $3 
       RETURNING id, name, email, phone, role, updated_at`,
      [fullName, phoneValue || null, userId],
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" })
    }

    const user = result.rows[0]
    const nameParts = user.name ? user.name.split(" ") : ["", ""]
    const profileData = {
      ...user,
      first_name: nameParts[0] || "",
      last_name: nameParts.slice(1).join(" ") || "",
      phone_number: user.phone,
    }

    res.json({
      success: true,
      data: profileData,
      message: "Profile updated successfully",
    })
  } catch (error) {
    console.error("Profile update error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})
// DELETE /api/users/account - Deactivate current user's account
router.delete("/account", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { confirmation } = req.body;

    if (confirmation !== "DELETE") {
      return res.status(400).json({ error: "Invalid confirmation. Please type 'DELETE' to confirm." });
    }

    const result = await query(
      `UPDATE users 
       SET is_active = false, updated_at = CURRENT_TIMESTAMP
       WHERE id = $1 RETURNING id, email`,
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      success: true,
      message: "Account deactivated successfully",
    });
  } catch (error) {
    console.error("Account deletion error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});


// GET /api/users - Get all users (admin only)
router.get("/", requireRole(["admin"]), async (req, res) => {
  try {
    const { page = 1, limit = 10, role, search } = req.query
    const offset = (page - 1) * limit

    let whereClause = "WHERE 1=1"
    const params = []

    if (role) {
      whereClause += " AND role = $" + (params.length + 1)
      params.push(role)
    }

    if (search) {
      whereClause += " AND (name ILIKE $" + (params.length + 1) + " OR email ILIKE $" + (params.length + 2) + ")"
      params.push(`%${search}%`, `%${search}%`)
    }

    const result = await query(
      `SELECT id, name, email, phone, role, is_active, created_at, updated_at 
       FROM users ${whereClause} 
       ORDER BY created_at DESC 
       LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
      [...params, limit, offset],
    )

    const countResult = await query(`SELECT COUNT(*) as total FROM users ${whereClause}`, params)

    res.json({
      success: true,
      users: result.rows,
      pagination: {
        page: Number.parseInt(page),
        limit: Number.parseInt(limit),
        total: Number.parseInt(countResult.rows[0].total),
        pages: Math.ceil(countResult.rows[0].total / limit),
      },
    })
  } catch (error) {
    console.error("Users fetch error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

// GET /api/users/:id - Get user by ID
router.get("/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params

    // Users can only access their own data unless they're admin
    if (req.user.role !== "admin" && req.user.id !== Number.parseInt(id)) {
      return res.status(403).json({ error: "Access denied" })
    }

    const result = await query(
      "SELECT id, name, email, phone, role, is_active, created_at, updated_at FROM users WHERE id = $1",
      [id],
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" })
    }

    res.json({
      success: true,
      user: result.rows[0],
    })
  } catch (error) {
    console.error("User fetch error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

// PUT /api/users/:id - Update user
router.put("/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params
    const { name, email, phone } = req.body

    // Users can only update their own data unless they're admin
    if (req.user.role !== "admin" && req.user.id !== Number.parseInt(id)) {
      return res.status(403).json({ error: "Access denied" })
    }

    if (!name || !email) {
      return res.status(400).json({ error: "Name and email are required" })
    }

    // Check if email is already taken by another user
    const existingUser = await query("SELECT id FROM users WHERE email = $1 AND id != $2", [email, id])

    if (existingUser.rows.length > 0) {
      return res.status(409).json({ error: "Email already taken" })
    }

    const result = await query(
      "UPDATE users SET name = $1, email = $2, phone = $3, updated_at = CURRENT_TIMESTAMP WHERE id = $4 RETURNING id, name, email, phone, role, updated_at",
      [name, email, phone || null, id],
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" })
    }

    res.json({
      success: true,
      user: result.rows[0],
      message: "User updated successfully",
    })
  } catch (error) {
    console.error("User update error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

// DELETE /api/users/:id - Deactivate user (admin only)
router.delete("/:id", requireRole(["admin"]), async (req, res) => {
  try {
    const { id } = req.params

    const result = await query(
      "UPDATE users SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING id, name, email",
      [id],
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" })
    }

    res.json({
      success: true,
      message: "User deactivated successfully",
    })
  } catch (error) {
    console.error("User deactivation error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

export default router
