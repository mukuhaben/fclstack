import express from "express"
import { query } from "../utils/database.js"
import { requireRole } from "../middleware/auth.js"
import { hashPassword } from "../utils/auth.js"

const router = express.Router()

// GET /api/admin/dashboard - Admin dashboard statistics
router.get("/dashboard", requireRole(["admin"]), async (req, res) => {
  try {
    const { period = "30" } = req.query

    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - Number.parseInt(period))

    // Get various statistics
    const [usersResult, productsResult, ordersResult, revenueResult] = await Promise.all([
      query("SELECT COUNT(*) as total FROM users WHERE is_active = true"),
      query("SELECT COUNT(*) as total FROM products WHERE is_active = true"),
      query("SELECT COUNT(*) as total FROM orders"),
      query("SELECT SUM(total_amount) as total_revenue FROM orders WHERE status = 'delivered'"),
    ])

    const stats = {
      totalSales: Number.parseFloat(revenueResult.rows[0].total_revenue || 0),
      totalOrders: Number.parseInt(ordersResult.rows[0].total),
      totalCustomers: Number.parseInt(usersResult.rows[0].total),
      totalProducts: Number.parseInt(productsResult.rows[0].total),
      lowStockItems: 0, // Will be calculated below
      pendingOrders: 0, // Will be calculated below
    }

    // Get low stock items count
    const lowStockResult = await query(
      "SELECT COUNT(*) as count FROM products WHERE stock_quantity <= alert_quantity AND is_active = true",
    )
    stats.lowStockItems = Number.parseInt(lowStockResult.rows[0].count || 0)

    // Get pending orders count
    const pendingOrdersResult = await query(
      "SELECT COUNT(*) as count FROM orders WHERE status IN ('pending', 'processing')",
    )
    stats.pendingOrders = Number.parseInt(pendingOrdersResult.rows[0].count || 0)

    // Get sales data for charts
    const salesDataResult = await query(
      `
      SELECT DATE(created_at) as date, SUM(total_amount) as sales
      FROM orders 
      WHERE created_at >= $1 AND status = 'delivered'
      GROUP BY DATE(created_at)
      ORDER BY date DESC
      LIMIT 30
    `,
      [startDate],
    )

    // Get inventory data by category
    const inventoryDataResult = await query(`
      SELECT c.name as category, 
             COUNT(p.id) as total_products,
             SUM(CASE WHEN p.stock_quantity > p.alert_quantity THEN 1 ELSE 0 END) as in_stock,
             SUM(CASE WHEN p.stock_quantity <= p.alert_quantity AND p.stock_quantity > 0 THEN 1 ELSE 0 END) as low_stock,
             SUM(CASE WHEN p.stock_quantity = 0 THEN 1 ELSE 0 END) as out_of_stock
      FROM categories c
      LEFT JOIN products p ON c.id = p.category_id AND p.is_active = true
      WHERE c.is_active = true
      GROUP BY c.id, c.name
      ORDER BY c.name
    `)

    res.json({
      success: true,
      metrics: stats,
      salesData: salesDataResult.rows.map((row) => ({
        date: row.date,
        sales: Number.parseFloat(row.sales || 0),
      })),
      inventoryData: inventoryDataResult.rows.map((row) => ({
        category: row.category,
        inStock: Number.parseInt(row.in_stock || 0),
        lowStock: Number.parseInt(row.low_stock || 0),
        outOfStock: Number.parseInt(row.out_of_stock || 0),
        reorderLevel: Number.parseInt(row.low_stock || 0), // For chart compatibility
      })),
      period: Number.parseInt(period),
    })
  } catch (error) {
    console.error("Admin dashboard error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

// GET /api/admin/sales-agents - Get all sales agents
router.get("/sales-agents", requireRole(["admin"]), async (req, res) => {
  try {
    const result = await query(
      `SELECT u.id, u.name, u.email, u.phone, u.is_active, u.created_at, u.profile_image, u.id_scan_url, u.id_number,
              COUNT(cust.id) as customers_count, COALESCE(SUM(o.total_amount), 0) as total_sales
       FROM users u
       LEFT JOIN users cust ON cust.sales_agent_id = u.id
       LEFT JOIN orders o ON o.user_id = cust.id AND o.status = 'delivered'
       WHERE u.role = 'sales_agent'
       GROUP BY u.id, u.name, u.email, u.phone, u.is_active, u.created_at, u.profile_image, u.id_scan_url, u.id_number
       ORDER BY u.created_at DESC`)

    const data = result.rows.map((agent) => ({
      id: agent.id,
      name: agent.name,
      email: agent.email,
      phone: agent.phone,
      status: agent.is_active ? 'active' : 'suspended',
      photo_url: agent.profile_image || null,
      id_scan_url: agent.id_scan_url || null,
      idNumber: agent.id_number || null,
      customers_count: Number.parseInt(agent.customers_count || 0),
      total_sales: Number.parseFloat(agent.total_sales || 0),
      created_at: agent.created_at,
    }))

    res.json({ success: true, data })
  } catch (error) {
    console.error("Sales agents fetch error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

// POST /api/admin/sales-agents - Create new sales agent
router.post("/sales-agents", requireRole(["admin"]), async (req, res) => {
  try {
    const { name, email, phone, idNumber, photo_url, id_scan_url, status } = req.body

    if (!name || !email) {
      return res.status(400).json({ error: "Name and email are required" })
    }

    const existingUser = await query("SELECT id FROM users WHERE email = $1", [email])
    if (existingUser.rows.length > 0) {
      return res.status(409).json({ error: "User with this email already exists" })
    }

    const defaultPassword = "Agent@12345"
    const passwordHash = hashPassword(defaultPassword)

    const result = await query(
      `INSERT INTO users (name, email, phone, password_hash, role, is_active, profile_image, id_scan_url, id_number)
       VALUES ($1,$2,$3,$4,'sales_agent',$5,$6,$7,$8)
       RETURNING id, name, email, phone, is_active, profile_image, id_scan_url, id_number, created_at`,
      [name, email, phone || null, passwordHash, (status || 'active') === 'active', photo_url || null, id_scan_url || null, idNumber || null],
    )

    const a = result.rows[0]
    res.status(201).json({ success: true, data: {
      id: a.id,
      name: a.name,
      email: a.email,
      phone: a.phone,
      status: a.is_active ? 'active' : 'suspended',
      photo_url: a.profile_image,
      id_scan_url: a.id_scan_url,
      idNumber: a.id_number,
      created_at: a.created_at,
    } })
  } catch (error) {
    console.error("Sales agent creation error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

// PUT /api/admin/sales-agents/:id - Update sales agent
router.put("/sales-agents/:id", requireRole(["admin"]), async (req, res) => {
  try {
    const { id } = req.params
    const { name, email, phone, idNumber, photo_url, id_scan_url, status } = req.body
    const result = await query(
      `UPDATE users SET 
          name = COALESCE($1,name),
          email = COALESCE($2,email),
          phone = COALESCE($3,phone),
          id_number = COALESCE($4,id_number),
          profile_image = COALESCE($5,profile_image),
          id_scan_url = COALESCE($6,id_scan_url),
          is_active = COALESCE($7,is_active),
          updated_at = NOW()
       WHERE id = $8 AND role = 'sales_agent'
       RETURNING id, name, email, phone, is_active, profile_image, id_scan_url, id_number, updated_at`,
      [name, email, phone, idNumber, photo_url, id_scan_url, status ? status === 'active' : null, id],
    )
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Sales agent not found" })
    }
    const a = result.rows[0]
    res.json({ success: true, data: {
      id: a.id, name: a.name, email: a.email, phone: a.phone,
      status: a.is_active ? 'active' : 'suspended',
      photo_url: a.profile_image, id_scan_url: a.id_scan_url, idNumber: a.id_number,
    } })
  } catch (error) {
    console.error("Sales agent update error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

// PATCH /api/admin/sales-agents/:id/status - Update status
router.patch("/sales-agents/:id/status", requireRole(["admin"]), async (req, res) => {
  try {
    const { id } = req.params
    const { status } = req.body
    const isActive = status === 'active'
    const result = await query("UPDATE users SET is_active = $1, updated_at = NOW() WHERE id = $2 AND role = 'sales_agent' RETURNING id, is_active", [isActive, id])
    if (result.rows.length === 0) return res.status(404).json({ error: "Sales agent not found" })
    res.json({ success: true, data: { id: result.rows[0].id, status: result.rows[0].is_active ? 'active' : 'suspended' } })
  } catch (error) {
    console.error("Sales agent status update error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

// DELETE /api/admin/sales-agents/:id - Remove sales agent
router.delete("/sales-agents/:id", requireRole(["admin"]), async (req, res) => {
  try {
    const { id } = req.params

    // Check if sales agent exists
    const agentResult = await query("SELECT id, name FROM users WHERE id = $1 AND role = 'sales_agent'", [id])
    if (agentResult.rows.length === 0) {
      return res.status(404).json({ error: "Sales agent not found" })
    }

    // Update customers to remove sales agent assignment
    await query("UPDATE users SET sales_agent_id = NULL WHERE sales_agent_id = $1", [id])

    // Deactivate sales agent instead of deleting
    await query("UPDATE users SET is_active = false WHERE id = $1", [id])

    res.json({
      success: true,
      message: "Sales agent removed successfully and customers have been unassigned",
    })
  } catch (error) {
    console.error("Sales agent removal error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

// GET /api/admin/recent-orders - Get recent orders
router.get("/recent-orders", requireRole(["admin"]), async (req, res) => {
  try {
    const { limit = 10 } = req.query

    const result = await query(
      `
      SELECT o.id, o.total_amount, o.status, o.created_at,
             u.name as customer_name, u.email as customer_email,
             COUNT(oi.id) as item_count
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      LEFT JOIN order_items oi ON o.id = oi.order_id
      GROUP BY o.id, o.total_amount, o.status, o.created_at, u.name, u.email
      ORDER BY o.created_at DESC
      LIMIT $1
    `,
      [limit],
    )

    res.json({
      success: true,
      orders: result.rows.map((order) => ({
        id: order.id,
        totalAmount: Number.parseFloat(order.total_amount),
        status: order.status,
        customerName: order.customer_name,
        customerEmail: order.customer_email,
        itemCount: Number.parseInt(order.item_count || 0),
        createdAt: order.created_at,
      })),
    })
  } catch (error) {
    console.error("Recent orders fetch error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

// GET /api/admin/top-products - Get top products
router.get("/top-products", requireRole(["admin"]), async (req, res) => {
  try {
    const { limit = 10 } = req.query

    const result = await query(
      `
      SELECT p.id, p.product_name as name, p.image_url as imageUrl,
             COUNT(oi.id) as sales,
             SUM(oi.quantity * oi.price) as revenue
      FROM products p
      LEFT JOIN order_items oi ON p.id = oi.product_id
      LEFT JOIN orders o ON oi.order_id = o.id AND o.status = 'delivered'
      WHERE p.is_active = true
      GROUP BY p.id, p.product_name, p.image_url
      ORDER BY sales DESC, revenue DESC
      LIMIT $1
    `,
      [limit],
    )

    res.json({
      success: true,
      products: result.rows.map((product) => ({
        id: product.id,
        name: product.name,
        imageUrl: product.imageUrl,
        sales: Number.parseInt(product.sales || 0),
        revenue: `KSh ${Number.parseFloat(product.revenue || 0).toLocaleString()}`,
        trend: "up", // Default trend
        growth: "+5%", // Default growth
      })),
    })
  } catch (error) {
    console.error("Top products fetch error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

// GET /api/admin/suppliers - Get all suppliers (with subcategories)
router.get("/suppliers", requireRole(["admin"]), async (req, res) => {
  try {
    const result = await query(
      `SELECT s.id, s.name, s.email, s.phone, s.status, s.created_at as createdDate,
              COALESCE(json_agg(sc.name) FILTER (WHERE sc.name IS NOT NULL), '[]') as subcategories
       FROM suppliers s
       LEFT JOIN supplier_subcategories ss ON ss.supplier_id = s.id
       LEFT JOIN subcategories sc ON ss.subcategory_id = sc.id
       WHERE s.deleted_at IS NULL
       GROUP BY s.id
       ORDER BY s.created_at DESC`)

    res.json({
      success: true,
      suppliers: (result.rows || []).map(r => ({...r, subcategories: Array.isArray(r.subcategories) ? r.subcategories : []})),
    })
  } catch (error) {
    console.error("Suppliers fetch error:", error)
    res.status(500).json({
      success: false,
      error: "Internal server error",
      suppliers: [],
    })
  }
})

// POST /api/admin/suppliers - Create new supplier (with subcategories and pack rules)
router.post("/suppliers", requireRole(["admin"]), async (req, res) => {
  try {
    const { name, email, phone, status = "active", subcategories = [], pack_rules = {}, requires_confirmation = true, notes = null, special_offers = null, priority_flag = false } = req.body

    if (!name || !email || !phone) {
      return res.status(400).json({
        success: false,
        error: "Name, email and phone are required",
      })
    }

    const result = await query(
      "INSERT INTO suppliers (name, email, phone, status, requires_confirmation, pack_unit, moq, lead_time_days, notes, special_offers, priority_flag) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *",
      [name, email, phone, status, requires_confirmation, pack_rules.pack_unit || null, pack_rules.moq || null, pack_rules.lead_time_days || null, notes || pack_rules.notes || null, special_offers || null, priority_flag],
    )

    const supplier = result.rows[0]

    // Attach subcategories
    if (Array.isArray(subcategories) && subcategories.length > 0) {
      // subcategories provided as names; map to ids
      for (const subcatName of subcategories) {
        const sc = await query("SELECT sc.id FROM subcategories sc WHERE sc.name ILIKE $1 LIMIT 1", [subcatName])
        if (sc.rows[0]) {
          await query("INSERT INTO supplier_subcategories (supplier_id, subcategory_id) VALUES ($1, $2) ON CONFLICT DO NOTHING", [supplier.id, sc.rows[0].id])
        }
      }
    }

    res.status(201).json({
      success: true,
      supplier,
      message: "Supplier created successfully",
    })
  } catch (error) {
    console.error("Supplier creation error:", error)
    res.status(500).json({
      success: false,
      error: "Internal server error",
    })
  }
})

// PUT /api/admin/suppliers/:id - Update supplier (with subcategories and pack rules)
router.put("/suppliers/:id", requireRole(["admin"]), async (req, res) => {
  try {
    const { id } = req.params
    const { name, email, phone, status, subcategories = [], pack_rules = {}, requires_confirmation, notes, special_offers, priority_flag } = req.body

    const result = await query(
      "UPDATE suppliers SET name = COALESCE($1,name), email = COALESCE($2,email), phone = COALESCE($3,phone), status = COALESCE($4,status), requires_confirmation = COALESCE($5,requires_confirmation), pack_unit = COALESCE($6,pack_unit), moq = COALESCE($7,moq), lead_time_days = COALESCE($8,lead_time_days), notes = COALESCE($9,notes), special_offers = COALESCE($10,special_offers), priority_flag = COALESCE($11,priority_flag), updated_at = NOW() WHERE id = $12 AND deleted_at IS NULL RETURNING *",
      [name, email, phone, status, requires_confirmation, pack_rules.pack_unit, pack_rules.moq, pack_rules.lead_time_days, notes || pack_rules.notes, special_offers, priority_flag, id],
    )

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Supplier not found",
      })
    }

    // Reset and set subcategories mapping
    await query("DELETE FROM supplier_subcategories WHERE supplier_id = $1", [id])
    if (Array.isArray(subcategories)) {
      for (const subcatName of subcategories) {
        const sc = await query("SELECT sc.id FROM subcategories sc WHERE sc.name ILIKE $1 LIMIT 1", [subcatName])
        if (sc.rows[0]) {
          await query("INSERT INTO supplier_subcategories (supplier_id, subcategory_id) VALUES ($1, $2) ON CONFLICT DO NOTHING", [id, sc.rows[0].id])
        }
      }
    }

    res.json({
      success: true,
      supplier: result.rows[0],
      message: "Supplier updated successfully",
    })
  } catch (error) {
    console.error("Supplier update error:", error)
    res.status(500).json({
      success: false,
      error: "Internal server error",
    })
  }
})

// DELETE /api/admin/suppliers/:id - Soft delete supplier
router.delete("/suppliers/:id", requireRole(["admin"]), async (req, res) => {
  try {
    const { id } = req.params

    const result = await query(
      "UPDATE suppliers SET deleted_at = NOW() WHERE id = $1 AND deleted_at IS NULL RETURNING id",
      [id],
    )

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Supplier not found",
      })
    }

    res.json({
      success: true,
      message: "Supplier deleted successfully",
    })
  } catch (error) {
    console.error("Supplier deletion error:", error)
    res.status(500).json({
      success: false,
      error: "Internal server error",
    })
  }
})

// PATCH /api/admin/suppliers/:id/status - update supplier status (suspend/reactivate)
router.patch("/suppliers/:id/status", requireRole(["admin"]), async (req, res) => {
  try {
    const { id } = req.params
    const { status } = req.body
    const result = await query("UPDATE suppliers SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING id, status", [status, id])
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: "Supplier not found" })
    }
    res.json({ success: true, message: "Supplier status updated", data: result.rows[0] })
  } catch (error) {
    console.error("Supplier status update error:", error)
    res.status(500).json({ success: false, error: "Internal server error" })
  }
})

// GET /api/admin/suppliers/validate-email - uniqueness check
router.get("/suppliers/validate-email", requireRole(["admin"]), async (req, res) => {
  try {
    const { email, excludeId } = req.query
    if (!email) return res.json({ unique: false })
    const result = await query("SELECT id FROM suppliers WHERE email = $1 AND deleted_at IS NULL", [email])
    const exists = result.rows.length > 0 && (!excludeId || result.rows[0].id != excludeId)
    res.json({ unique: !exists })
  } catch (error) {
    res.json({ unique: true })
  }
})

// GET /api/admin/customers - Get all customers
router.get("/customers", requireRole(["admin"]), async (req, res) => {
  try {
    const result = await query(
      `SELECT u.id, u.name, u.email, u.phone, u.is_active as status, u.created_at as createdDate,
              sa.name as sales_agent_name,
              COUNT(o.id) as total_orders,
              COALESCE(SUM(o.total_amount), 0) as total_spent
       FROM users u
       LEFT JOIN users sa ON u.sales_agent_id = sa.id
       LEFT JOIN orders o ON u.id = o.user_id AND o.status = 'delivered'
       WHERE u.role = 'customer'
       GROUP BY u.id, u.name, u.email, u.phone, u.is_active, u.created_at, sa.name
       ORDER BY u.created_at DESC`,
    )

    res.json({
      success: true,
      customers: result.rows || [],
    })
  } catch (error) {
    console.error("Customers fetch error:", error)
    res.status(500).json({
      success: false,
      error: "Internal server error",
      customers: [],
    })
  }
})

// GET /api/admin/customer-acquisition - Get customer acquisition data
router.get("/customer-acquisition", requireRole(["admin"]), async (req, res) => {
  try {
    const { period = "12" } = req.query

    const result = await query(
      `
      SELECT 
        TO_CHAR(DATE_TRUNC('month', created_at), 'Mon YYYY') as month,
        COUNT(CASE WHEN created_at >= DATE_TRUNC('month', created_at) THEN 1 END) as newCustomers,
        COUNT(CASE WHEN id IN (
          SELECT DISTINCT user_id FROM orders 
          WHERE created_at < DATE_TRUNC('month', users.created_at)
        ) THEN 1 END) as returningCustomers
      FROM users 
      WHERE role = 'customer' 
        AND created_at >= NOW() - INTERVAL '${period} months'
      GROUP BY DATE_TRUNC('month', created_at)
      ORDER BY DATE_TRUNC('month', created_at) DESC
      LIMIT $1
    `,
      [period],
    )

    res.json({
      success: true,
      data: result.rows.map((row) => ({
        month: row.month,
        newCustomers: Number.parseInt(row.newcustomers || 0),
        returningCustomers: Number.parseInt(row.returningcustomers || 0),
      })),
    })
  } catch (error) {
    console.error("Customer acquisition fetch error:", error)
    res.status(500).json({
      success: false,
      error: "Internal server error",
      data: [],
    })
  }
})

// GET /api/admin/sales-by-category - Get sales breakdown by category
router.get("/sales-by-category", requireRole(["admin"]), async (req, res) => {
  try {
    const { period = "30" } = req.query

    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - Number.parseInt(period))

    const result = await query(
      `
      SELECT 
        c.name as category,
        COALESCE(SUM(oi.quantity * oi.price), 0) as sales,
        COUNT(DISTINCT o.id) as orders,
        COUNT(DISTINCT oi.product_id) as products
      FROM categories c
      LEFT JOIN products p ON c.id = p.category_id AND p.is_active = true
      LEFT JOIN order_items oi ON p.id = oi.product_id
      LEFT JOIN orders o ON oi.order_id = o.id 
        AND o.status = 'delivered' 
        AND o.created_at >= $1 
        AND o.created_at <= $2
      WHERE c.is_active = true
      GROUP BY c.id, c.name
      HAVING COALESCE(SUM(oi.quantity * oi.price), 0) > 0
      ORDER BY sales DESC
    `,
      [startDate, endDate],
    )

    const colors = ["#1976d2", "#4caf50", "#ff9800", "#9c27b0", "#f44336", "#00bcd4", "#795548", "#607d8b"]

    res.json({
      success: true,
      data: result.rows.map((row, index) => ({
        category: row.category,
        sales: Number.parseFloat(row.sales || 0),
        orders: Number.parseInt(row.orders || 0),
        products: Number.parseInt(row.products || 0),
        color: colors[index % colors.length],
      })),
    })
  } catch (error) {
    console.error("Sales by category fetch error:", error)
    res.status(500).json({
      success: false,
      error: "Internal server error",
      data: [],
    })
  }
})

export default router
