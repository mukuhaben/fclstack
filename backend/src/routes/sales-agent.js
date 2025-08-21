import express from "express"
import { query } from "../utils/database.js"
import { requireRole } from "../middleware/auth.js"

const router = express.Router()

// GET /api/sales-agent/dashboard - Sales agent dashboard
router.get("/dashboard", requireRole(["sales_agent"]), async (req, res) => {
  try {
    const salesAgentId = req.user.id
    const { period = "30" } = req.query

    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - Number.parseInt(period))

    // Get dashboard statistics
    const [customersResult, ordersResult, commissionsResult] = await Promise.all([
      query("SELECT COUNT(*) as total FROM users WHERE sales_agent_id = $1 AND is_active = true", [salesAgentId]),
      query(
        `SELECT COUNT(*) as total, COALESCE(SUM(total_amount), 0) as total_sales FROM orders o JOIN users u ON o.user_id = u.id WHERE u.sales_agent_id = $1 AND o.created_at >= $2`,
        [salesAgentId, startDate],
      ),
      query(
        `SELECT COALESCE(SUM(commission_amount), 0) as total_commission FROM commissions WHERE sales_agent_id = $1 AND created_at >= $2`,
        [salesAgentId, startDate],
      ),
    ])

    const stats = {
      customers: { total: Number.parseInt(customersResult.rows[0].total) },
      orders: {
        total: Number.parseInt(ordersResult.rows[0].total),
        totalSales: Number.parseFloat(ordersResult.rows[0].total_sales || 0),
      },
      commissions: { total: Number.parseFloat(commissionsResult.rows[0].total_commission || 0) },
    }

    res.json({
      success: true,
      stats,
      period: Number.parseInt(period),
    })
  } catch (error) {
    console.error("Sales agent dashboard error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

// GET /api/sales-agent/customers - Get assigned customers
router.get("/customers", requireRole(["sales_agent"]), async (req, res) => {
  try {
    const salesAgentId = req.user.id
    const { page = 1, limit = 10, search } = req.query
    const offset = (page - 1) * limit

    let whereClause = "WHERE sales_agent_id = $1"
    const params = [salesAgentId]

    if (search) {
      whereClause += " AND (name ILIKE $" + (params.length + 1) + " OR email ILIKE $" + (params.length + 2) + ")"
      params.push(`%${search}%`, `%${search}%`)
    }

    const result = await query(
      `SELECT u.id, u.name, u.email, u.phone, u.created_at, COUNT(o.id) as order_count, COALESCE(SUM(o.total_amount), 0) as total_spent FROM users u LEFT JOIN orders o ON u.id = o.user_id ${whereClause} GROUP BY u.id, u.name, u.email, u.phone, u.created_at ORDER BY u.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
      [...params, limit, offset],
    )

    const countResult = await query(`SELECT COUNT(*) as total FROM users ${whereClause}`, params)

    res.json({
      success: true,
      customers: result.rows.map((customer) => ({
        id: customer.id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        orderCount: Number.parseInt(customer.order_count),
        totalSpent: Number.parseFloat(customer.total_spent),
        createdAt: customer.created_at,
      })),
      pagination: {
        page: Number.parseInt(page),
        limit: Number.parseInt(limit),
        total: Number.parseInt(countResult.rows[0].total),
        pages: Math.ceil(countResult.rows[0].total / limit),
      },
    })
  } catch (error) {
    console.error("Sales agent customers error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

// GET /api/sales-agent/orders - Get orders from assigned customers
router.get("/orders", requireRole(["sales_agent"]), async (req, res) => {
  try {
    const salesAgentId = req.user.id
    const { page = 1, limit = 10, status } = req.query
    const offset = (page - 1) * limit

    let whereClause = "WHERE u.sales_agent_id = $1"
    const params = [salesAgentId]

    if (status) {
      whereClause += " AND o.status = $" + (params.length + 1)
      params.push(status)
    }

    const result = await query(
      `SELECT o.id, o.order_number, o.total_amount, o.status, o.created_at, u.name as customer_name, u.email as customer_email FROM orders o JOIN users u ON o.user_id = u.id ${whereClause} ORDER BY o.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
      [...params, limit, offset],
    )

    const countResult = await query(
      `SELECT COUNT(*) as total FROM orders o JOIN users u ON o.user_id = u.id ${whereClause}`,
      params,
    )

    res.json({
      success: true,
      orders: result.rows.map((order) => ({
        id: order.id,
        orderNumber: order.order_number,
        totalAmount: Number.parseFloat(order.total_amount),
        status: order.status,
        customerName: order.customer_name,
        customerEmail: order.customer_email,
        createdAt: order.created_at,
      })),
      pagination: {
        page: Number.parseInt(page),
        limit: Number.parseInt(limit),
        total: Number.parseInt(countResult.rows[0].total),
        pages: Math.ceil(countResult.rows[0].total / limit),
      },
    })
  } catch (error) {
    console.error("Sales agent orders error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

// GET /api/sales-agent/commissions - Get commission history
router.get("/commissions", requireRole(["sales_agent"]), async (req, res) => {
  try {
    const salesAgentId = req.user.id
    const { page = 1, limit = 10 } = req.query
    const offset = (page - 1) * limit

    const result = await query(
      `SELECT c.id, c.order_id, c.commission_amount, c.commission_rate, c.created_at, o.order_number, o.total_amount as order_total, u.name as customer_name FROM commissions c JOIN orders o ON c.order_id = o.id JOIN users u ON o.user_id = u.id WHERE c.sales_agent_id = $1 ORDER BY c.created_at DESC LIMIT $2 OFFSET $3`,
      [salesAgentId, limit, offset],
    )

    const countResult = await query("SELECT COUNT(*) as total FROM commissions WHERE sales_agent_id = $1", [
      salesAgentId,
    ])

    res.json({
      success: true,
      commissions: result.rows.map((commission) => ({
        id: commission.id,
        orderId: commission.order_id,
        orderNumber: commission.order_number,
        orderTotal: Number.parseFloat(commission.order_total),
        commissionAmount: Number.parseFloat(commission.commission_amount),
        commissionRate: Number.parseFloat(commission.commission_rate),
        customerName: commission.customer_name,
        createdAt: commission.created_at,
      })),
      pagination: {
        page: Number.parseInt(page),
        limit: Number.parseInt(limit),
        total: Number.parseInt(countResult.rows[0].total),
        pages: Math.ceil(countResult.rows[0].total / limit),
      },
    })
  } catch (error) {
    console.error("Sales agent commissions error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

// POST /api/sales-agent/register-customer - Sales agent registers a new customer
router.post("/register-customer", requireRole(["sales_agent"]), async (req, res) => {
  try {
    const salesAgentId = req.user.id
    const { first_name, last_name, email, password, phone } = req.body

    if (!first_name || !last_name || !email || !password) {
      return res.status(400).json({ error: "First name, last name, email, and password are required" })
    }

    const registrationData = {
      first_name,
      last_name,
      email,
      password,
      phone,
      salesAgentId,
      registrationType: "agent",
    }

    // Use internal API call or shared registration logic
    const authModule = await import("./auth.js")

    // Create a mock request/response for internal use
    const mockReq = {
      body: registrationData,
      user: req.user,
    }

    const mockRes = {
      status: (code) => ({
        json: (data) => {
          if (code === 201) {
            res.status(201).json({
              success: true,
              message: "Customer registered successfully",
              customer: data.user,
            })
          } else {
            res.status(code).json(data)
          }
        },
      }),
      json: (data) => res.json(data),
    }

    // Call the registration logic
    return authModule.default.stack[1].handle(mockReq, mockRes)
  } catch (error) {
    console.error("Sales agent customer registration error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

export default router
