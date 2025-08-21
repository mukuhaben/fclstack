"use client"

import { useState, useEffect } from "react"
import {
  Box,
  Paper,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Grid,
  Chip,
  IconButton,
  Alert,
  Snackbar,
  Card,
  CardContent,
  Tooltip,
} from "@mui/material"
import {
  Add as AddIcon,
  Edit as EditIcon,
  Visibility as ViewIcon,
  Print as PrintIcon,
  Refresh as RefreshIcon,
} from "@mui/icons-material"
import GoodsReceivedNoteForm from "./GoodsReceivedNoteForm"

/**
 * TabPanel Component for organizing GRN management sections
 */
function TabPanel(props) {
  const { children, value, index, ...other } = props

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`grn-tabpanel-${index}`}
      aria-labelledby={`grn-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  )
}

/**
 * GRNManagement Component - Goods Received Note Management
 */
const GRNManagement = () => {
  // State management for GRN data and UI
  const [grns, setGrns] = useState([])
  const [filteredGrns, setFilteredGrns] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [sortConfig, setSortConfig] = useState({ key: "receiveDate", direction: "desc" })
  const [filterStatus, setFilterStatus] = useState("all")
  const [selectedGrn, setSelectedGrn] = useState(null)
  const [tabValue, setTabValue] = useState(0)

  // Dialog and form states
  const [grnFormOpen, setGrnFormOpen] = useState(false)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [editingGrn, setEditingGrn] = useState(null)

  // Notification state
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "success",
  })

  // Initialize sample GRN data
  useEffect(() => {
    const sampleGRNs = [
      {
        id: "GRN001",
        grnNumber: "GRN-2024-001",
        reference: "PO-2024-001",
        receiveDate: "2024-06-15",
        purchaseOrder: {
          id: "PO001",
          poNumber: "PO-2024-001",
          supplier: {
            name: "Afri Supplies Ltd",
            contact: "John Kamau",
            email: "info@afrisupplies.co.ke",
            phone: "+254 722 123 456",
          },
        },
        warehouse: { id: 1, name: "Main Warehouse" },
        receivedBy: "John Doe",
        items: [
          {
            id: 1,
            productCode: "L0202004",
            productName: "Afri Multipurpose Labels K11 19*13mm White",
            orderedQuantity: 10,
            receivedQuantity: 10,
            pendingQuantity: 0,
            rate: 50.0,
            amount: 500.0,
            status: "complete",
          },
        ],
        totals: {
          totalItems: 10,
          totalReceived: 10,
          totalPending: 0,
          totalValue: 500.0,
        },
        status: "complete",
        notes: "All items received in good condition",
        createdAt: "2024-06-15T10:30:00Z",
      },
    ]

    setGrns(sampleGRNs)
    setFilteredGrns(sampleGRNs)
  }, [])

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue)
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
      minimumFractionDigits: 2,
    }).format(amount)
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "complete":
        return "success"
      case "partial":
        return "warning"
      case "pending":
        return "info"
      default:
        return "default"
    }
  }

  return (
    <Box sx={{ width: "100%", bgcolor: "#f8fafc", minHeight: "100vh" }}>
      {/* Header Section */}
      <Paper sx={{ mb: 3, p: 3 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
          <Typography variant="h5" sx={{ fontWeight: 600, color: "#1976d2" }}>
            Goods Received Note Management
          </Typography>
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setGrnFormOpen(true)}
              sx={{ bgcolor: "#1976d2" }}
            >
              Create GRN
            </Button>
            <Button variant="outlined" startIcon={<RefreshIcon />}>
              Refresh
            </Button>
          </Box>
        </Box>

        {/* Summary Cards */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: "#e3f2fd", border: "1px solid #bbdefb" }}>
              <CardContent sx={{ textAlign: "center", py: 2 }}>
                <Typography variant="h4" sx={{ fontWeight: 600, color: "#1976d2" }}>
                  {grns.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total GRNs
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: "#e8f5e8", border: "1px solid #c8e6c9" }}>
              <CardContent sx={{ textAlign: "center", py: 2 }}>
                <Typography variant="h4" sx={{ fontWeight: 600, color: "#388e3c" }}>
                  {grns.filter((grn) => grn.status === "complete").length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Completed
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: "#fff3e0", border: "1px solid #ffcc02" }}>
              <CardContent sx={{ textAlign: "center", py: 2 }}>
                <Typography variant="h4" sx={{ fontWeight: 600, color: "#f57c00" }}>
                  {grns.filter((grn) => grn.status === "partial").length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Partial
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: "#e1f5fe", border: "1px solid #b3e5fc" }}>
              <CardContent sx={{ textAlign: "center", py: 2 }}>
                <Typography variant="h4" sx={{ fontWeight: 600, color: "#0288d1" }}>
                  {grns.filter((grn) => grn.status === "pending").length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Pending
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Paper>

      {/* Main Content */}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: "#f5f5f5" }}>
                <TableCell sx={{ fontWeight: 600 }}>GRN Number</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Reference</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Supplier</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Receive Date</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Total Value</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {grns.map((grn) => (
                <TableRow key={grn.id} hover>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {grn.grnNumber}
                    </Typography>
                  </TableCell>
                  <TableCell>{grn.reference}</TableCell>
                  <TableCell>{grn.purchaseOrder.supplier.name}</TableCell>
                  <TableCell>{new Date(grn.receiveDate).toLocaleDateString()}</TableCell>
                  <TableCell>{formatCurrency(grn.totals.totalValue)}</TableCell>
                  <TableCell>
                    <Chip label={grn.status.toUpperCase()} color={getStatusColor(grn.status)} size="small" />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: "flex", gap: 0.5 }}>
                      <Tooltip title="View Details">
                        <IconButton size="small">
                          <ViewIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit GRN">
                        <IconButton size="small">
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Print GRN">
                        <IconButton size="small">
                          <PrintIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* GRN Form Dialog */}
      <GoodsReceivedNoteForm
        open={grnFormOpen}
        onClose={() => setGrnFormOpen(false)}
        onSave={(grnData) => {
          console.log("Saving GRN:", grnData)
          setGrnFormOpen(false)
        }}
      />

      {/* Notification Snackbar */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={() => setNotification({ ...notification, open: false })}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
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

export default GRNManagement
