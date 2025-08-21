"use client"

import { useState, useEffect } from "react"
import {
  Box,
  Paper,
  Typography,
  TextField,
  Grid,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Autocomplete,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Snackbar,
  Chip,
} from "@mui/material"
import {
  Save as SaveIcon,
  Print as PrintIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
} from "@mui/icons-material"

// Sample purchase orders data
const samplePurchaseOrders = [
  {
    id: "PO123456",
    poNumber: "PO123456",
    supplier: {
      id: 1,
      name: "Afri Supplies Ltd",
      contact: "John Kamau",
      email: "info@afrisupplies.co.ke",
      phone: "+254 722 123 456",
    },
    orderDate: "2024-06-01",
    dueDate: "2024-06-15",
    status: "pending",
    items: [
      {
        id: 1,
        productCode: "L0202004",
        productName: "Afri Multipurpose Labels K11 19*13mm White",
        quantity: 10,
        rate: 50.0,
        taxPercent: 16,
        tax: 80.0,
        discount: 0,
        amount: 580.0,
      },
      {
        id: 2,
        productCode: "P0601005",
        productName: "Afri Packing Tape (Brown) 48mm*100Mtr",
        quantity: 5,
        rate: 165.0,
        taxPercent: 16,
        tax: 132.0,
        discount: 0,
        amount: 957.0,
      },
    ],
    totals: {
      subtotal: 1325.0,
      totalTax: 212.0,
      totalDiscount: 0,
      grandTotal: 1537.0,
    },
  },
  {
    id: "PO789012",
    poNumber: "PO789012",
    supplier: {
      id: 2,
      name: "KB Stationery Ltd",
      contact: "Mary Wanjiku",
      email: "sales@kbstationery.co.ke",
      phone: "+254 733 987 654",
    },
    orderDate: "2024-06-02",
    dueDate: "2024-06-16",
    status: "pending",
    items: [
      {
        id: 1,
        productCode: "C0201003",
        productName: "Counter Books KB A4 3 Quire REF 233",
        quantity: 20,
        rate: 320.0,
        taxPercent: 16,
        tax: 1024.0,
        discount: 0,
        amount: 7424.0,
      },
    ],
    totals: {
      subtotal: 6400.0,
      totalTax: 1024.0,
      totalDiscount: 0,
      grandTotal: 7424.0,
    },
  },
]

// Sample warehouses
const warehouses = [
  { id: 1, name: "Main Warehouse" },
  { id: 2, name: "Westlands Branch" },
  { id: 3, name: "Parklands Branch" },
]

/**
 * GoodsReceivedNoteForm Component
 *
 * This component provides a form for creating and editing Goods Received Notes (GRN).
 * It allows selecting a purchase order and recording received items.
 *
 * @param {Object} props - Component props
 * @param {boolean} props.open - Controls dialog visibility
 * @param {Function} props.onClose - Function to call when closing the dialog
 * @param {Function} props.onSave - Function to call when saving the GRN
 * @param {Object} props.editGRN - GRN data for editing (optional)
 */
const GoodsReceivedNoteForm = ({ open, onClose, onSave, editGRN = null }) => {
  // State for GRN data
  const [grn, setGrn] = useState({
    grnNumber: generateGRNNumber(),
    reference: "",
    receiveDate: new Date().toISOString().split("T")[0],
    purchaseOrder: null,
    warehouse: null,
    notes: "",
    items: [],
    totals: {
      totalItems: 0,
      totalReceived: 0,
      totalPending: 0,
    },
  })

  // State for notifications
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "success",
  })

  // Effect to populate form when editing
  useEffect(() => {
    if (editGRN) {
      setGrn(editGRN)
    } else {
      // Reset form for new GRN
      setGrn({
        grnNumber: generateGRNNumber(),
        reference: "",
        receiveDate: new Date().toISOString().split("T")[0],
        purchaseOrder: null,
        warehouse: null,
        notes: "",
        items: [],
        totals: {
          totalItems: 0,
          totalReceived: 0,
          totalPending: 0,
        },
      })
    }
  }, [editGRN, open])

  // Effect to calculate totals when items change
  useEffect(() => {
    calculateTotals()
  }, [grn.items])

  /**
   * Generates a unique GRN number
   * @returns {string} GRN number
   */
  function generateGRNNumber() {
    const prefix = "GRN"
    const timestamp = Date.now().toString().slice(-6)
    const random = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0")
    return `${prefix}${timestamp}${random}`
  }

  /**
   * Calculates totals for the GRN
   */
  const calculateTotals = () => {
    if (!grn.items.length) return

    const totalItems = grn.items.reduce((sum, item) => sum + item.orderedQuantity, 0)
    const totalReceived = grn.items.reduce((sum, item) => sum + item.receivedQuantity, 0)
    const totalPending = totalItems - totalReceived

    setGrn((prev) => ({
      ...prev,
      totals: {
        totalItems,
        totalReceived,
        totalPending,
      },
    }))
  }

  /**
   * Handles changes to GRN fields
   * @param {string} field - Field name
   * @param {any} value - New value
   */
  const handleGRNChange = (field, value) => {
    setGrn((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  /**
   * Handles purchase order selection
   * @param {Object} po - Selected purchase order
   */
  const handlePOSelect = (po) => {
    if (!po) {
      setGrn((prev) => ({
        ...prev,
        purchaseOrder: null,
        items: [],
      }))
      return
    }

    // Map PO items to GRN items
    const grnItems = po.items.map((item) => ({
      id: item.id,
      productCode: item.productCode,
      productName: item.productName,
      orderedQuantity: item.quantity,
      receivedQuantity: 0,
      pendingQuantity: item.quantity,
      rate: item.rate,
      amount: 0,
      status: "pending",
    }))

    setGrn((prev) => ({
      ...prev,
      purchaseOrder: po,
      reference: po.poNumber,
      items: grnItems,
    }))
  }

  /**
   * Handles changes to item fields
   * @param {number} index - Item index
   * @param {string} field - Field name
   * @param {any} value - New value
   */
  const handleItemChange = (index, field, value) => {
    const updatedItems = [...grn.items]
    const numValue = Number.parseInt(value, 10) || 0
    const item = updatedItems[index]

    if (field === "receivedQuantity") {
      // Ensure received quantity doesn't exceed ordered quantity
      const receivedQty = Math.min(numValue, item.orderedQuantity)
      const pendingQty = item.orderedQuantity - receivedQty

      updatedItems[index] = {
        ...item,
        receivedQuantity: receivedQty,
        pendingQuantity: pendingQty,
        amount: receivedQty * item.rate,
        status: receivedQty === item.orderedQuantity ? "complete" : receivedQty > 0 ? "partial" : "pending",
      }
    } else {
      updatedItems[index] = {
        ...item,
        [field]: value,
      }
    }

    setGrn((prev) => ({
      ...prev,
      items: updatedItems,
    }))
  }

  /**
   * Handles receiving all items in full
   */
  const handleReceiveAll = () => {
    const updatedItems = grn.items.map((item) => ({
      ...item,
      receivedQuantity: item.orderedQuantity,
      pendingQuantity: 0,
      amount: item.orderedQuantity * item.rate,
      status: "complete",
    }))

    setGrn((prev) => ({
      ...prev,
      items: updatedItems,
    }))
  }

  /**
   * Handles saving the GRN
   */
  const handleSave = () => {
    if (!grn.purchaseOrder) {
      setNotification({
        open: true,
        message: "Please select a purchase order",
        severity: "error",
      })
      return
    }

    if (!grn.warehouse) {
      setNotification({
        open: true,
        message: "Please select a warehouse",
        severity: "error",
      })
      return
    }

    if (grn.items.every((item) => item.receivedQuantity === 0)) {
      setNotification({
        open: true,
        message: "Please enter received quantities for at least one item",
        severity: "error",
      })
      return
    }

    // Call the onSave function with the GRN data
    onSave({
      ...grn,
      status: grn.totals.totalPending === 0 ? "complete" : "partial",
      createdAt: new Date().toISOString(),
    })

    onClose()
  }

  /**
   * Handles notification close
   */
  const handleNotificationClose = () => {
    setNotification({
      ...notification,
      open: false,
    })
  }

  /**
   * Formats currency values
   * @param {number} amount - Amount to format
   * @returns {string} Formatted amount
   */
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
      minimumFractionDigits: 2,
    }).format(amount)
  }

  /**
   * Gets status chip color
   * @param {string} status - Item status
   * @returns {string} Color name
   */
  const getStatusColor = (status) => {
    switch (status) {
      case "complete":
        return "success"
      case "partial":
        return "warning"
      case "pending":
      default:
        return "default"
    }
  }

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
        <DialogTitle>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Typography variant="h6">{editGRN ? "Edit Goods Received Note" : "Create Goods Received Note"}</Typography>
            <Button variant="outlined" startIcon={<PrintIcon />}>
              Print Preview
            </Button>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            {/* GRN Details Section */}
            <Grid container spacing={3} sx={{ mb: 3 }}>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3, height: "100%" }}>
                  <Typography variant="h6" sx={{ mb: 2, color: "#1976d2" }}>
                    Purchase Order Details
                  </Typography>
                  <Autocomplete
                    options={samplePurchaseOrders}
                    getOptionLabel={(option) => `${option.poNumber} - ${option.supplier.name}`}
                    value={grn.purchaseOrder}
                    onChange={(event, newValue) => {
                      handlePOSelect(newValue)
                    }}
                    renderInput={(params) => <TextField {...params} label="Select Purchase Order" fullWidth />}
                    sx={{ mb: 2 }}
                  />

                  {grn.purchaseOrder && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="body2" sx={{ mb: 0.5 }}>
                        <strong>Supplier:</strong> {grn.purchaseOrder.supplier.name}
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 0.5 }}>
                        <strong>Order Date:</strong> {new Date(grn.purchaseOrder.orderDate).toLocaleDateString()}
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 0.5 }}>
                        <strong>Due Date:</strong> {new Date(grn.purchaseOrder.dueDate).toLocaleDateString()}
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 0.5 }}>
                        <strong>Total Amount:</strong> {formatCurrency(grn.purchaseOrder.totals.grandTotal)}
                      </Typography>
                    </Box>
                  )}
                </Paper>
              </Grid>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3, height: "100%" }}>
                  <Typography variant="h6" sx={{ mb: 2, color: "#1976d2" }}>
                    Goods Received Note
                  </Typography>
                  <TextField
                    fullWidth
                    label="GRN Number"
                    value={grn.grnNumber}
                    onChange={(e) => handleGRNChange("grnNumber", e.target.value)}
                    sx={{ mb: 2 }}
                  />
                  <TextField
                    fullWidth
                    label="Reference"
                    value={grn.reference}
                    onChange={(e) => handleGRNChange("reference", e.target.value)}
                    sx={{ mb: 2 }}
                  />
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Receive Date"
                        type="date"
                        value={grn.receiveDate}
                        onChange={(e) => handleGRNChange("receiveDate", e.target.value)}
                        InputLabelProps={{ shrink: true }}
                      />
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>
            </Grid>

            {/* Warehouse Selection */}
            <Grid container spacing={3} sx={{ mb: 3 }}>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Warehouse</InputLabel>
                  <Select
                    value={grn.warehouse ? grn.warehouse.id : ""}
                    label="Warehouse"
                    onChange={(e) => {
                      const selectedWarehouse = warehouses.find((w) => w.id === e.target.value)
                      handleGRNChange("warehouse", selectedWarehouse)
                    }}
                  >
                    {warehouses.map((warehouse) => (
                      <MenuItem key={warehouse.id} value={warehouse.id}>
                        {warehouse.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            {/* Notes */}
            <Paper sx={{ p: 3, mb: 3 }}>
              <TextField
                fullWidth
                label="Notes"
                multiline
                rows={3}
                value={grn.notes}
                onChange={(e) => handleGRNChange("notes", e.target.value)}
              />
            </Paper>

            {/* Items Section */}
            <Paper sx={{ mb: 3, p: 3 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                <Typography variant="h6" sx={{ color: "#1976d2" }}>
                  Received Items
                </Typography>
                {grn.items.length > 0 && (
                  <Button variant="contained" onClick={handleReceiveAll}>
                    Receive All in Full
                  </Button>
                )}
              </Box>

              {grn.items.length > 0 ? (
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ bgcolor: "#f5f5f5" }}>
                        <TableCell width="5%">#</TableCell>
                        <TableCell width="10%">Product Code</TableCell>
                        <TableCell width="25%">Product Name</TableCell>
                        <TableCell width="10%">Ordered Qty</TableCell>
                        <TableCell width="15%">Received Qty</TableCell>
                        <TableCell width="10%">Pending Qty</TableCell>
                        <TableCell width="10%">Rate</TableCell>
                        <TableCell width="10%">Amount</TableCell>
                        <TableCell width="5%">Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {grn.items.map((item, index) => (
                        <TableRow key={item.id}>
                          <TableCell>{index + 1}</TableCell>
                          <TableCell>{item.productCode}</TableCell>
                          <TableCell>{item.productName}</TableCell>
                          <TableCell>{item.orderedQuantity}</TableCell>
                          <TableCell>
                            <TextField
                              size="small"
                              type="number"
                              value={item.receivedQuantity}
                              onChange={(e) => handleItemChange(index, "receivedQuantity", e.target.value)}
                              inputProps={{ min: 0, max: item.orderedQuantity, step: 1 }}
                            />
                          </TableCell>
                          <TableCell>{item.pendingQuantity}</TableCell>
                          <TableCell>{formatCurrency(item.rate)}</TableCell>
                          <TableCell>{formatCurrency(item.amount)}</TableCell>
                          <TableCell>
                            <Chip
                              label={item.status}
                              size="small"
                              color={getStatusColor(item.status)}
                              icon={
                                item.status === "complete" ? (
                                  <CheckCircleIcon />
                                ) : item.status === "partial" ? (
                                  <WarningIcon />
                                ) : null
                              }
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Alert severity="info">Please select a purchase order to load items.</Alert>
              )}
            </Paper>

            {/* Totals Section */}
            {grn.items.length > 0 && (
              <Grid container justifyContent="flex-end">
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 3 }}>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography variant="body1">Total Items:</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body1" align="right">
                          {grn.totals.totalItems}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body1">Total Received:</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body1" align="right">
                          {grn.totals.totalReceived}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body1">Total Pending:</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body1" align="right">
                          {grn.totals.totalPending}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="h6">Status:</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="h6" align="right">
                          <Chip
                            label={grn.totals.totalPending === 0 ? "Complete" : "Partial"}
                            color={grn.totals.totalPending === 0 ? "success" : "warning"}
                          />
                        </Typography>
                      </Grid>
                    </Grid>
                  </Paper>
                </Grid>
              </Grid>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={onClose}>Cancel</Button>
          <Button variant="contained" startIcon={<SaveIcon />} onClick={handleSave}>
            {editGRN ? "Update" : "Save"} GRN
          </Button>
        </DialogActions>
      </Dialog>

      {/* Notifications */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleNotificationClose}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert onClose={handleNotificationClose} severity={notification.severity} sx={{ width: "100%" }}>
          {notification.message}
        </Alert>
      </Snackbar>
    </>
  )
}

export default GoodsReceivedNoteForm
