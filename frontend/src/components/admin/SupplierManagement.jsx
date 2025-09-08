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
import { Add, Edit, Delete, MoreVert, Business, Email, Phone } from "@mui/icons-material"
import { adminAPI, categoriesAPI } from "../../services/interceptor"

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

  const [categories, setCategories] = useState([])

  const [supplierFormData, setSupplierFormData] = useState({
    name: "",
    email: "",
    phone: "",
    status: "active",
    subcategories: [],
    pack_rules: {
      pack_unit: "",
      moq: "",
      lead_time_days: "",
      notes: "",
    },
  })

  useEffect(() => {
    fetchSuppliers()
    loadCategories()
  }, [])

  const loadCategories = async () => {
    try {
      const res = await categoriesAPI.getAll()
      const cats = res?.data?.data?.categories || res?.data?.categories || []
      setCategories(cats)
    } catch (e) {
      setCategories([])
    }
  }

  const fetchSuppliers = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await adminAPI.getSuppliers()
      const data = response?.data?.suppliers || response?.data?.data || []
      setSuppliers(Array.isArray(data) ? data : [])
    } catch (error) {
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
        name: supplier.name || "",
        email: supplier.email || "",
        phone: supplier.phone || "",
        status: supplier.status || "active",
        subcategories: supplier.subcategories || [],
        pack_rules: supplier.pack_rules || { pack_unit: "", moq: "", lead_time_days: "", notes: "" },
      })
      setIsAdd(false)
    } else {
      setEditSupplier(null)
      setSupplierFormData({
        name: "",
        email: "",
        phone: "",
        status: "active",
        subcategories: [],
        pack_rules: { pack_unit: "", moq: "", lead_time_days: "", notes: "" },
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
    setSupplierFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handlePackRuleChange = (field, value) => {
    setSupplierFormData((prev) => ({ ...prev, pack_rules: { ...prev.pack_rules, [field]: value } }))
  }

  const checkEmailUnique = async (email) => {
    try {
      const excludeId = editSupplier?.id
      const res = await adminAPI.validateSupplierEmail(email, excludeId)
      const ok = res?.data?.unique !== false
      return ok
    } catch (e) {
      return true
    }
  }

  const handleSubmitSupplier = async () => {
    if (!supplierFormData.name || !supplierFormData.email || !supplierFormData.phone) {
      setNotification({ open: true, message: "Please fill in required fields (Name, Email, Phone)", severity: "error" })
      return
    }

    const emailOk = await checkEmailUnique(supplierFormData.email)
    if (!emailOk) {
      setNotification({ open: true, message: "Email already exists for another supplier", severity: "error" })
      return
    }

    try {
      setSubmitting(true)
      const payload = { ...supplierFormData }
      if (isAdd) {
        await adminAPI.createSupplier(payload)
        setNotification({ open: true, message: "Supplier added successfully!", severity: "success" })
      } else {
        await adminAPI.updateSupplier(editSupplier.id, payload)
        setNotification({ open: true, message: "Supplier updated successfully!", severity: "success" })
      }
      handleCloseDialog()
      fetchSuppliers()
    } catch (error) {
      setNotification({ open: true, message: "Failed to save supplier", severity: "error" })
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
      await adminAPI.deleteSupplier(supplierToDelete.id)
      setNotification({ open: true, message: "Supplier deleted successfully!", severity: "success" })
      fetchSuppliers()
    } catch (error) {
      setNotification({ open: true, message: "Failed to delete supplier", severity: "error" })
    } finally {
      setDeleteConfirmOpen(false)
      setSupplierToDelete(null)
    }
  }

  const handleSuspendReactivate = async (supplier, nextStatus) => {
    try {
      await adminAPI.updateSupplierStatus(supplier.id, nextStatus)
      setNotification({ open: true, message: `Supplier ${nextStatus}`, severity: "success" })
      fetchSuppliers()
    } catch (error) {
      setNotification({ open: true, message: "Failed to update status", severity: "error" })
    } finally {
      handleActionMenuClose()
    }
  }

  const filteredSuppliers = Array.isArray(suppliers)
    ? suppliers.filter((supplier) => {
        if (!supplier) return false
        const matchesSearch =
          (supplier.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
          (supplier.email || "").toLowerCase().includes(searchTerm.toLowerCase())
        const matchesStatus = filterStatus === "all" || (supplier.status || "").toLowerCase() === filterStatus
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

  return (
    <Box sx={{ p: 3, maxWidth: "100%", mx: "auto" }}>
      {/* Header */}
      <Box sx={{ mb: 4, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" color="#1976d2" gutterBottom>
            Supplier Management
          </Typography>
          <Typography variant="body1" color="text.secondary">Manage suppliers (email unique, pack rules, subcategory mapping)</Typography>
        </Box>
        <Button variant="contained" startIcon={<Add />} onClick={() => handleOpenDialog()} sx={{ bgcolor: "#1976d2", "&:hover": { bgcolor: "#1565c0" }, textTransform: "none", fontWeight: 600, px: 3, py: 1.5, borderRadius: 2 }}>
          Add Supplier
        </Button>
      </Box>

      {/* Filters */}
      <Box sx={{ mb: 3, display: "flex", gap: 2, flexWrap: "wrap" }}>
        <TextField placeholder="Search suppliers..." variant="outlined" size="small" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} sx={{ minWidth: 300 }} />
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Status</InputLabel>
          <Select value={filterStatus} label="Status" onChange={(e) => setFilterStatus(e.target.value)}>
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="active">Active</MenuItem>
            <MenuItem value="suspended">Suspended</MenuItem>
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
                <TableCell sx={{ fontWeight: 700, color: "#333" }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 700, color: "#333" }} align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredSuppliers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                    <Typography variant="body1" color="text.secondary">No suppliers found</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredSuppliers.map((supplier) => (
                  <TableRow key={supplier?.id || Math.random()} hover>
                    <TableCell>
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <Business sx={{ mr: 2, color: "#1976d2" }} />
                        <Box>
                          <Typography variant="body2" fontWeight={600}>{supplier?.name || "Unknown Supplier"}</Typography>
                          <Typography variant="caption" color="text.secondary">{supplier?.subcategories?.length || 0} subcategories</Typography>
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
                      <Chip label={supplier?.status || "unknown"} color={supplier?.status === "active" ? "success" : supplier?.status === "suspended" ? "warning" : "default"} size="small" />
                    </TableCell>
                    <TableCell align="center">
                      <IconButton size="small" onClick={(e) => handleActionMenuOpen(e, supplier)}><MoreVert /></IconButton>
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
        <MenuItem onClick={() => { handleOpenDialog(selectedSupplier); handleActionMenuClose() }}><Edit sx={{ mr: 1 }} /> Edit</MenuItem>
        {selectedSupplier && selectedSupplier.status !== "suspended" && (
          <MenuItem onClick={() => handleSuspendReactivate(selectedSupplier, "suspended")}>Suspend</MenuItem>
        )}
        {selectedSupplier && selectedSupplier.status === "suspended" && (
          <MenuItem onClick={() => handleSuspendReactivate(selectedSupplier, "active")}>Reactivate</MenuItem>
        )}
        <MenuItem onClick={() => { handleDelete(selectedSupplier); handleActionMenuClose() }}><Delete sx={{ mr: 1 }} /> Delete</MenuItem>
      </Menu>

      {/* Add/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle><Typography variant="h6" fontWeight="bold">{isAdd ? "Add New Supplier" : "Edit Supplier"}</Typography></DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mb: 2, color: "#1976d2" }}>Core Details</Typography>
            </Grid>
            <Grid item xs={12} sm={6}><TextField fullWidth label="Supplier Name *" value={supplierFormData.name} onChange={(e) => handleInputChange("name", e.target.value)} required placeholder="Enter supplier name" /></Grid>
            <Grid item xs={12} sm={6}><TextField fullWidth label="Email *" type="email" value={supplierFormData.email} onChange={(e) => handleInputChange("email", e.target.value)} required placeholder="For sending purchase orders" helperText="Used for sending purchase orders" /></Grid>
            <Grid item xs={12} sm={6}><TextField fullWidth label="Phone Number *" value={supplierFormData.phone} onChange={(e) => handleInputChange("phone", e.target.value)} required placeholder="+254 XXX XXX XXX" /></Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select value={supplierFormData.status} label="Status" onChange={(e) => handleInputChange("status", e.target.value)}>
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="suspended">Suspended</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}><Typography variant="h6" sx={{ mb: 2, color: "#1976d2" }}>Subcategories Covered</Typography></Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel id="subcats-label">Subcategories</InputLabel>
                <Select labelId="subcats-label" multiple value={supplierFormData.subcategories} onChange={(e) => handleInputChange("subcategories", e.target.value)} label="Subcategories" renderValue={(selected) => (selected || []).join(", ") }>
                  {(categories || []).flatMap((c) => (c.subCategories || []).map((s) => (
                    <MenuItem key={`${c.name}-${s.name}`} value={s.name}>{c.name} / {s.name}</MenuItem>
                  )))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}><Typography variant="h6" sx={{ mb: 2, color: "#1976d2" }}>Packaging Rules</Typography></Grid>
            <Grid item xs={12} sm={3}><TextField fullWidth label="Pack Unit" value={supplierFormData.pack_rules.pack_unit} onChange={(e) => handlePackRuleChange("pack_unit", e.target.value)} placeholder="e.g., Dozen" /></Grid>
            <Grid item xs={12} sm={3}><TextField fullWidth label="MOQ" type="number" value={supplierFormData.pack_rules.moq} onChange={(e) => handlePackRuleChange("moq", e.target.value)} placeholder="Minimum order qty" /></Grid>
            <Grid item xs={12} sm={3}><TextField fullWidth label="Lead Time (days)" type="number" value={supplierFormData.pack_rules.lead_time_days} onChange={(e) => handlePackRuleChange("lead_time_days", e.target.value)} /></Grid>
            <Grid item xs={12} sm={3}><TextField fullWidth label="Notes" value={supplierFormData.pack_rules.notes} onChange={(e) => handlePackRuleChange("notes", e.target.value)} placeholder="Exceptions or remarks" /></Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={handleCloseDialog} disabled={submitting}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmitSupplier} disabled={submitting || !supplierFormData.name || !supplierFormData.email || !supplierFormData.phone}>
            {submitting ? <CircularProgress size={20} sx={{ mr: 1 }} /> : null}
            {isAdd ? "Add Supplier" : "Update Supplier"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent><Typography>Are you sure you want to delete "{supplierToDelete?.name}"? This action cannot be undone.</Typography></DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)}>Cancel</Button>
          <Button onClick={confirmDelete} color="error" variant="contained">Delete</Button>
        </DialogActions>
      </Dialog>

      {/* Notification Snackbar */}
      <Snackbar open={notification.open} autoHideDuration={6000} onClose={() => setNotification({ ...notification, open: false })}>
        <Alert onClose={() => setNotification({ ...notification, open: false })} severity={notification.severity} sx={{ width: "100%" }}>
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}
