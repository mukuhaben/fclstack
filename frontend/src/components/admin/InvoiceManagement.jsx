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
  Card,
  CardContent,
  Grid,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Alert,
  Tooltip,
  Menu,
  ListItemIcon,
  ListItemText,
  Avatar,
} from "@mui/material"
import {
  Add as AddIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Print as PrintIcon,
  Download as DownloadIcon,
  Email as EmailIcon,
  Sort as SortIcon,
  FilterList as FilterIcon,
  Search as SearchIcon,
  Receipt as ReceiptIcon,
  Payment as PaymentIcon,
  Business as BusinessIcon,
  DateRange as DateRangeIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  AttachMoney as MoneyIcon,
} from "@mui/icons-material"
import InvoiceForm from "./InvoiceForm"
import firstCraftLogo from "../../assets/images/FirstCraft-logo.png" // Import the logo

// Define print styles
const printStyles = `
  @media print {
    body * {
      visibility: hidden;
    }
    .printable-invoice, .printable-invoice * {
      visibility: visible;
    }
    .printable-invoice {
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
      height: auto;
      margin: 0;
      padding: 20px;
      box-shadow: none;
    }
    .no-print, .no-print * {
      display: none !important;
    }
    .printable-invoice .invoice-header-print {
      background-color: #0056B3 !important; /* FirstCraft Primary Blue */
      color: white !important;
      padding: 16px !important;
      border-radius: 4px 4px 0 0 !important;
      -webkit-print-color-adjust: exact !important; /* Chrome, Safari */
      print-color-adjust: exact !important; /* Firefox, Edge */
    }
    .printable-invoice .invoice-title-print {
      color: white !important;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
     .printable-invoice .print-table-header th {
      background-color: #e0e0e0 !important; /* Light grey for table headers */
      color: #333 !important;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    .printable-invoice .total-summary-print {
       background-color: #f0f0f0 !important;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
     .printable-invoice img { /* Ensure images are printed */
      max-width: 100% !important;
    }
  }
`;

/**
 * InvoiceManagement Component
 *
 * Comprehensive invoice management system with CRUD operations,
 * sorting, filtering, and detailed invoice viewing capabilities.
 * Integrates with the existing application structure.
 */
const InvoiceManagement = () => {
  // State management for invoices
  const [invoices, setInvoices] = useState([])
  const [filteredInvoices, setFilteredInvoices] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [sortConfig, setSortConfig] = useState({ key: "invoiceDate", direction: "desc" })
  const [filterStatus, setFilterStatus] = useState("all")
  const [selectedInvoice, setSelectedInvoice] = useState(null)

  // Dialog states
  const [invoiceFormOpen, setInvoiceFormOpen] = useState(false)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [editingInvoice, setEditingInvoice] = useState(null)

  // Menu states
  const [sortMenuAnchor, setSortMenuAnchor] = useState(null)
  const [filterMenuAnchor, setFilterMenuAnchor] = useState(null)

  // Alert state
  const [alert, setAlert] = useState({ open: false, message: "", severity: "success" })

  /**
   * Initialize sample invoice data
   * In a real application, this would fetch from an API
   */
  useEffect(() => {
    const sampleInvoices = [
      {
        id: "INV001",
        invoiceNumber: "KRACU0300001581/2",
        customerId: "CUST001",
        customerName: "Paw Pack Ltd",
        customerAddress: "Ring Road Parklands Opp Apollo Centre\nNairobi K 00100\nKenya",
        customerTaxId: "P052296194R",
        customerEmail: "info@pawpack.co.ke",
        customerPhone: "+254 722 123 456",
        invoiceDate: new Date("2024-11-21"),
        deliveryDate: new Date("2024-11-21"),
        dueDate: new Date("2024-12-21"),
        source: "S00004",
        items: [
          {
            productCode: "L0202004",
            description: "Afri Multipurpose Labels K11 19*13mm White",
            quantity: 1,
            unitPrice: 50.0,
            taxRate: 16,
            taxableAmount: 43.1,
            totalAmount: 50.0,
          },
          {
            productCode: "P0601005",
            description: "Afri Packing Tape (Brown) 48mm*100Mtr 701",
            quantity: 1,
            unitPrice: 165.0,
            taxRate: 16,
            taxableAmount: 142.24,
            totalAmount: 165.0,
          },
          {
            productCode: "C0201003",
            description: "Counter Books KB A4 3 Quire REF 233",
            quantity: 1,
            unitPrice: 320.0,
            taxRate: 16,
            taxableAmount: 275.86,
            totalAmount: 320.0,
          },
          {
            productCode: "P0401001",
            description: "Petty Cash Voucher White A6 Ref 283",
            quantity: 6,
            unitPrice: 39.0,
            taxRate: 16,
            taxableAmount: 201.72,
            totalAmount: 234.0,
          },
          {
            productCode: "DELIVERY",
            description: "Westlands Delivery Charges",
            quantity: 1,
            unitPrice: 1.0,
            taxRate: 16,
            taxableAmount: 0.86,
            totalAmount: 1.0,
          },
        ],
        subtotal: 663.78,
        taxAmount: 106.22,
        totalAmount: 770.0,
        paidAmount: 770.0,
        amountDue: 0,
        paymentMethod: "MOBILE MONEY",
        paymentTerms: "Immediate Payment",
        status: "paid",
        createdDate: new Date("2024-11-21"),
        scuInfo: {
          date: "2024-11-21",
          time: "15:16:55",
          scuId: "KRACU0300001581",
          receiptNumber: 2,
          itemCount: 5,
          internalData: "UTJK-F4R3-33AP-MHRP-WXYK-5J7Y-KY",
          receiptSignature: "GY52-7NDT-JA7R-5Z7J",
        },
      },
      {
        id: "INV002",
        invoiceNumber: "KRACU0300001582/1",
        customerId: "CUST002",
        customerName: "ABC School",
        customerAddress: "Westlands Road\nNairobi K 00100\nKenya",
        customerTaxId: "P052123456A",
        customerEmail: "admin@abcschool.ac.ke",
        customerPhone: "+254 733 987 654",
        invoiceDate: new Date("2024-11-20"),
        deliveryDate: new Date("2024-11-20"),
        dueDate: new Date("2024-12-20"),
        source: "S00005",
        items: [
          {
            productCode: "C0201003",
            description: "Counter Books KB A4 3 Quire REF 233",
            quantity: 10,
            unitPrice: 320.0,
            taxRate: 16,
            taxableAmount: 2758.6,
            totalAmount: 3200.0,
          },
        ],
        subtotal: 2758.6,
        taxAmount: 441.4,
        totalAmount: 3200.0,
        paidAmount: 0,
        amountDue: 3200.0,
        paymentMethod: "BANK TRANSFER",
        paymentTerms: "Net 30",
        status: "pending",
        createdDate: new Date("2024-11-20"),
        scuInfo: {
          date: "2024-11-20",
          time: "10:30:22",
          scuId: "KRACU0300001582",
          receiptNumber: 1,
          itemCount: 1,
          internalData: "XYZK-G5T4-44BP-NIQP-WXYJ-6K8Z-LZ",
          receiptSignature: "HZ63-8OEU-KB8S-6A8K",
        },
      },
      {
        id: "INV003",
        invoiceNumber: "KRACU0300001583/1",
        customerId: "CUST003",
        customerName: "Tech Solutions Kenya",
        customerAddress: "Kilimani, Nairobi\nKenya",
        customerTaxId: "P051456789C",
        customerEmail: "info@techsolutions.ke",
        customerPhone: "+254 733 456 789",
        invoiceDate: new Date("2024-11-19"),
        deliveryDate: new Date("2024-11-19"),
        dueDate: new Date("2024-12-19"),
        source: "S00006",
        items: [
          {
            productCode: "P0401001",
            description: "Petty Cash Voucher White A6 Ref 283",
            quantity: 20,
            unitPrice: 39.0,
            taxRate: 16,
            taxableAmount: 672.4,
            totalAmount: 780.0,
          },
        ],
        subtotal: 672.4,
        taxAmount: 107.6,
        totalAmount: 780.0,
        paidAmount: 780.0,
        amountDue: 0,
        paymentMethod: "CASH",
        paymentTerms: "Immediate Payment",
        status: "paid",
        createdDate: new Date("2024-11-19"),
        scuInfo: {
          date: "2024-11-19",
          time: "14:45:10",
          scuId: "KRACU0300001583",
          receiptNumber: 1,
          itemCount: 1,
          internalData: "ABCD-E1F2-55CP-OIRP-WXYK-7L9A-MZ",
          receiptSignature: "IZ74-9PFV-LC9T-7B9L",
        },
      },
      {
        id: "INV004",
        invoiceNumber: "KRACU0300001584/1",
        customerId: "CUST001",
        customerName: "Paw Pack Ltd",
        customerAddress: "Ring Road Parklands Opp Apollo Centre\nNairobi K 00100\nKenya",
        customerTaxId: "P052296194R",
        customerEmail: "info@pawpack.co.ke",
        customerPhone: "+254 722 123 456",
        invoiceDate: new Date("2024-11-18"),
        deliveryDate: new Date("2024-11-18"),
        dueDate: new Date("2024-12-18"),
        source: "S00007",
        items: [
          {
            productCode: "L0202004",
            description: "Afri Multipurpose Labels K11 19*13mm White",
            quantity: 5,
            unitPrice: 50.0,
            taxRate: 16,
            taxableAmount: 215.5,
            totalAmount: 250.0,
          },
        ],
        subtotal: 215.5,
        taxAmount: 34.5,
        totalAmount: 250.0,
        paidAmount: 0,
        amountDue: 250.0,
        paymentMethod: "CREDIT",
        paymentTerms: "Net 15",
        status: "overdue",
        createdDate: new Date("2024-11-18"),
        scuInfo: {
          date: "2024-11-18",
          time: "09:15:33",
          scuId: "KRACU0300001584",
          receiptNumber: 1,
          itemCount: 1,
          internalData: "EFGH-I3J4-66DP-QJSP-WXYK-8M0B-NZ",
          receiptSignature: "JZ85-0QGW-MD0U-8C0M",
        },
      },
    ]

    setInvoices(sampleInvoices)
    setFilteredInvoices(sampleInvoices)
  }, [])

  /**
   * Apply search and filter to invoices
   */
  useEffect(() => {
    const filtered = invoices.filter((invoice) => {
      const matchesSearch =
        invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.customerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.source.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesStatus = filterStatus === "all" || invoice.status === filterStatus

      return matchesSearch && matchesStatus
    })

    // Apply sorting
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        let aValue = a[sortConfig.key]
        let bValue = b[sortConfig.key]

        // Handle date sorting
        if (sortConfig.key.includes("Date")) {
          aValue = new Date(aValue)
          bValue = new Date(bValue)
        }

        // Handle numeric sorting
        if (typeof aValue === "number" && typeof bValue === "number") {
          return sortConfig.direction === "asc" ? aValue - bValue : bValue - aValue
        }

        // Handle string sorting
        if (aValue < bValue) {
          return sortConfig.direction === "asc" ? -1 : 1
        }
        if (aValue > bValue) {
          return sortConfig.direction === "asc" ? 1 : -1
        }
        return 0
      })
    }

    setFilteredInvoices(filtered)
  }, [invoices, searchTerm, filterStatus, sortConfig])

  /**
   * Handle sorting configuration
   * @param {string} key - The field to sort by
   */
  const handleSort = (key) => {
    setSortConfig((prevConfig) => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === "asc" ? "desc" : "asc",
    }))
    setSortMenuAnchor(null)
  }

  /**
   * Handle invoice creation/editing
   * @param {Object} invoiceData - The invoice data to save
   */
  const handleSaveInvoice = (invoiceData) => {
    if (editingInvoice) {
      // Update existing invoice
      setInvoices((prev) =>
        prev.map((invoice) =>
          invoice.id === editingInvoice.id
            ? { ...invoiceData, id: editingInvoice.id, updatedDate: new Date() }
            : invoice,
        ),
      )
      setAlert({ open: true, message: "Invoice updated successfully!", severity: "success" })
    } else {
      // Create new invoice
      const newInvoice = {
        ...invoiceData,
        id: `INV${Date.now()}`,
        createdDate: new Date(),
      }
      setInvoices((prev) => [newInvoice, ...prev])
      setAlert({ open: true, message: "Invoice created successfully!", severity: "success" })
    }

    setInvoiceFormOpen(false)
    setEditingInvoice(null)
  }

  /**
   * Handle invoice deletion
   */
  const handleDeleteInvoice = () => {
    if (selectedInvoice) {
      setInvoices((prev) => prev.filter((invoice) => invoice.id !== selectedInvoice.id))
      setAlert({ open: true, message: "Invoice deleted successfully!", severity: "success" })
      setDeleteDialogOpen(false)
      setSelectedInvoice(null)
    }
  }

  /**
   * Open invoice for editing
   * @param {Object} invoice - The invoice to edit
   */
  const handleEditInvoice = (invoice) => {
    setEditingInvoice(invoice)
    setInvoiceFormOpen(true)
  }

  /**
   * Open invoice for viewing
   * @param {Object} invoice - The invoice to view
   */
  const handleViewInvoice = (invoice) => {
    setSelectedInvoice(invoice)
    setViewDialogOpen(true)
  }

  /**
   * Format currency values
   * @param {number} amount - The amount to format
   * @returns {string} Formatted currency string
   */
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)
  }

  /**
   * Get status color for chips
   * @param {string} status - The status to get color for
   * @returns {string} Material-UI color name
   */
  const getStatusColor = (status) => {
    switch (status) {
      case "paid":
        return "success"
      case "pending":
        return "warning"
      case "overdue":
        return "error"
      case "cancelled":
        return "default"
      default:
        return "default"
    }
  }

  /**
   * Calculate summary statistics
   */
  const calculateSummary = () => {
    const total = filteredInvoices.reduce((sum, invoice) => sum + invoice.totalAmount, 0)
    const paid = filteredInvoices.reduce((sum, invoice) => sum + invoice.paidAmount, 0)
    const outstanding = filteredInvoices.reduce((sum, invoice) => sum + invoice.amountDue, 0)
    const count = filteredInvoices.length

    return { total, paid, outstanding, count }
  }

  const summary = calculateSummary()

  return (
    <Box sx={{ width: "100%", bgcolor: "#f8fafc", minHeight: "100vh" }}>
      {/* Header */}
      <Paper sx={{ mb: 3, borderRadius: 2, overflow: "hidden" }}>
        <Box sx={{ p: 3, bgcolor: "#1976d2", color: "white" }}>
          <Typography variant="h5" sx={{ fontFamily: "'Poppins', sans-serif", fontWeight: 600 }}>
            Invoice Management
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.9, mt: 1 }}>
            Create, view, edit, and manage customer invoices
          </Typography>
        </Box>

        {/* Summary Cards */}
        <Box sx={{ p: 3, bgcolor: "#f5f5f5" }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={3}>
              <Card sx={{ bgcolor: "#e3f2fd", borderLeft: "4px solid #1976d2" }}>
                <CardContent sx={{ p: 2 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <ReceiptIcon color="primary" />
                    <Box>
                      <Typography variant="h6" color="primary" sx={{ fontWeight: 600 }}>
                        {summary.count}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Total Invoices
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={3}>
              <Card sx={{ bgcolor: "#e8f5e8", borderLeft: "4px solid #4caf50" }}>
                <CardContent sx={{ p: 2 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <PaymentIcon color="success" />
                    <Box>
                      <Typography variant="h6" color="success.main" sx={{ fontWeight: 600 }}>
                        {formatCurrency(summary.paid)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Total Paid
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={3}>
              <Card sx={{ bgcolor: "#fff3e0", borderLeft: "4px solid #ff9800" }}>
                <CardContent sx={{ p: 2 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <MoneyIcon color="warning" />
                    <Box>
                      <Typography variant="h6" color="warning.main" sx={{ fontWeight: 600 }}>
                        {formatCurrency(summary.outstanding)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Outstanding
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={3}>
              <Card sx={{ bgcolor: "#e1f5fe", borderLeft: "4px solid #03a9f4" }}>
                <CardContent sx={{ p: 2 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <TrendingUpIcon color="info" />
                    <Box>
                      <Typography variant="h6" color="info.main" sx={{ fontWeight: 600 }}>
                        {formatCurrency(summary.total)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Total Value
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      </Paper>

      {/* Controls */}
      <Paper sx={{ mb: 3, p: 3, borderRadius: 2 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
          <Typography variant="h6" sx={{ fontFamily: "'Poppins', sans-serif" }}>
            Invoice List
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => {
              setEditingInvoice(null)
              setInvoiceFormOpen(true)
            }}
            sx={{ fontFamily: "'Poppins', sans-serif" }}
          >
            Create Invoice
          </Button>
        </Box>

        {/* Search and Filter Controls */}
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder="Search invoices..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />,
              }}
              size="small"
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Status Filter</InputLabel>
              <Select value={filterStatus} label="Status Filter" onChange={(e) => setFilterStatus(e.target.value)}>
                <MenuItem value="all">All Status</MenuItem>
                <MenuItem value="paid">Paid</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="overdue">Overdue</MenuItem>
                <MenuItem value="cancelled">Cancelled</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<SortIcon />}
              onClick={(e) => setSortMenuAnchor(e.currentTarget)}
              size="small"
            >
              Sort
            </Button>
          </Grid>
          <Grid item xs={12} md={2}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<FilterIcon />}
              onClick={(e) => setFilterMenuAnchor(e.currentTarget)}
              size="small"
            >
              Filter
            </Button>
          </Grid>
        </Grid>

        {/* Alert Messages */}
        {alert.open && (
          <Alert severity={alert.severity} onClose={() => setAlert({ ...alert, open: false })} sx={{ mb: 2 }}>
            {alert.message}
          </Alert>
        )}

        {/* Invoice Table */}
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: "#f5f5f5" }}>
                <TableCell sx={{ fontWeight: 600 }}>Invoice #</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Customer</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Due Date</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Amount</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Paid</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Balance</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredInvoices.map((invoice) => (
                <TableRow key={invoice.id} hover>
                  <TableCell sx={{ fontWeight: 500, fontFamily: "monospace" }}>{invoice.invoiceNumber}</TableCell>
                  <TableCell>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Avatar sx={{ width: 32, height: 32, bgcolor: "#1976d2" }}>
                        <BusinessIcon fontSize="small" />
                      </Avatar>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {invoice.customerName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {invoice.customerEmail}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <DateRangeIcon fontSize="small" color="action" />
                      {invoice.invoiceDate.toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "2-digit",
                      })}
                    </Box>
                  </TableCell>
                  <TableCell>
                    {invoice.dueDate.toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "2-digit",
                    })}
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>{formatCurrency(invoice.totalAmount)}</TableCell>
                  <TableCell sx={{ color: "success.main", fontWeight: 500 }}>
                    {formatCurrency(invoice.paidAmount)}
                  </TableCell>
                  <TableCell sx={{ color: invoice.amountDue > 0 ? "error.main" : "success.main", fontWeight: 500 }}>
                    {formatCurrency(invoice.amountDue)}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                      color={getStatusColor(invoice.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: "flex", gap: 0.5 }}>
                      <Tooltip title="View Invoice">
                        <IconButton size="small" onClick={() => handleViewInvoice(invoice)}>
                          <ViewIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit Invoice">
                        <IconButton size="small" onClick={() => handleEditInvoice(invoice)}>
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Print Invoice">
                        <IconButton size="small">
                          <PrintIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Download PDF">
                        <IconButton size="small">
                          <DownloadIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Send Email">
                        <IconButton size="small">
                          <EmailIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete Invoice">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => {
                            setSelectedInvoice(invoice)
                            setDeleteDialogOpen(true)
                          }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
              {filteredInvoices.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} sx={{ textAlign: "center", py: 4 }}>
                    <Typography color="text.secondary">No invoices found matching your criteria.</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Sort Menu */}
      <Menu anchorEl={sortMenuAnchor} open={Boolean(sortMenuAnchor)} onClose={() => setSortMenuAnchor(null)}>
        <MenuItem onClick={() => handleSort("invoiceDate")}>
          <ListItemIcon>
            {sortConfig.key === "invoiceDate" && sortConfig.direction === "asc" ? (
              <TrendingUpIcon />
            ) : (
              <TrendingDownIcon />
            )}
          </ListItemIcon>
          <ListItemText>Sort by Date</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleSort("customerName")}>
          <ListItemIcon>
            {sortConfig.key === "customerName" && sortConfig.direction === "asc" ? (
              <TrendingUpIcon />
            ) : (
              <TrendingDownIcon />
            )}
          </ListItemIcon>
          <ListItemText>Sort by Customer</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleSort("totalAmount")}>
          <ListItemIcon>
            {sortConfig.key === "totalAmount" && sortConfig.direction === "asc" ? (
              <TrendingUpIcon />
            ) : (
              <TrendingDownIcon />
            )}
          </ListItemIcon>
          <ListItemText>Sort by Amount</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleSort("status")}>
          <ListItemIcon>
            {sortConfig.key === "status" && sortConfig.direction === "asc" ? <TrendingUpIcon /> : <TrendingDownIcon />}
          </ListItemIcon>
          <ListItemText>Sort by Status</ListItemText>
        </MenuItem>
      </Menu>

      {/* Invoice Form Dialog */}
      <InvoiceForm
        open={invoiceFormOpen}
        onClose={() => {
          setInvoiceFormOpen(false)
          setEditingInvoice(null)
        }}
        onSave={handleSaveInvoice}
        editInvoice={editingInvoice}
      />

      {/* View Invoice Dialog */}
      <Dialog open={viewDialogOpen} onClose={() => setViewDialogOpen(false)} maxWidth="lg" fullWidth>
        <DialogTitle>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Typography variant="h6">Invoice Details</Typography>
            <Typography variant="body2" color="text.secondary" className="no-print">
              {/* This specific invoice number display might be redundant if it's in the printable area already */}
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          {/* Inject print styles */}
          <style>{printStyles}</style>
          {selectedInvoice && (
            <Box className="printable-invoice"> {/* Add printable area class */}
              {/* Logo and Company Header */}
              <Box
                className="invoice-header-print" // Class for print styling
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  mb: 2,
                  p: 2,
                  borderBottom: '1px solid #eee',
                  // Default screen styles (can be overridden by printStyles)
                  bgcolor: { xs: "#f5f5f5", print: "#0056B3" },
                  color: { xs: "inherit", print: "white" }
                }}
              >
                <Box>
                  <img src={firstCraftLogo} alt="FirstCraft Logo" style={{ height: '60px', marginBottom: '10px' }} />
                  <Typography variant="h5" sx={{ fontWeight: 600, color: "#1976d2" }}>
                    First Craft Ltd
                  </Typography>
                  <Typography variant="body2">P.O.Box 38869-00623</Typography>
                  <Typography variant="body2">Nairobi Kenya</Typography>
                  <Typography variant="body2">
                    Email: manager@fcl.co.ke | Website: https://www.fcl.co.ke
                  </Typography>
                  <Typography variant="body2">KRA Pin: P052130436J</Typography>
                </Box>
                <Box sx={{ textAlign: "right" }}>
                    <Typography variant="h4" className="invoice-title-print" sx={{ fontWeight: 700, color: {xs: "#333", print: "white"}, textTransform: "uppercase" }}>
                      Invoice
                    </Typography>
                </Box>
              </Box>


              {/* Invoice Info */}
              <Grid container spacing={3} sx={{ mb: 3, p:2 }}>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Bill To:
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {selectedInvoice.customerName}
                  </Typography>
                  <Typography variant="body2" sx={{ whiteSpace: "pre-line" }}>
                    {selectedInvoice.customerAddress}
                  </Typography>
                  <Typography variant="body2">Tax ID: {selectedInvoice.customerTaxId}</Typography>
                  <Typography variant="body2">Email: {selectedInvoice.customerEmail}</Typography>
                  <Typography variant="body2">Phone: {selectedInvoice.customerPhone}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Box sx={{ textAlign: "right" }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                      Invoice {selectedInvoice.invoiceNumber}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Invoice Date:</strong>{" "}
                      {selectedInvoice.invoiceDate.toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                      })}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Delivery Date:</strong>{" "}
                      {selectedInvoice.deliveryDate.toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                      })}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Due Date:</strong>{" "}
                      {selectedInvoice.dueDate.toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                      })}
                    </Typography>
                    <Typography variant="body2" sx={{ color: selectedInvoice.status === 'paid' ? 'green' : 'inherit' }}>
                      <strong>Date Paid:</strong>{" "}
                      {selectedInvoice.datePaid
                        ? new Date(selectedInvoice.datePaid).toLocaleDateString("en-US", { year: 'numeric', month: '2-digit', day: '2-digit' })
                        : (selectedInvoice.status === "paid" ? selectedInvoice.invoiceDate.toLocaleDateString("en-US", { year: 'numeric', month: '2-digit', day: '2-digit' }) : "N/A")}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Source:</strong> {selectedInvoice.source}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>

              {/* Items Table */}
              <TableContainer sx={{ mb: 3, p:2 }}>
                <Table>
                  <TableHead className="print-table-header">
                    <TableRow sx={{ bgcolor: {xs: "#f0f0f0", print: "#e0e0e0"} }}>
                      <TableCell>#</TableCell>
                      <TableCell>Description</TableCell>
                      <TableCell align="right">Quantity</TableCell>
                      <TableCell align="right">Unit Price</TableCell>
                      <TableCell align="right">Tax Rate</TableCell>
                      <TableCell align="right">Taxable Amount</TableCell>
                      <TableCell align="right">Total Amount</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {selectedInvoice.items.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            [{item.productCode}] {item.description}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">{item.quantity} Pc</TableCell>
                        <TableCell align="right">{formatCurrency(item.unitPrice)}</TableCell>
                        <TableCell align="right">({item.taxRate}%)</TableCell>
                        <TableCell align="right">{formatCurrency(item.taxableAmount)}</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 500 }}>
                          {formatCurrency(item.totalAmount)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              {/* Summary */}
              <Grid container spacing={3}>
                <Grid item xs={8}>
                  <Typography variant="body2">
                    <strong>Payment terms:</strong> {selectedInvoice.paymentTerms}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Payment Method:</strong> {selectedInvoice.paymentMethod}
                  </Typography>
                </Grid>
                <Grid item xs={4}>
                  <Paper className="total-summary-print" sx={{ p: 2, bgcolor: {xs: "#f5f5f5", print: "#f0f0f0"} }}>
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>
                      Invoice Summary
                    </Typography>
                    <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                      <Typography variant="body2">Subtotal:</Typography>
                      <Typography variant="body2">{formatCurrency(selectedInvoice.subtotal)}</Typography>
                    </Box>
                    <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                      <Typography variant="body2">Tax Amount:</Typography>
                      <Typography variant="body2">{formatCurrency(selectedInvoice.taxAmount)}</Typography>
                    </Box>
                    <Divider sx={{ my: 1 }} />
                    <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        Total:
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        {formatCurrency(selectedInvoice.totalAmount)}
                      </Typography>
                    </Box>
                    <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                      <Typography variant="body2">Paid:</Typography>
                      <Typography variant="body2" color="success.main">
                        {formatCurrency(selectedInvoice.paidAmount)}
                      </Typography>
                    </Box>
                    <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                      <Typography variant="body2">Amount Due:</Typography>
                      <Typography variant="body2" color={selectedInvoice.amountDue > 0 ? "error.main" : "success.main"}>
                        {formatCurrency(selectedInvoice.amountDue)}
                      </Typography>
                    </Box>
                  </Paper>
                </Grid>
              </Grid>

              {/* SCU Information */}
              {selectedInvoice.scuInfo && (
                <Box sx={{ mt: 3, p: 2, bgcolor: "#e3f2fd", borderRadius: 1 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    SCU Information
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="body2">
                        <strong>Date:</strong> {selectedInvoice.scuInfo.date} {selectedInvoice.scuInfo.time}
                      </Typography>
                      <Typography variant="body2">
                        <strong>SCU ID:</strong> {selectedInvoice.scuInfo.scuId}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Receipt Number:</strong> {selectedInvoice.scuInfo.receiptNumber}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2">
                        <strong>Payment Method:</strong> {selectedInvoice.paymentMethod}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Item Count:</strong> {selectedInvoice.scuInfo.itemCount}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Receipt Signature:</strong> {selectedInvoice.scuInfo.receiptSignature}
                      </Typography>
                    </Grid>
                  </Grid>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions className="no-print">
          <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
          <Button variant="outlined" startIcon={<PrintIcon />} onClick={() => window.print()}>
            Print
          </Button>
          <Button variant="contained" startIcon={<DownloadIcon />}>
            Download PDF
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete invoice {selectedInvoice?.invoiceNumber}? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteInvoice} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default InvoiceManagement
