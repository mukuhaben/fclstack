import express from "express"
import { query } from "../utils/database.js"
import { authenticateToken } from "../middleware/auth.js"

const router = express.Router()

// GET /api/cart - Get user's cart
router.get("/", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id

    const result = await query(
      `
      SELECT c.id, c.quantity, c.created_at,
             p.id as product_id, p.name, p.price, p.stock_quantity,
             pi.image_url
      FROM cart c
      JOIN products p ON c.product_id = p.id
      LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_primary = true
      WHERE c.user_id = $1 AND p.is_active = true
      ORDER BY c.created_at DESC
    `,
      [userId],
    )

    const cartItems = result.rows.map((item) => ({
      id: item.id,
      quantity: item.quantity,
      product: {
        id: item.product_id,
        name: item.name,
        price: Number.parseFloat(item.price),
        stockQuantity: item.stock_quantity,
        imageUrl: item.image_url,
      },
      subtotal: Number.parseFloat(item.price) * item.quantity,
      createdAt: item.created_at,
    }))

    const total = cartItems.reduce((sum, item) => sum + item.subtotal, 0)

    res.json({
      success: true,
      cart: {
        items: cartItems,
        total: total,
        itemCount: cartItems.length,
      },
    })
  } catch (error) {
    console.error("Cart fetch error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

// POST /api/cart - Add item to cart
router.post("/", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id
    const { productId, quantity = 1 } = req.body

    if (!productId || quantity < 1) {
      return res.status(400).json({ error: "Valid product ID and quantity are required" })
    }

    // Check if product exists and is active
    const productResult = await query(
      "SELECT id, name, price, stock_quantity FROM products WHERE id = $1 AND is_active = true",
      [productId],
    )

    if (productResult.rows.length === 0) {
      return res.status(404).json({ error: "Product not found" })
    }

    const product = productResult.rows[0]

    // Check if there's enough stock
    if (product.stock_quantity < quantity) {
      return res.status(400).json({ error: "Insufficient stock" })
    }

    // Check if item already exists in cart
    const existingItem = await query("SELECT id, quantity FROM cart WHERE user_id = $1 AND product_id = $2", [
      userId,
      productId,
    ])

    if (existingItem.rows.length > 0) {
      // Update existing item
      const newQuantity = existingItem.rows[0].quantity + quantity

      if (product.stock_quantity < newQuantity) {
        return res.status(400).json({ error: "Insufficient stock for requested quantity" })
      }

      await query("UPDATE cart SET quantity = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2", [
        newQuantity,
        existingItem.rows[0].id,
      ])
    } else {
      // Add new item
      await query("INSERT INTO cart (user_id, product_id, quantity) VALUES ($1, $2, $3)", [userId, productId, quantity])
    }

    res.json({
      success: true,
      message: "Item added to cart successfully",
    })
  } catch (error) {
    console.error("Add to cart error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

// PUT /api/cart/:id - Update cart item quantity
router.put("/:id", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id
    const { id } = req.params
    const { quantity } = req.body

    if (!quantity || quantity < 1) {
      return res.status(400).json({ error: "Valid quantity is required" })
    }

    // Check if cart item belongs to user
    const cartResult = await query(
      "SELECT c.id, c.product_id, p.stock_quantity FROM cart c JOIN products p ON c.product_id = p.id WHERE c.id = $1 AND c.user_id = $2",
      [id, userId],
    )

    if (cartResult.rows.length === 0) {
      return res.status(404).json({ error: "Cart item not found" })
    }

    const cartItem = cartResult.rows[0]

    // Check stock availability
    if (cartItem.stock_quantity < quantity) {
      return res.status(400).json({ error: "Insufficient stock" })
    }

    await query("UPDATE cart SET quantity = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2", [quantity, id])

    res.json({
      success: true,
      message: "Cart item updated successfully",
    })
  } catch (error) {
    console.error("Cart update error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

// DELETE /api/cart/:id - Remove item from cart
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id
    const { id } = req.params

    const result = await query("DELETE FROM cart WHERE id = $1 AND user_id = $2 RETURNING id", [id, userId])

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Cart item not found" })
    }

    res.json({
      success: true,
      message: "Item removed from cart successfully",
    })
  } catch (error) {
    console.error("Cart item removal error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

// DELETE /api/cart - Clear entire cart
router.delete("/", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id

    await query("DELETE FROM cart WHERE user_id = $1", [userId])

    res.json({
      success: true,
      message: "Cart cleared successfully",
    })
  } catch (error) {
    console.error("Cart clear error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

export default router
