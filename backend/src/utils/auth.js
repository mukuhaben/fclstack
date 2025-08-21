import jwt from "jsonwebtoken"
import bcrypt from "bcryptjs"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

export const hashPassword = (password) => {
  return bcrypt.hashSync(password, 12)
}

export const comparePassword = (password, hash) => {
  return bcrypt.compareSync(password, hash)
}

export const generateToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" })
}

export const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch (error) {
    return null
  }
}

export const getTokenFromRequest = (req) => {
  const authHeader = req.headers.authorization
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.substring(7)
  }
  return null
}

export const authenticateUser = async (req) => {
  const token = getTokenFromRequest(req)
  if (!token) {
    return null
  }

  const decoded = verifyToken(token)
  if (!decoded) {
    return null
  }

  return decoded
}

export const refreshToken = (user) => {
  return generateToken({
    id: user.id,
    email: user.email,
    role: user.role,
    name: user.name,
  })
}

export const validatePassword = (password) => {
  const minLength = 8
  const hasUpperCase = /[A-Z]/.test(password)
  const hasLowerCase = /[a-z]/.test(password)
  const hasNumbers = /\d/.test(password)
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password)

  const errors = []

  if (password.length < minLength) {
    errors.push(`Password must be at least ${minLength} characters long`)
  }
  if (!hasUpperCase) {
    errors.push("Password must contain at least one uppercase letter")
  }
  if (!hasLowerCase) {
    errors.push("Password must contain at least one lowercase letter")
  }
  if (!hasNumbers) {
    errors.push("Password must contain at least one number")
  }
  if (!hasSpecialChar) {
    errors.push("Password must contain at least one special character")
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}
