import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization
  const token = authHeader && authHeader.startsWith("Bearer ") ? authHeader.substring(7) : null

  if (!token) {
    return res.status(401).json({ error: "Access token required" })
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    req.user = decoded
    next()
  } catch (error) {
    console.error("Token verification error:", error)
    return res.status(403).json({ error: "Invalid or expired token" })
  }
}

export const requireRole = (roles) => {
  return (req, res, next) => {
    // First authenticate the token
    const authHeader = req.headers.authorization
    const token = authHeader && authHeader.startsWith("Bearer ") ? authHeader.substring(7) : null

    if (!token) {
      return res.status(401).json({ error: "Access token required" })
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET)

      // Check if user has required role
      if (!roles.includes(decoded.role)) {
        return res.status(403).json({
          error: "Insufficient permissions",
          required: roles,
          current: decoded.role,
        })
      }

      req.user = decoded
      next()
    } catch (error) {
      console.error("Token verification error:", error)
      return res.status(403).json({ error: "Invalid or expired token" })
    }
  }
}

export const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization
  const token = authHeader && authHeader.startsWith("Bearer ") ? authHeader.substring(7) : null

  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET)
      req.user = decoded
    } catch (error) {
      // Token is invalid but we don't fail the request
      req.user = null
    }
  } else {
    req.user = null
  }

  next()
}

export const requireAdmin = requireRole(["admin"])

export const requireSalesAgent = requireRole(["sales_agent", "admin"])

export const requireCustomer = requireRole(["customer", "sales_agent", "admin"])
