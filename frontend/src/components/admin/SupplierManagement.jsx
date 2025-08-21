"use client"

import { useState, useEffect } from "react"
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  IconButton,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Snackbar,
  Menu,
  useTheme,
  useMediaQuery,
  Stack,
  CircularProgress,
} from "@mui/material"
import { Add, Edit, Delete, MoreVert, Business, Email, Phone, LocationOn } from "@mui/icons-material"
import { adminAPI } from "../../services/interceptor"

export default function SupplierManagement() {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("md"))

  // State management
  const [suppliers, setSuppliers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [openDialog, setOpenDialog] = useState(false)
  const [editSupplier, setEditSupplier] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [notification, setNotification] = useState({ open: false, message: "", severity: "success" })
  const [actionMenuAnchor, setActionMenuAnchor] = useState(null)
  const [selectedSupplier, setSelectedSupplier] = useState(null)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [supplierToDelete, setSupplierToDelete] = useState(null)
  const [isAdd, setIsAdd] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const [supplierFormData, setSupplierFormData] = useState({
    name: "",
    email: "",
    phone: "",
    city: "",
    status: "active",
  })

  useEffect(() => {
    fetchSuppliers()
  }, [])

  const fetchSuppliers = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await adminAPI.getSuppliers()

      if (response && response.success && Array.isArray(response.suppliers)) {
        setSuppliers(response.suppliers)
      } else {
        console.log("[v0] No suppliers data or invalid response structure:", response)
        setSuppliers([])
        setError("No suppliers found in database")
      }
    } catch (error) {
      console.error("[v0] Error fetching suppliers:", error)
      setError("Failed to load suppliers. Please try again.")
      setSuppliers([])
    } finally {
      setLoading(false)
    }
  }

  // Handle form operations
  const handleOpenDialog = (supplier = null) => {
    if (supplier) {
      setEditSupplier(supplier)
      setSupplierFormData({
        name: supplier.name,
        email: supplier.email,
        phone: supplier.phone,
        city: supplier.city,
        status: supplier.status,
      })
      setIsAdd(false)
    } else {
      setEditSupplier(null)
      setSupplierFormData({
        name: "",
        email: "",
        phone: "",
        city: "",
        status: "active",
      })
      setIsAdd(true)
    }
    setOpenDialog(true)
  }

  const handleCloseDialog = () => {
    setOpenDialog(false)
    setEditSupplier(null)
  }

  const handleInputChange = (field, value) => {
    setSupplierFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSubmitSupplier = async () => {
    if (!supplierFormData.name || !supplierFormData.email || !supplierFormData.phone || !supplierFormData.city) {
      setNotification({
        open: true,
        message: "Please fill in all required fields (Supplier Name, Email, Phone, City)",
        severity: "error",
      })
      return
    }

    try {
      setSubmitting(true)

      if (editSupplier) {
        const response = await adminAPI.updateSupplier(editSupplier.id, supplierFormData)
        if (response && response.success) {
          await fetchSuppliers() // Refresh the list
          setNotification({
            open: true,
            message: "Supplier updated successfully!",
            severity: "success",
          })
        } else {
          throw new Error(response?.message || "Failed to update supplier")
        }
      } else {
        const response = await adminAPI.createSupplier(supplierFormData)
        if (response && response.success) {
          await fetchSuppliers() // Refresh the list
          setNotification({
            open: true,
            message: "Supplier added successfully!",
            severity: "success",
          })
        } else {
          throw new Error(response?.message || "Failed to create supplier")
        }
      }

      handleCloseDialog()
    } catch (error) {
      console.error("[v0] Error submitting supplier:", error)
      setNotification({
        open: true,
        message: error.message || "Failed to save supplier. Please try again.",
        severity: "error",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = (supplier) => {
    setSupplierToDelete(supplier)
    setDeleteConfirmOpen(true)
  }

  const confirmDelete = async () => {
    if (!supplierToDelete) return

    try {
      const response = await adminAPI.deleteSupplier(supplierToDelete.id)
      if (response && response.success) {
        await fetchSuppliers() // Refresh the list
        setNotification({
          open: true,
          message: "Supplier deleted successfully!",
          severity: "success",
        })
      } else {
        throw new Error(response?.message || "Failed to delete supplier")
      }
    } catch (error) {
      console.error("[v0] Error deleting supplier:", error)
      setNotification({
        open: true,
        message: error.message || "Failed to delete supplier. Please try again.",
        severity: "error",
      })
    } finally {
      setDeleteConfirmOpen(false)
      setSupplierToDelete(null)
    }
  }

  const filteredSuppliers = Array.isArray(suppliers)
    ? suppliers.filter((supplier) => {
        if (!supplier) return false

        const matchesSearch =
          (supplier.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
          (supplier.email || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
          (supplier.city || "").toLowerCase().includes(searchTerm.toLowerCase())
        const matchesStatus = filterStatus === "all" || supplier.status === filterStatus
        return matchesSearch && matchesStatus
      })
    : []

  const handleActionMenuOpen = (event, supplier) => {
    setActionMenuAnchor(event.currentTarget)
    setSelectedSupplier(supplier)
  }

  const handleActionMenuClose = () => {
    setActionMenuAnchor(null)
    setSelectedSupplier(null)
  }

  if (loading) {
    return (
      <Box sx={{ p: 3, display: "flex", justifyContent: "center", alignItems: "center", minHeight: 400 }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Loading suppliers...</Typography>
      </Box>
    )
  }

  if (error && suppliers.length === 0) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="info" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button variant="contained" onClick={fetchSuppliers}>
          Retry
        </Button>
      </Box>
    )
  }

  return (
    <Box sx={{ p: 3, maxWidth: "100%", mx: "auto" }}>
      {/* Header */}
      <Box
        sx={{ mb: 4, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2 }}
      >
        <Box>
          <Typography variant="h4" fontWeight="bold" color="#1976d2" gutterBottom>
            Supplier Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage suppliers with simplified required fields
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpenDialog()}
          sx={{
            bgcolor: "#1976d2",
            "&:hover": { bgcolor: "#1565c0" },
            textTransform: "none",
            fontWeight: 600,
            px: 3,
            py: 1.5,
            borderRadius: 2,
          }}
        >
          Add Supplier
        </Button>
      </Box>

      {/* Filters */}
      <Box sx={{ mb: 3, display: "flex", gap: 2, flexWrap: "wrap" }}>
        <TextField
          placeholder="Search suppliers..."
          variant="outlined"
          size="small"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ minWidth: 300 }}
        />
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Status</InputLabel>
          <Select value={filterStatus} label="Status" onChange={(e) => setFilterStatus(e.target.value)}>
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="active">Active</MenuItem>
            <MenuItem value="inactive">Inactive</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Suppliers Table */}
      <Paper sx={{ overflow: "hidden", borderRadius: 2, boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)" }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: "#f8f9fa" }}>
                <TableCell sx={{ fontWeight: 700, color: "#333" }}>Supplier</TableCell>
                <TableCell sx={{ fontWeight: 700, color: "#333" }}>Contact</TableCell>
                <TableCell sx={{ fontWeight: 700, color: "#333" }}>Location</TableCell>
                <TableCell sx={{ fontWeight: 700, color: "#333" }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 700, color: "#333" }} align="center">
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredSuppliers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                    <Typography variant="body1" color="text.secondary">
                      {searchTerm || filterStatus !== "all"
                        ? "No suppliers match your search criteria"
                        : "No data in database"}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredSuppliers.map((supplier) => (
                  <TableRow key={supplier?.id || Math.random()} hover>
                    <TableCell>
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <Business sx={{ mr: 2, color: "#1976d2" }} />
                        <Box>
                          <Typography variant="body2" fontWeight={600}>
                            {supplier?.name || "Unknown Supplier"}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Since {supplier?.createdDate || supplier?.created_at || "Unknown"}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Stack spacing={0.5}>
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <Email sx={{ mr: 1, fontSize: 16, color: "#666" }} />
                          <Typography variant="body2">{supplier?.email || "No email"}</Typography>
                        </Box>
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <Phone sx={{ mr: 1, fontSize: 16, color: "#666" }} />
                          <Typography variant="body2">{supplier?.phone || "No phone"}</Typography>
                        </Box>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <LocationOn sx={{ mr: 1, fontSize: 16, color: "#666" }} />
                        <Typography variant="body2">{supplier?.city || "No location"}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={supplier?.status || "unknown"}
                        color={supplier?.status === "active" ? "success" : "default"}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <IconButton size="small" onClick={(e) => handleActionMenuOpen(e, supplier)}>
                        <MoreVert />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Action Menu */}
      <Menu anchorEl={actionMenuAnchor} open={Boolean(actionMenuAnchor)} onClose={handleActionMenuClose}>
        <MenuItem
          onClick={() => {
            handleOpenDialog(selectedSupplier)
            handleActionMenuClose()
          }}
        >
          <Edit sx={{ mr: 1 }} /> Edit
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleDelete(selectedSupplier)
            handleActionMenuClose()
          }}
        >
          <Delete sx={{ mr: 1 }} /> Delete
        </MenuItem>
      </Menu>

      {/* Add/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          <Typography variant="h6" fontWeight="bold">
            {isAdd ? "Add New Supplier" : "Edit Supplier"}
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mb: 2, color: "#1976d2" }}>
                Required Information
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Supplier Name *"
                value={supplierFormData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                required
                placeholder="Enter supplier name"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email *"
                type="email"
                value={supplierFormData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                required
                placeholder="For sending purchase orders"
                helperText="Used for sending purchase orders"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Phone Number *"
                value={supplierFormData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                required
                placeholder="+254 XXX XXX XXX"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="City *"
                value={supplierFormData.city}
                onChange={(e) => handleInputChange("city", e.target.value)}
                required
                placeholder="Supplier location"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={supplierFormData.status}
                  label="Status"
                  onChange={(e) => handleInputChange("status", e.target.value)}
                >
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={handleCloseDialog} disabled={submitting}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmitSupplier}
            disabled={
              submitting ||
              !supplierFormData.name ||
              !supplierFormData.email ||
              !supplierFormData.phone ||
              !supplierFormData.city
            }
          >
            {submitting ? <CircularProgress size={20} sx={{ mr: 1 }} /> : null}
            {isAdd ? "Add Supplier" : "Update Supplier"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{supplierToDelete?.name}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)}>Cancel</Button>
          <Button onClick={confirmDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Notification Snackbar */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={() => setNotification({ ...notification, open: false })}
      >
        <Alert
          onClose={() => setNotification({ ...notification, open: false })}
          severity={notification.severity}
          sx={{ width: "100%" }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}
