"use client"

import { useState, useRef, useEffect } from "react"
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
  Avatar,
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
} from "@mui/material"
import { Add, Edit, Delete, MoreVert, PhotoCamera } from "@mui/icons-material"
import { adminAPI, uploadAPI } from "../../services/interceptor.js"

export default function SalesAgentAdminPanel() {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("md"))
  const fileInputRef = useRef(null)
  const idScanInputRef = useRef(null)

  // State management
  const [agents, setAgents] = useState([])
  const [open, setOpen] = useState(false)
  const [editAgent, setEditAgent] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [notification, setNotification] = useState({ open: false, message: "", severity: "success" })
  const [actionMenuAnchor, setActionMenuAnchor] = useState(null)
  const [selectedAgent, setSelectedAgent] = useState(null)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [agentToDelete, setAgentToDelete] = useState(null)

  const [formData, setFormData] = useState({
    name: "",
    idNumber: "",
    phone: "",
    email: "",
    photo_url: "",
    id_scan_url: "",
    status: "active",
  })

  // Load agents from API
  useEffect(() => {
    const loadAgents = async () => {
      try {
        const res = await adminAPI.getSalesAgents()
        const data = res?.data?.data || res?.data || []
        setAgents(Array.isArray(data) ? data : [])
      } catch (error) {
        setNotification({ open: true, message: "Failed to load agents", severity: "error" })
      }
    }
    loadAgents()
  }, [])

  const refreshAgents = async () => {
    try {
      const res = await adminAPI.getSalesAgents()
      const data = res?.data?.data || res?.data?.salesAgents || res?.data || []
      setAgents(Array.isArray(data) ? data : [])
    } catch (error) {
      // ignore
    }
  }

  // Handle form operations
  const handleOpen = (agent = null) => {
    if (agent) {
      setEditAgent(agent)
      setFormData({
        name: agent.name || "",
        idNumber: agent.idNumber || agent.id_number || "",
        phone: agent.phone || "",
        email: agent.email || "",
        photo_url: agent.photo_url || agent.photo || "",
        id_scan_url: agent.id_scan_url || "",
        status: agent.status || "active",
      })
    } else {
      setEditAgent(null)
      setFormData({
        name: "",
        idNumber: "",
        phone: "",
        email: "",
        photo_url: "",
        id_scan_url: "",
        status: "active",
      })
    }
    setOpen(true)
  }

  const handleClose = () => {
    setOpen(false)
    setEditAgent(null)
  }

  const handleSubmit = async () => {
    if (!formData.name || !formData.idNumber || !formData.phone || !formData.email) {
      setNotification({
        open: true,
        message: "Please fill in all required fields (Name, ID Number, Phone, Email)",
        severity: "error",
      })
      return
    }

    const payload = {
      name: formData.name,
      idNumber: formData.idNumber,
      phone: formData.phone,
      email: formData.email,
      photo_url: formData.photo_url || null,
      id_scan_url: formData.id_scan_url || null,
      status: formData.status,
    }

    try {
      if (editAgent) {
        await adminAPI.updateSalesAgent(editAgent.id, payload)
        setNotification({ open: true, message: "Sales agent updated successfully!", severity: "success" })
      } else {
        await adminAPI.createSalesAgent(payload)
        setNotification({ open: true, message: "Sales agent added successfully!", severity: "success" })
      }
      handleClose()
      refreshAgents()
    } catch (error) {
      setNotification({ open: true, message: "Failed to save agent", severity: "error" })
    }
  }

  const handleDelete = (agent) => {
    setAgentToDelete(agent)
    setDeleteConfirmOpen(true)
  }

  const confirmDelete = async () => {
    try {
      if (agentToDelete) {
        await adminAPI.deleteSalesAgent(agentToDelete.id)
        setNotification({ open: true, message: "Sales agent deleted successfully!", severity: "success" })
        refreshAgents()
      }
    } catch (error) {
      setNotification({ open: true, message: "Failed to delete agent", severity: "error" })
    } finally {
      setDeleteConfirmOpen(false)
      setAgentToDelete(null)
    }
  }

  const uploadAndSet = async (file, field, type) => {
    try {
      const res = await uploadAPI.uploadFile(file, type)
      const url = res?.data?.imageUrl || res?.data?.url || res?.data?.image_url
      if (!url) throw new Error("Upload failed")
      setFormData((prev) => ({ ...prev, [field]: url }))
      setNotification({ open: true, message: "File uploaded successfully", severity: "success" })
    } catch (error) {
      setNotification({ open: true, message: "File upload failed", severity: "error" })
    }
  }

  const handlePhotoFile = (event) => {
    const file = event.target.files?.[0]
    if (file) uploadAndSet(file, "photo_url", "profiles")
  }

  const handleIdScanFile = (event) => {
    const file = event.target.files?.[0]
    if (file) uploadAndSet(file, "id_scan_url", "documents")
  }

  // Filter agents
  const filteredAgents = agents.filter((agent) => {
    const matchesSearch =
      (agent.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (agent.email || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (agent.phone || "").includes(searchTerm)
    const matchesStatus = filterStatus === "all" || (agent.status || "").toLowerCase() === filterStatus
    return matchesSearch && matchesStatus
  })

  const handleActionMenuOpen = (event, agent) => {
    setActionMenuAnchor(event.currentTarget)
    setSelectedAgent(agent)
  }

  const handleActionMenuClose = () => {
    setActionMenuAnchor(null)
    setSelectedAgent(null)
  }

  const handleSuspendReactivate = async (agent, nextStatus) => {
    try {
      await adminAPI.updateSalesAgentStatus(agent.id, nextStatus)
      setNotification({ open: true, message: `Agent ${nextStatus}`, severity: "success" })
      refreshAgents()
    } catch (error) {
      setNotification({ open: true, message: "Failed to update status", severity: "error" })
    } finally {
      handleActionMenuClose()
    }
  }

  return (
    <Box sx={{ p: 3, maxWidth: "100%", mx: "auto" }}>
      {/* Header */}
      <Box
        sx={{ mb: 4, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2 }}
      >
        <Box>
          <Typography variant="h4" fontWeight="bold" color="#1976d2" gutterBottom>
            Sales Agents Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage sales agents with simplified CRUD operations
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpen()}
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
          Add Sales Agent
        </Button>
      </Box>

      {/* Filters */}
      <Box sx={{ mb: 3, display: "flex", gap: 2, flexWrap: "wrap" }}>
        <TextField
          placeholder="Search agents..."
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
            <MenuItem value="suspended">Suspended</MenuItem>
            <MenuItem value="inactive">Inactive</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Agents Table */}
      <Paper sx={{ overflow: "hidden", borderRadius: 2, boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)" }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: "#f8f9fa" }}>
                <TableCell sx={{ fontWeight: 700, color: "#333" }}>Agent</TableCell>
                <TableCell sx={{ fontWeight: 700, color: "#333" }}>ID Number</TableCell>
                <TableCell sx={{ fontWeight: 700, color: "#333" }}>Contact</TableCell>
                <TableCell sx={{ fontWeight: 700, color: "#333" }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 700, color: "#333" }}>Customers</TableCell>
                <TableCell sx={{ fontWeight: 700, color: "#333" }} align="center">
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredAgents.map((agent) => (
                <TableRow key={agent.id} hover>
                  <TableCell>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <Avatar src={(agent.photo_url && agent.photo_url.startsWith("/uploads")) ? `${(import.meta.env.VITE_API_URL || "http://localhost:3000/api").replace(/\/api$/, "")}${agent.photo_url}` : (agent.photo_url || agent.photo)} sx={{ mr: 2, width: 40, height: 40 }} />
                      <Box>
                        <Typography variant="body2" fontWeight={600}>
                          {agent.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {agent.email}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={600}>
                      {agent.idNumber || agent.id_number}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{agent.phone}</Typography>
                  </TableCell>
                  <TableCell>
                    <Chip label={agent.status} color={agent.status === "active" ? "success" : agent.status === "suspended" ? "warning" : "default"} size="small" />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{agent.customersCount || agent.customers_count || 0}</Typography>
                  </TableCell>
                  <TableCell align="center">
                    <IconButton size="small" onClick={(e) => handleActionMenuOpen(e, agent)}>
                      <MoreVert />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Action Menu */}
      <Menu anchorEl={actionMenuAnchor} open={Boolean(actionMenuAnchor)} onClose={handleActionMenuClose}>
        <MenuItem
          onClick={() => {
            handleOpen(selectedAgent)
            handleActionMenuClose()
          }}
        >
          <Edit sx={{ mr: 1 }} /> Edit
        </MenuItem>
        {selectedAgent && selectedAgent.status !== "suspended" && (
          <MenuItem onClick={() => handleSuspendReactivate(selectedAgent, "suspended")}>Suspend</MenuItem>
        )}
        {selectedAgent && selectedAgent.status === "suspended" && (
          <MenuItem onClick={() => handleSuspendReactivate(selectedAgent, "active")}>Reactivate</MenuItem>
        )}
        <MenuItem
          onClick={() => {
            handleDelete(selectedAgent)
            handleActionMenuClose()
          }}
        >
          <Delete sx={{ mr: 1 }} /> Delete
        </MenuItem>
      </Menu>

      {/* Add/Edit Dialog */}
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>
          <Typography variant="h6" fontWeight="bold">
            {editAgent ? "Edit Sales Agent" : "Add New Sales Agent"}
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            {/* Photo & ID Upload */}
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: "center" }}>
                <Avatar src={formData.photo_url} sx={{ width: 120, height: 120, mx: "auto", mb: 2 }} />
                <input type="file" accept="image/*" onChange={handlePhotoFile} style={{ display: "none" }} ref={fileInputRef} />
                <Button variant="outlined" startIcon={<PhotoCamera />} onClick={() => fileInputRef.current?.click()} size="small">
                  Upload Photo
                </Button>
                <Box sx={{ mt: 2 }}>
                  <Button variant="text" onClick={() => idScanInputRef.current?.click()} size="small">
                    Upload ID Scan
                  </Button>
                  <input type="file" accept="image/*,application/pdf" onChange={handleIdScanFile} style={{ display: "none" }} ref={idScanInputRef} />
                  {formData.id_scan_url && (
                    <Typography variant="caption" sx={{ display: "block", mt: 1 }}>
                      ID uploaded
                    </Typography>
                  )}
                </Box>
              </Box>
            </Grid>

            <Grid item xs={12} md={8}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField fullWidth label="Full Name *" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField fullWidth label="ID Number *" value={formData.idNumber} onChange={(e) => setFormData({ ...formData, idNumber: e.target.value })} required />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField fullWidth label="Phone Number *" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} required />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField fullWidth label="Email Address *" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
                </Grid>
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Status</InputLabel>
                    <Select value={formData.status} label="Status" onChange={(e) => setFormData({ ...formData, status: e.target.value })}>
                      <MenuItem value="active">Active</MenuItem>
                      <MenuItem value="suspended">Suspended</MenuItem>
                      <MenuItem value="inactive">Inactive</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={handleClose}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit}>{editAgent ? "Update Agent" : "Add Agent"}</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete "{agentToDelete?.name}"? This action cannot be undone.</Typography>
        </DialogContent>
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
