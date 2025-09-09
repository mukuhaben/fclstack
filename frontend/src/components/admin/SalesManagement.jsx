"use client"

import { useState, useEffect } from "react"
import {
  Box,
  Paper,
  Typography,
  Tabs,
  Tab,
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
  Alert,
  Divider,
  Tooltip,
  Snackbar,
} from "@mui/material"
import { Add as AddIcon, Visibility as ViewIcon, Edit as EditIcon, Print as PrintIcon, Download as DownloadIcon, Receipt as ReceiptIcon, Description as InvoiceIcon, Close as CloseIcon } from "@mui/icons-material"

// Import the form components
import InvoiceForm from "./InvoiceForm"

// Tab Panel Component for organizing content
function TabPanel(props) {
  const { children, value, index, ...other } = props
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`sales-tabpanel-${index}`}
      aria-labelledby={`sales-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  )
}

/**
 * SalesManagement Component
 *
 * Comprehensive sales management system that handles:
 * - Invoices with full CRUD operations
 * - Customer receipts and order summaries
 * - Automated batch processing
 * - Integration with supplier and inventory systems
 */
const SalesManagement = () => {
  // Tab management state
  const [tabValue, setTabValue] = useState(0)

  // Data state for invoices and receipts
  const [invoices, setInvoices] = useState([])
  const [receipts, setReceipts] = useState([])

  // Form dialog states
  const [invoiceFormOpen, setInvoiceFormOpen] = useState(false)
  const [editingInvoice, setEditingInvoice] = useState(null)

  // View dialog states
  const [selectedInvoice, setSelectedInvoice] = useState(null)
  const [viewInvoiceDialogOpen, setViewInvoiceDialogOpen] = useState(false)


  // Notification state
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "success",
  })

  /**
   * Initialize sample data
   */
  useEffect(() => {
    initializeSampleData()
  }, [])

  /**
   * Initialize sample data for demonstration (invoices only)
   * In production, this would fetch from API endpoints
   */
  const initializeSampleData = () => {
    // Sample invoices with comprehensive data
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
      },
    ]
    setInvoices(sampleInvoices)
  }
  

  /**
   * Show notification to user
   */
  const showNotification = (message, severity = "success") => {
    setNotification({
      open: true,
      message,
      severity,
    })
  }

  /**
   * Handle tab change in the main navigation
   */
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue)
  }

  /**
   * Handle manual Invoice creation
   */
  const handleCreateInvoice = () => {
    setEditingInvoice(null)
    setInvoiceFormOpen(true)
  }

  /**
   * Handle Invoice save operation
   */
  const handleSaveInvoice = (invoiceData) => {
    if (editingInvoice) {
      // Update existing invoice
      setInvoices((prev) =>
        prev.map((invoice) => (invoice.id === editingInvoice.id ? { ...invoiceData, id: editingInvoice.id } : invoice)),
      )
      showNotification("Invoice updated successfully", "success")
    } else {
      // Create new invoice
      const newInvoice = {
        ...invoiceData,
        id: `INV${Date.now()}`,
        createdDate: new Date(),
      }
      setInvoices((prev) => [newInvoice, ...prev])
      showNotification("Invoice created successfully", "success")
    }
    setInvoiceFormOpen(false)
    setEditingInvoice(null)
  }

  /**
   * Handle viewing Invoice details
   */
  const handleViewInvoice = (invoice) => {
    setSelectedInvoice(invoice)
    setViewInvoiceDialogOpen(true)
  }

  /**
   * Handle editing Invoice
   */
  const handleEditInvoice = (invoice) => {
    setEditingInvoice(invoice)
    setInvoiceFormOpen(true)
  }

  /**
   * Format currency values for display
   */
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
    }).format(amount)
  }

  /**
   * Get status color for chips
   */
  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "warning"
      case "sent":
        return "info"
      case "delivered":
        return "success"
      case "cancelled":
        return "error"
      case "paid":
        return "success"
      case "overdue":
        return "error"
      default:
        return "default"
    }
  }

  return (
    <Box sx={{ width: "100%", bgcolor: "#f8fafc", minHeight: "100vh" }}>
      {/* Header with Manual Creation Buttons */}
      <Paper sx={{ mb: 3, borderRadius: 2, overflow: "hidden" }}>
        <Box sx={{ p: 3, bgcolor: "#1976d2", color: "white" }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Box>
              <Typography variant="h5" sx={{ fontFamily: "'Poppins', sans-serif", fontWeight: 600 }}>
                Sales Management
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9, mt: 1 }}>
                Manage Invoices and Receipts
              </Typography>
            </Box>

            {/* Manual Creation Buttons */}
            <Box sx={{ display: "flex", gap: 2 }}>
              
              <Button
                variant="contained"
                startIcon={<InvoiceIcon />}
                onClick={handleCreateInvoice}
                sx={{
                  bgcolor: "rgba(255,255,255,0.2)",
                  color: "white",
                  "&:hover": { bgcolor: "rgba(255,255,255,0.3)" },
                  fontFamily: "'Poppins', sans-serif",
                }}
              >
                Create Invoice
              </Button>
            </Box>
          </Box>
        </Box>

        
        {/* Navigation Tabs */}
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          aria-label="sales management tabs"
          sx={{
            "& .MuiTab-root": {
              textTransform: "none",
              fontSize: "0.9rem",
              fontWeight: 500,
              fontFamily: "'Poppins', sans-serif",
            },
          }}
        >
          <Tab icon={<InvoiceIcon />} label="Invoices" />
          <Tab icon={<ReceiptIcon />} label="Receipts" />
        </Tabs>
      </Paper>

      {/* Invoices Tab */}
      <TabPanel value={tabValue} index={0}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card sx={{ borderRadius: 2 }}>
              <CardContent>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                  <Typography variant="h6" sx={{ fontFamily: "'Poppins', sans-serif" }}>
                    Invoice Management
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleCreateInvoice}
                    sx={{ fontFamily: "'Poppins', sans-serif" }}
                  >
                    Create Invoice
                  </Button>
                </Box>

                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Invoice #</TableCell>
                        <TableCell>Customer</TableCell>
                        <TableCell>Date</TableCell>
                        <TableCell>Amount</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {invoices.map((invoice) => (
                        <TableRow key={invoice.id}>
                          <TableCell sx={{ fontWeight: 500 }}>{invoice.invoiceNumber}</TableCell>
                          <TableCell>{invoice.customerName}</TableCell>
                          <TableCell>
                            {(invoice.invoiceDate ? new Date(invoice.invoiceDate) : new Date()).toLocaleDateString(
                              "en-US",
                              {
                                year: "numeric",
                                month: "short",
                                day: "2-digit",
                              },
                            )}
                          </TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>{formatCurrency(invoice.totalAmount)}</TableCell>
                          <TableCell>
                            <Chip label={invoice.status} color={getStatusColor(invoice.status)} size="small" />
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
                              <Tooltip title="Print">
                                <IconButton size="small">
                                  <PrintIcon />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Download">
                                <IconButton size="small">
                                  <DownloadIcon />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))}
                      {invoices.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={6} sx={{ textAlign: "center", py: 4 }}>
                            <Typography color="text.secondary">
                              No invoices found. Click "Create Invoice" to add your first invoice.
                            </Typography>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Receipts Tab */}
      <TabPanel value={tabValue} index={1}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card sx={{ borderRadius: 2 }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2, fontFamily: "'Poppins', sans-serif" }}>
                  Customer Receipts
                </Typography>
                <Alert severity="info">
                  Receipt management functionality - Customer receipt order summaries will be displayed here.
                </Alert>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      
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
      
      {/* Invoice Details Dialog */}
      <Dialog open={viewInvoiceDialogOpen} onClose={() => setViewInvoiceDialogOpen(false)} maxWidth="lg" fullWidth>
        <DialogTitle>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Typography variant="h6">Invoice Details</Typography>
            <IconButton onClick={() => setViewInvoiceDialogOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedInvoice && (
            <Box>
              {/* Company Header */}
              <Box sx={{ textAlign: "center", mb: 3, p: 2, bgcolor: "#f5f5f5", borderRadius: 1 }}>
                <Typography variant="h5" sx={{ fontWeight: 600, color: "#1976d2" }}>
                  First Craft Ltd
                </Typography>
                <Typography variant="body2">P.O.Box 38869-00623</Typography>
                <Typography variant="body2">Nairobi Kenya</Typography>
                <Typography variant="body2">
                  Email: manager@fcl.co.ke | Website: https://www.fcl.co.ke | KRA Pin: P052130436J
                </Typography>
              </Box>

              {/* Invoice Info */}
              <Grid container spacing={3} sx={{ mb: 3 }}>
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
                </Grid>
                <Grid item xs={6}>
                  <Box sx={{ textAlign: "right" }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                      Invoice {selectedInvoice.invoiceNumber}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Invoice Date:</strong>{" "}
                      {(selectedInvoice.invoiceDate
                        ? new Date(selectedInvoice.invoiceDate)
                        : new Date()
                      ).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                      })}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Source:</strong> {selectedInvoice.source}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>

              {/* Items Table */}
              <TableContainer sx={{ mb: 3 }}>
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: "#f0f0f0" }}>
                      <TableCell>#</TableCell>
                      <TableCell>Description</TableCell>
                      <TableCell>Quantity</TableCell>
                      <TableCell>Unit Price</TableCell>
                      <TableCell>Total Amount</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(selectedInvoice.items || []).map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            [{item.productCode}] {item.description}
                          </Typography>
                        </TableCell>
                        <TableCell>{item.quantity} Pc</TableCell>
                        <TableCell>{formatCurrency(item.unitPrice)}</TableCell>
                        <TableCell sx={{ fontWeight: 500 }}>{formatCurrency(item.totalAmount)}</TableCell>
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
                  <Paper sx={{ p: 2, bgcolor: "#f5f5f5" }}>
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
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewInvoiceDialogOpen(false)}>Close</Button>
          <Button variant="outlined" startIcon={<PrintIcon />}>
            Print
          </Button>
          <Button variant="contained" startIcon={<DownloadIcon />}>
            Download PDF
          </Button>
        </DialogActions>
      </Dialog>

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

export default SalesManagement
