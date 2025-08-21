"use client"

// src/pages/RegistrationForm.jsx
import { useState } from "react"
import axios from "axios"
import {
  Box,
  Typography,
  TextField,
  Button,
  FormControl,
  RadioGroup,
  FormControlLabel,
  Radio,
  Container,
  Paper,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Snackbar,
  FormLabel,
  Select,
  MenuItem,
} from "@mui/material"
import { useNavigate } from "react-router-dom"
import { Check } from "@mui/icons-material"

// 👉 Change to your backend URL or keep Vite env variable
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000"

const RegistrationForm = () => {
  const navigate = useNavigate()

  // --- Form State (Individual only) ---
  const [formData, setFormData] = useState({
    registrationType: "self", // 'self' or 'agent'
    salesAgent: "",
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    phone: "",
    cashbackPhone: "",
    contactPerson: "",
    kraPin: "",
  })

  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [successDialogOpen, setSuccessDialogOpen] = useState(false)
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" })

  // Mock sales agents data - in real app, this would come from API
  const salesAgents = [
    { id: 1, name: "Mike Joseph" },
    { id: 2, name: "John Doe" },
    { id: 3, name: "Jane Smith" },
    { id: 4, name: "Sarah Wilson" },
    { id: 5, name: "David Brown" },
  ]

  // --- Handle input changes ---
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }))
  }

  // --- Basic client‑side validation ---
  const validate = () => {
    const newErrors = {}
    if (!formData.first_name) newErrors.first_name = "First name is required"
    if (!formData.last_name) newErrors.last_name = "Last name is required"
    if (!formData.email) newErrors.email = "Email is required"
    if (!formData.password) newErrors.password = "Password is required"
    if (!formData.cashbackPhone) newErrors.cashbackPhone = "Cashback phone is required"

    if (formData.registrationType === "agent" && !formData.salesAgent) {
      newErrors.salesAgent = "Please select a sales agent"
    }

    return newErrors
  }

  // --- Submit handler ---
  const handleSubmit = async (e) => {
    e.preventDefault()
    const validationErrors = validate()
    if (Object.keys(validationErrors).length) {
      setErrors(validationErrors)
      return
    }

    setLoading(true)
    try {
      const registrationData = {
        ...formData,
        phone: formData.phone || null,
        contactPerson: formData.contactPerson || null,
        kraPin: formData.kraPin || null,
        registrationSource: formData.registrationType,
        salesAgentId: formData.registrationType === "agent" ? formData.salesAgent : null,
      }

      await axios.post(`${API_URL}/api/auth/register`, registrationData)
      setSuccessDialogOpen(true)
    } catch (err) {
      console.error(err)
      const message = err.response?.data?.message || "Registration failed"
      setSnackbar({ open: true, message, severity: "error" })
    } finally {
      setLoading(false)
    }
  }

  // --- Dialog close ---
  const handleDialogClose = () => {
    setSuccessDialogOpen(false)
    setSnackbar({ open: true, message: "Registration successful! Check your email.", severity: "success" })
    setTimeout(() => navigate("/login"), 1500)
  }

  const handleSnackbarClose = () => setSnackbar((p) => ({ ...p, open: false }))

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Paper elevation={0} sx={{ p: 4, borderRadius: 2 }}>
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          Create New Customer (Individual)
        </Typography>
        <form onSubmit={handleSubmit}>
          <Box mb={3}>
            <FormControl component="fieldset" fullWidth>
              <FormLabel component="legend" sx={{ fontWeight: 600, color: "#333", mb: 2 }}>
                Registration Type *
              </FormLabel>
              <RadioGroup
                row
                name="registrationType"
                value={formData.registrationType}
                onChange={handleChange}
                sx={{ mb: 2 }}
              >
                <FormControlLabel value="self" control={<Radio />} label="Self Registration" sx={{ mr: 4 }} />
                <FormControlLabel value="agent" control={<Radio />} label="Registered by Sales Agent" />
              </RadioGroup>
            </FormControl>

            {formData.registrationType === "agent" && (
              <Box sx={{ mt: 2, p: 2, bgcolor: "#f8f9fa", borderRadius: 2, border: "1px solid #e0e0e0" }}>
                <FormControl fullWidth size="small" error={!!errors.salesAgent}>
                  <Typography variant="body2" gutterBottom sx={{ fontWeight: 600, color: "#333" }}>
                    Select Sales Agent *
                  </Typography>
                  <Select
                    name="salesAgent"
                    value={formData.salesAgent}
                    onChange={handleChange}
                    displayEmpty
                    sx={{ bgcolor: "white" }}
                  >
                    <MenuItem value="">
                      <em>Choose a sales agent...</em>
                    </MenuItem>
                    {salesAgents.map((agent) => (
                      <MenuItem key={agent.id} value={agent.id}>
                        {agent.name}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.salesAgent && (
                    <Typography variant="caption" color="error" sx={{ mt: 1 }}>
                      {errors.salesAgent}
                    </Typography>
                  )}
                </FormControl>
              </Box>
            )}
          </Box>

          {[
            {
              label: "First Name (Invoice)",
              name: "first_name",
              placeholder: "Enter First Name",
              error: errors.first_name,
            },
            {
              label: "Last Name (Invoice)",
              name: "last_name",
              placeholder: "Enter Last Name",
              error: errors.last_name,
            },

            { label: "Email", name: "email", placeholder: "Enter Email", error: errors.email, type: "email" },
            {
              label: "Password",
              name: "password",
              placeholder: "Enter Password",
              error: errors.password,
              type: "password",
            },
            { label: "Phone (optional)", name: "phone", placeholder: "07XXXXXXXX" },
            {
              label: "Cashback Phone (Safaricom)",
              name: "cashbackPhone",
              placeholder: "07XXXXXXXX",
              error: errors.cashbackPhone,
            },
            { label: "Contact Person (optional)", name: "contactPerson", placeholder: "Contact Person" },
            { label: "KRA PIN (optional)", name: "kraPin", placeholder: "A001234567X" },
          ].map(({ label, name, placeholder, error, type = "text" }) => (
            <Box key={name} mb={2}>
              <Typography fontWeight="bold" gutterBottom>
                {label}
              </Typography>
              <TextField
                fullWidth
                size="small"
                name={name}
                value={formData[name]}
                onChange={handleChange}
                placeholder={placeholder}
                type={type}
                error={!!error}
                helperText={error}
              />
            </Box>
          ))}

          {/* Info */}
          <Alert severity="info" sx={{ my: 3 }}>
            After registration, you'll receive a confirmation email.
          </Alert>

          <Button type="submit" variant="contained" disabled={loading} fullWidth>
            {loading ? "Registering..." : "Create Customer"}
          </Button>
        </form>
      </Paper>

      {/* Success dialog */}
      <Dialog open={successDialogOpen} onClose={handleDialogClose}>
        <DialogTitle>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Check color="success" /> Registration Successful
          </Box>
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            A confirmation email has been sent to <b>{formData.email}</b>.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose} variant="contained" autoFocus>
            Go to Login
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        message={snackbar.message}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      />
    </Container>
  )
}

export default RegistrationForm
