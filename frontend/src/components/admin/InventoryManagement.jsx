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
import { adminAPI } from "../../services/interceptor"

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

  // Unacknowledged POs (from backend)
  const [unackedPOs, setUnackedPOs] = useState([])
  const [emailFailedPOs, setEmailFailedPOs] = useState([])
  const [underDeliveryAlerts, setUnderDeliveryAlerts] = useState([])
  const [overDeliveryAlerts, setOverDeliveryAlerts] = useState([])

  useEffect(() => {
    refreshAll()
  }, [])

  const refreshAll = async () => {
    await Promise.all([loadGRNs(), loadUnacknowledgedPOs()])
  }

  const loadGRNs = async () => {
    try {
      const res = await adminAPI.getGRNs()
      const data = res?.data?.data || res?.data || []
      setGrns(Array.isArray(data) ? data : [])
      setFilteredGrns(Array.isArray(data) ? data : [])

      // Compute under/over delivery alerts from GRN items
      const under = []
      const over = []
      ;(Array.isArray(data) ? data : []).forEach((grn) => {
        ;(grn.items || []).forEach((item) => {
          const ordered = Number(item.orderedQuantity || 0)
          const received = Number(item.receivedQuantity || 0)
          if (received < ordered) {
            under.push({ grnNumber: grn.grnNumber, product: item.productName || item.productCode, shortfall: ordered - received, supplier: grn.purchaseOrder?.supplier?.name || grn.supplier?.name })
          } else if (received > ordered) {
            over.push({ grnNumber: grn.grnNumber, product: item.productName || item.productCode, surplus: received - ordered, supplier: grn.purchaseOrder?.supplier?.name || grn.supplier?.name })
          }
        })
      })
      setUnderDeliveryAlerts(under)
      setOverDeliveryAlerts(over)
    } catch (e) {
      setGrns([])
      setFilteredGrns([])
      setNotification({ open: true, message: "Failed to load GRNs", severity: "error" })
      setUnderDeliveryAlerts([])
      setOverDeliveryAlerts([])
    }
  }

  const loadUnacknowledgedPOs = async () => {
    try {
      const res = await adminAPI.getPurchaseOrders({ status: "pending" })
      const data = res?.data?.data || res?.data || []
      // Consider 'sent' (email sent but no accept) as unacknowledged too
      const resSent = await adminAPI.getPurchaseOrders({ status: "sent" })
      const dataSent = resSent?.data?.data || resSent?.data || []
      const list = [...(Array.isArray(data) ? data : []), ...(Array.isArray(dataSent) ? dataSent : [])]
      setUnackedPOs(list)

      // Email send failures (if backend uses a status like 'email_failed')
      const resFailed = await adminAPI.getPurchaseOrders({ status: "email_failed" })
      const dataFailed = resFailed?.data?.data || resFailed?.data || []
      setEmailFailedPOs(Array.isArray(dataFailed) ? dataFailed : [])
    } catch (e) {
      setUnackedPOs([])
      setEmailFailedPOs([])
    }
  }

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue)
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
      minimumFractionDigits: 2,
    }).format(amount || 0)
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
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => setGrnFormOpen(true)} sx={{ bgcolor: "#1976d2" }}>
              Create GRN
            </Button>
            <Button variant="outlined" startIcon={<RefreshIcon />} onClick={refreshAll}>
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
                <Typography variant="body2" color="text.secondary">Total GRNs</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: "#e8f5e8", border: "1px solid #c8e6c9" }}>
              <CardContent sx={{ textAlign: "center", py: 2 }}>
                <Typography variant="h4" sx={{ fontWeight: 600, color: "#388e3c" }}>
                  {grns.filter((grn) => grn.status === "complete").length}
                </Typography>
                <Typography variant="body2" color="text.secondary">Completed</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: "#fff3e0", border: "1px solid #ffcc02" }}>
              <CardContent sx={{ textAlign: "center", py: 2 }}>
                <Typography variant="h4" sx={{ fontWeight: 600, color: "#f57c00" }}>
                  {grns.filter((grn) => grn.status === "partial").length}
                </Typography>
                <Typography variant="body2" color="text.secondary">Partial</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: "#e1f5fe", border: "1px solid #b3e5fc" }}>
              <CardContent sx={{ textAlign: "center", py: 2 }}>
                <Typography variant="h4" sx={{ fontWeight: 600, color: "#0288d1" }}>
                  {grns.filter((grn) => grn.status === "pending").length}
                </Typography>
                <Typography variant="body2" color="text.secondary">Pending</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Alerts & Unacknowledged POs */}
        <Paper sx={{ p: 2, mb: 2, border: "1px solid #eee" }}>
          <Typography variant="h6" sx={{ mb: 1, color: "#1976d2" }}>Alerts</Typography>
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ bgcolor: "#fff3e0", border: "1px solid #ffcc02" }}>
                <CardContent sx={{ textAlign: "center", py: 1.5 }}>
                  <Typography variant="h5" sx={{ fontWeight: 600, color: "#f57c00" }}>{unackedPOs.length}</Typography>
                  <Typography variant="body2" color="text.secondary">POs Not Acknowledged</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ bgcolor: "#ffebee", border: "1px solid #ffcdd2" }}>
                <CardContent sx={{ textAlign: "center", py: 1.5 }}>
                  <Typography variant="h5" sx={{ fontWeight: 600, color: "#d32f2f" }}>{underDeliveryAlerts.length}</Typography>
                  <Typography variant="body2" color="text.secondary">Under-deliveries</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ bgcolor: "#e3f2fd", border: "1px solid #bbdefb" }}>
                <CardContent sx={{ textAlign: "center", py: 1.5 }}>
                  <Typography variant="h5" sx={{ fontWeight: 600, color: "#1976d2" }}>{overDeliveryAlerts.length}</Typography>
                  <Typography variant="body2" color="text.secondary">Over-deliveries</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ bgcolor: "#fdecea", border: "1px solid #f5c6cb" }}>
                <CardContent sx={{ textAlign: "center", py: 1.5 }}>
                  <Typography variant="h5" sx={{ fontWeight: 600, color: "#c62828" }}>{emailFailedPOs.length}</Typography>
                  <Typography variant="body2" color="text.secondary">Email Send Failures</Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Typography variant="subtitle1" sx={{ mb: 1, color: "#1976d2" }}>Unacknowledged Purchase Orders</Typography>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: "#f5f5f5" }}>
                  <TableCell sx={{ fontWeight: 600 }}>PO Number</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Supplier</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Order Date</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Due Date</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {unackedPOs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center">No unacknowledged purchase orders</TableCell>
                  </TableRow>
                ) : (
                  unackedPOs.map((po) => (
                    <TableRow key={po.id}>
                      <TableCell>{po.orderNumber || po.poNumber}</TableCell>
                      <TableCell>{po.supplier?.name || po.supplier}</TableCell>
                      <TableCell>{po.orderDate}</TableCell>
                      <TableCell>{po.expectedDelivery || po.dueDate}</TableCell>
                      <TableCell>
                        <Chip label={(po.status || "pending").toUpperCase()} size="small" color={po.status === "sent" ? "info" : "warning"} />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
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
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>{grn.grnNumber}</Typography>
                  </TableCell>
                  <TableCell>{grn.reference}</TableCell>
                  <TableCell>{grn.purchaseOrder?.supplier?.name || grn.supplier?.name || ""}</TableCell>
                  <TableCell>{new Date(grn.receiveDate).toLocaleDateString()}</TableCell>
                  <TableCell>{formatCurrency(grn.totals?.totalValue || grn.totalValue)}</TableCell>
                  <TableCell>
                    <Chip label={(grn.status || "").toUpperCase()} color={getStatusColor(grn.status)} size="small" />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: "flex", gap: 0.5 }}>
                      <Tooltip title="View Details"><IconButton size="small"><ViewIcon /></IconButton></Tooltip>
                      <Tooltip title="Edit GRN"><IconButton size="small"><EditIcon /></IconButton></Tooltip>
                      <Tooltip title="Print GRN"><IconButton size="small"><PrintIcon /></IconButton></Tooltip>
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
          setGrnFormOpen(false)
          refreshAll()
        }}
      />

      {/* Notification Snackbar */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={() => setNotification({ ...notification, open: false })}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert onClose={() => setNotification({ ...notification, open: false })} severity={notification.severity} sx={{ width: "100%" }}>
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}

export default GRNManagement
