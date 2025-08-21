"use client"

import { useState, useRef } from "react"
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

const initialAgents = [
  {
    id: 1,
    name: "John Doe",
    idNumber: "12345678",
    phone: "+254 722 123 456",
    email: "john.doe@firstcraft.com",
    photo: "/placeholder.svg?height=100&width=100",
    status: "active",
    joinDate: "2023-01-15",
    customersCount: 25,
  },
  {
    id: 2,
    name: "Jane Smith",
    idNumber: "87654321",
    phone: "+254 733 987 654",
    email: "jane.smith@firstcraft.com",
    photo: "/placeholder.svg?height=100&width=100",
    status: "active",
    joinDate: "2023-03-20",
    customersCount: 20,
  },
  {
    id: 3,
    name: "Bob Johnson",
    idNumber: "11223344",
    phone: "+254 711 555 777",
    email: "bob.johnson@firstcraft.com",
    photo: "/placeholder.svg?height=100&width=100",
    status: "inactive",
    joinDate: "2022-11-10",
    customersCount: 18,
  },
]

export default function SalesAgentAdminPanel() {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("md"))
  const fileInputRef = useRef(null)

  // State management
  const [agents, setAgents] = useState(initialAgents)
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
    photo: "/placeholder.svg?height=100&width=100",
    status: "active",
  })

  // Handle form operations
  const handleOpen = (agent = null) => {
    if (agent) {
      setEditAgent(agent)
      setFormData({
        name: agent.name,
        idNumber: agent.idNumber,
        phone: agent.phone,
        email: agent.email,
        photo: agent.photo,
        status: agent.status,
      })
    } else {
      setEditAgent(null)
      setFormData({
        name: "",
        idNumber: "",
        phone: "",
        email: "",
        photo: "/placeholder.svg?height=100&width=100",
        status: "active",
      })
    }
    setOpen(true)
  }

  const handleClose = () => {
    setOpen(false)
    setEditAgent(null)
  }

  const handleSubmit = () => {
    if (!formData.name || !formData.idNumber || !formData.phone || !formData.email) {
      setNotification({
        open: true,
        message: "Please fill in all required fields (Name, ID Number, Phone, Email)",
        severity: "error",
      })
      return
    }

    const newAgent = {
      id: editAgent ? editAgent.id : Date.now(),
      name: formData.name,
      idNumber: formData.idNumber,
      phone: formData.phone,
      email: formData.email,
      photo: formData.photo,
      status: formData.status,
      joinDate: editAgent ? editAgent.joinDate : new Date().toISOString().split("T")[0],
      customersCount: editAgent ? editAgent.customersCount : 0,
    }

    if (editAgent) {
      setAgents(agents.map((agent) => (agent.id === editAgent.id ? newAgent : agent)))
      setNotification({
        open: true,
        message: "Sales agent updated successfully!",
        severity: "success",
      })
    } else {
      setAgents([...agents, newAgent])
      setNotification({
        open: true,
        message: "Sales agent added successfully!",
        severity: "success",
      })
    }

    handleClose()
  }

  const handleDelete = (agent) => {
    setAgentToDelete(agent)
    setDeleteConfirmOpen(true)
  }

  const confirmDelete = () => {
    if (agentToDelete) {
      setAgents(agents.filter((agent) => agent.id !== agentToDelete.id))
      setNotification({
        open: true,
        message: "Sales agent deleted successfully!",
        severity: "success",
      })
    }
    setDeleteConfirmOpen(false)
    setAgentToDelete(null)
  }

  const handlePhotoUpload = (event) => {
    const file = event.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setFormData({ ...formData, photo: e.target.result })
      }
      reader.readAsDataURL(file)
    }
  }

  // Filter agents
  const filteredAgents = agents.filter((agent) => {
    const matchesSearch =
      agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agent.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agent.phone.includes(searchTerm)
    const matchesStatus = filterStatus === "all" || agent.status === filterStatus
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
                      <Avatar src={agent.photo} sx={{ mr: 2, width: 40, height: 40 }} />
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
                      {agent.idNumber}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{agent.phone}</Typography>
                  </TableCell>
                  <TableCell>
                    <Chip label={agent.status} color={agent.status === "active" ? "success" : "default"} size="small" />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{agent.customersCount}</Typography>
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
            {/* Photo Upload */}
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: "center" }}>
                <Avatar src={formData.photo} sx={{ width: 120, height: 120, mx: "auto", mb: 2 }} />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  style={{ display: "none" }}
                  ref={fileInputRef}
                />
                <Button
                  variant="outlined"
                  startIcon={<PhotoCamera />}
                  onClick={() => fileInputRef.current?.click()}
                  size="small"
                >
                  Upload Photo
                </Button>
              </Box>
            </Grid>

            <Grid item xs={12} md={8}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Full Name *"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="ID Number *"
                    value={formData.idNumber}
                    onChange={(e) => setFormData({ ...formData, idNumber: e.target.value })}
                    required
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Phone Number *"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Email Address *"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Status</InputLabel>
                    <Select
                      value={formData.status}
                      label="Status"
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    >
                      <MenuItem value="active">Active</MenuItem>
                      <MenuItem value="inactive">Inactive</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </Grid>
            {/* </CHANGE> */}
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={handleClose}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit}>
            {editAgent ? "Update Agent" : "Add Agent"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{agentToDelete?.name}"? This action cannot be undone.
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
