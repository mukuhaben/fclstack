// src/pages/Login/View/Index.jsx
"use client"

import { useState, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import api from "../../../api.js" // 🗂 Axios instance

import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  Box,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Divider,
} from "@mui/material"

function LoginPage({ onLogin }) {
  const navigate = useNavigate()
  const location = useLocation()

  /* ---------------- state ---------------- */
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [userType, setUserType] = useState("customer") // default
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [loading, setLoading] = useState(false)

  /* ---- detect ?type=agent in URL ------- */
  useEffect(() => {
    const typeParam = new URLSearchParams(location.search).get("type")
    if (typeParam === "agent") setUserType("agent")
  }, [location])

  /* --------------- submit --------------- */
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    if (!email || !password) {
      setError("Please enter both email and password")
      return
    }

    try {
      setLoading(true)

      /* 1️⃣  LOGIN */
      const { data } = await api.post("/auth/login", {
        email,
        password,
        userType,
      })

      const { token, refreshToken, user } = data
      localStorage.setItem("token", token)
      localStorage.setItem("refreshToken", refreshToken)
      localStorage.setItem("currentUser", JSON.stringify(user))

      /* 2️⃣  FETCH FULL PROFILE via /users/:id/ */
      const profileRes = await api.get(`/users/${user.id}/`)
      const userProfile = profileRes.data // adapt if your backend returns { user: {...} }

      localStorage.setItem("userProfile", JSON.stringify(userProfile))

      /* 3️⃣  Optional callback for app‑level auth state */
      if (onLogin) onLogin(userProfile)

      setSuccess("Login successful! Redirecting…")

      /* 4️⃣  Updated role-based redirect logic to use consistent role field */
      setTimeout(() => {
        switch (user.role) {
          case "admin":
            navigate("/admin")
            break
          case "sales_agent":
            navigate("/sales-agent")
            break
          case "customer":
          default:
            navigate("/my-account")
            break
        }
      }, 1000)
    } catch (err) {
      const msg = err.response?.data?.message || "Login failed – please try again."
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  /* --------------- render --------------- */
  return (
    <Container component="main" maxWidth="xs" sx={{ py: 4 }}>
      <Paper elevation={0} sx={{ p: 3, display: "flex", flexDirection: "column", alignItems: "center" }}>
        <Typography variant="h5" gutterBottom>
          Sign In
        </Typography>

        {error && (
          <Alert severity="error" sx={{ width: "100%", mb: 2 }}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ width: "100%", mb: 2 }}>
            {success}
          </Alert>
        )}

        <form onSubmit={handleSubmit} style={{ width: "100%" }} noValidate>
          {/* role */}
          <FormControl component="fieldset" sx={{ width: "100%", mb: 2 }}>
            <FormLabel component="legend">Login as:</FormLabel>
            <RadioGroup
              row
              value={userType}
              onChange={(e) => setUserType(e.target.value)}
              sx={{ justifyContent: "center" }}
            >
              <FormControlLabel value="customer" control={<Radio />} label="Customer" />
              <FormControlLabel value="sales_agent" control={<Radio />} label="Sales Agent" />
            </RadioGroup>
          </FormControl>

          <Divider sx={{ mb: 2 }} />

          <TextField
            label="Email Address"
            fullWidth
            margin="normal"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            label="Password"
            fullWidth
            margin="normal"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <Box sx={{ mt: 2, mb: 2, p: 2, bgcolor: "#f5f5f5", borderRadius: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Your credentials are sent securely to our server.
            </Typography>
          </Box>

          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            sx={{ mt: 1.5, py: 1.5 }}
            disabled={loading}
          >
            {loading ? "Signing in…" : "Sign In"}
          </Button>
        </form>
      </Paper>
    </Container>
  )
}

export default LoginPage
