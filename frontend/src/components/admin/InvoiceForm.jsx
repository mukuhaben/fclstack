"use client"

import { useState, useEffect } from "react"
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Autocomplete,
  Divider,
  IconButton,
  Avatar,
} from "@mui/material"
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Preview as PreviewIcon,
  Print as PrintIcon,
  Close as CloseIcon,
  Business as BusinessIcon,
  Download as DownloadIcon,
} from "@mui/icons-material"

const InvoiceForm = ({ open, onClose, onSave }) => {
  const [invoiceData, setInvoiceData] = useState({
    customerInfo: {
      name: "",
      address: "",
      taxId: "",
      email: "",
      phone: "",
    },
    invoiceDetails: {
      invoiceNumber: "",
      invoiceDate: new Date().toISOString().split("T")[0],
      deliveryDate: new Date().toISOString().split("T")[0],
      source: "",
      paymentTerms: "Immediate Payment",
      paymentMethod: "CASH",
      paymentCommunication: "INV/2024/00018",
    },
    items: [
      {
        productCode: "",
        description: "",
        quantity: 1,
        unitPrice: 0,
        taxRate: 16,
        taxableAmount: 0,
        totalAmount: 0,
      },
    ],
    totals: {
      subtotal: 0,
      taxAmount: 0,
      totalAmount: 0,
      paidAmount: 0,
      amountDue: 0,
    },
    taxSummary: {
      vat16: { taxableAmount: 0, taxAmount: 0, totalAmount: 0 },
      vat8: { taxableAmount: 0, taxAmount: 0, totalAmount: 0 },
      vat0: { taxableAmount: 0, taxAmount: 0, totalAmount: 0 },
      nonVat: { taxableAmount: 0, taxAmount: 0, totalAmount: 0 },
      exempt: { taxableAmount: 0, taxAmount: 0, totalAmount: 0 },
    },
    scuInfo: {
      date: new Date().toISOString().split("T")[0],
      time: new Date().toTimeString().split(" ")[0].substring(0, 8),
      scuId: "KRACU" + Math.floor(Math.random() * 10000000),
      receiptNumber: Math.floor(Math.random() * 100),
      itemCount: 0,
      internalData: generateRandomString(30),
      receiptSignature: generateRandomString(15),
    },
  })

  const [customers, setCustomers] = useState([])
  const [products, setProducts] = useState([])
  const [previewOpen, setPreviewOpen] = useState(false)
  const [isPaid, setIsPaid] = useState(false)

  function generateRandomString(length) {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
    let result = ""
    for (let i = 0; i < length; i++) {
      if (i > 0 && i % 4 === 0) result += "-"
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
  }

  // Sample data initialization
  useEffect(() => {
    // Generate invoice number
    const invoiceNumber = `KRACU${Date.now().toString().slice(-10)}/1`
    setInvoiceData((prev) => ({
      ...prev,
      invoiceDetails: {
        ...prev.invoiceDetails,
        invoiceNumber,
      },
    }))

    // Sample customers
    setCustomers([
      {
        id: 1,
        name: "Paw Pack Ltd",
        address: "Ring Road Parklands Opp Apollo Centre\nNairobi K 00100\nKenya",
        taxId: "P052296194R",
        email: "info@pawpack.co.ke",
        phone: "+254 722 123 456",
      },
      {
        id: 2,
        name: "ABC School",
        address: "Westlands Road\nNairobi K 00100\nKenya",
        taxId: "P052123456A",
        email: "admin@abcschool.ac.ke",
        phone: "+254 733 987 654",
      },
      {
        id: 3,
        name: "Tech Solutions Kenya",
        address: "Kilimani, Nairobi\nKenya",
        taxId: "P051456789C",
        email: "info@techsolutions.ke",
        phone: "+254 733 456 789",
      },
    ])

    // Sample products
    setProducts([
      {
        code: "L0202004",
        name: "Afri Multipurpose Labels K11 19*13mm White",
        price: 50.0,
        taxRate: 16,
      },
      {
        code: "P0601005",
        name: "Afri Packing Tape (Brown) 48mm*100Mtr",
        price: 165.0,
        taxRate: 16,
      },
      {
        code: "C0201003",
        name: "Counter Books KB A4 3 Quire REF 233",
        price: 320.0,
        taxRate: 16,
      },
      {
        code: "P0401001",
        name: "Petty Cash Voucher White A6 Ref 283",
        price: 39.0,
        taxRate: 16,
      },
      {
        code: "DELIVERY",
        name: "Westlands Delivery Charges",
        price: 1.0,
        taxRate: 16,
      },
    ])
  }, [])

  // Calculate totals whenever items change
  useEffect(() => {
    calculateTotals()
  }, [invoiceData.items, isPaid])

  const calculateTotals = () => {
    let subtotal = 0
    let taxAmount = 0
    let itemCount = 0

    // Reset tax summary
    const taxSummary = {
      vat16: { taxableAmount: 0, taxAmount: 0, totalAmount: 0 },
      vat8: { taxableAmount: 0, taxAmount: 0, totalAmount: 0 },
      vat0: { taxableAmount: 0, taxAmount: 0, totalAmount: 0 },
      nonVat: { taxableAmount: 0, taxAmount: 0, totalAmount: 0 },
      exempt: { taxableAmount: 0, taxAmount: 0, totalAmount: 0 },
    }

    const updatedItems = invoiceData.items.map((item) => {
      if (item.productCode) itemCount++

      const itemTotal = item.quantity * item.unitPrice
      const itemTax = (itemTotal * item.taxRate) / (100 + item.taxRate)
      const taxableAmount = itemTotal - itemTax

      subtotal += taxableAmount
      taxAmount += itemTax

      // Update tax summary based on tax rate
      if (item.taxRate === 16) {
        taxSummary.vat16.taxableAmount += taxableAmount
        taxSummary.vat16.taxAmount += itemTax
        taxSummary.vat16.totalAmount += itemTotal
      } else if (item.taxRate === 8) {
        taxSummary.vat8.taxableAmount += taxableAmount
        taxSummary.vat8.taxAmount += itemTax
        taxSummary.vat8.totalAmount += itemTotal
      } else if (item.taxRate === 0) {
        taxSummary.vat0.taxableAmount += taxableAmount
        taxSummary.vat0.taxAmount += itemTax
        taxSummary.vat0.totalAmount += itemTotal
      } else if (item.taxRate === -1) {
        // Non-VAT
        taxSummary.nonVat.taxableAmount += itemTotal
        taxSummary.nonVat.totalAmount += itemTotal
      } else if (item.taxRate === -2) {
        // Exempt
        taxSummary.exempt.taxableAmount += itemTotal
        taxSummary.exempt.totalAmount += itemTotal
      }

      return {
        ...item,
        taxableAmount: Number.parseFloat(taxableAmount.toFixed(2)),
        totalAmount: Number.parseFloat(itemTotal.toFixed(2)),
      }
    })

    const totalAmount = subtotal + taxAmount
    const paidAmount = isPaid ? totalAmount : 0
    const amountDue = totalAmount - paidAmount

    setInvoiceData((prev) => ({
      ...prev,
      items: updatedItems,
      totals: {
        subtotal: Number.parseFloat(subtotal.toFixed(2)),
        taxAmount: Number.parseFloat(taxAmount.toFixed(2)),
        totalAmount: Number.parseFloat(totalAmount.toFixed(2)),
        paidAmount: Number.parseFloat(paidAmount.toFixed(2)),
        amountDue: Number.parseFloat(amountDue.toFixed(2)),
      },
      taxSummary,
      scuInfo: {
        ...prev.scuInfo,
        itemCount,
      },
    }))
  }

  const handleCustomerSelect = (customer) => {
    if (customer) {
      setInvoiceData((prev) => ({
        ...prev,
        customerInfo: {
          name: customer.name,
          address: customer.address,
          taxId: customer.taxId,
          email: customer.email,
          phone: customer.phone,
        },
      }))
    }
  }

  const handleProductSelect = (index, product) => {
    if (product) {
      const updatedItems = [...invoiceData.items]
      updatedItems[index] = {
        ...updatedItems[index],
        productCode: product.code,
        description: product.name,
        unitPrice: product.price,
        taxRate: product.taxRate,
      }
      setInvoiceData((prev) => ({ ...prev, items: updatedItems }))
    }
  }

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...invoiceData.items]
    updatedItems[index] = {
      ...updatedItems[index],
      [field]:
        field === "quantity" || field === "unitPrice" || field === "taxRate" ? Number.parseFloat(value) || 0 : value,
    }
    setInvoiceData((prev) => ({ ...prev, items: updatedItems }))
  }

  const addItem = () => {
    setInvoiceData((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          productCode: "",
          description: "",
          quantity: 1,
          unitPrice: 0,
          taxRate: 16,
          taxableAmount: 0,
          totalAmount: 0,
        },
      ],
    }))
  }

  const removeItem = (index) => {
    if (invoiceData.items.length > 1) {
      const updatedItems = invoiceData.items.filter((_, i) => i !== index)
      setInvoiceData((prev) => ({ ...prev, items: updatedItems }))
    }
  }

  const handleSave = () => {
    const invoice = {
      id: `INV${Date.now()}`,
      ...invoiceData,
      createdDate: new Date(),
      status: isPaid ? "paid" : "pending",
    }
    onSave(invoice)
    onClose()
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)
  }

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="xl" fullWidth>
        <DialogTitle>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Typography variant="h6">Create New Invoice</Typography>
            <IconButton onClick={onClose}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            {/* Company Header */}
            <Paper sx={{ mb: 3, bgcolor: "#f8f9fa", p: 2 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Avatar
                  src="/fcladmin-main/src/assets/images/FirstCraft-logo.png"
                  sx={{ width: 60, height: 60 }}
                  variant="square"
                >
                  <BusinessIcon />
                </Avatar>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 600, color: "#1976d2" }}>
                    First Craft Ltd
                  </Typography>
                  <Typography variant="body2">P.O.Box 38869-00623, Nairobi Kenya</Typography>
                  <Typography variant="body2">
                    Email: manager@fcl.co.ke | Website: https://www.fcl.co.ke | KRA Pin: P052130436J
                  </Typography>
                </Box>
              </Box>
            </Paper>

            {/* Invoice Details */}
            <Grid container spacing={3} sx={{ mb: 3 }}>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3, height: "100%" }}>
                  <Typography variant="h6" sx={{ mb: 2, color: "#1976d2" }}>
                    Customer Information
                  </Typography>
                  <Autocomplete
                    options={customers}
                    getOptionLabel={(option) => option.name}
                    onChange={(event, value) => handleCustomerSelect(value)}
                    renderInput={(params) => <TextField {...params} label="Select Customer" fullWidth />}
                    sx={{ mb: 2 }}
                  />
                  <TextField
                    fullWidth
                    label="Customer Name"
                    value={invoiceData.customerInfo.name}
                    onChange={(e) =>
                      setInvoiceData((prev) => ({
                        ...prev,
                        customerInfo: { ...prev.customerInfo, name: e.target.value },
                      }))
                    }
                    sx={{ mb: 2 }}
                  />
                  <TextField
                    fullWidth
                    label="Address"
                    multiline
                    rows={3}
                    value={invoiceData.customerInfo.address}
                    onChange={(e) =>
                      setInvoiceData((prev) => ({
                        ...prev,
                        customerInfo: { ...prev.customerInfo, address: e.target.value },
                      }))
                    }
                    sx={{ mb: 2 }}
                  />
                  <TextField
                    fullWidth
                    label="Tax ID"
                    value={invoiceData.customerInfo.taxId}
                    onChange={(e) =>
                      setInvoiceData((prev) => ({
                        ...prev,
                        customerInfo: { ...prev.customerInfo, taxId: e.target.value },
                      }))
                    }
                    sx={{ mb: 2 }}
                  />
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <TextField
                        fullWidth
                        label="Email"
                        value={invoiceData.customerInfo.email}
                        onChange={(e) =>
                          setInvoiceData((prev) => ({
                            ...prev,
                            customerInfo: { ...prev.customerInfo, email: e.target.value },
                          }))
                        }
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField
                        fullWidth
                        label="Phone"
                        value={invoiceData.customerInfo.phone}
                        onChange={(e) =>
                          setInvoiceData((prev) => ({
                            ...prev,
                            customerInfo: { ...prev.customerInfo, phone: e.target.value },
                          }))
                        }
                      />
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3, height: "100%" }}>
                  <Typography variant="h6" sx={{ mb: 2, color: "#1976d2" }}>
                    Invoice Details
                  </Typography>
                  <TextField
                    fullWidth
                    label="Invoice Number"
                    value={invoiceData.invoiceDetails.invoiceNumber}
                    onChange={(e) =>
                      setInvoiceData((prev) => ({
                        ...prev,
                        invoiceDetails: { ...prev.invoiceDetails, invoiceNumber: e.target.value },
                      }))
                    }
                    sx={{ mb: 2 }}
                  />
                  <Grid container spacing={2} sx={{ mb: 2 }}>
                    <Grid item xs={6}>
                      <TextField
                        fullWidth
                        label="Invoice Date"
                        type="date"
                        value={invoiceData.invoiceDetails.invoiceDate}
                        onChange={(e) =>
                          setInvoiceData((prev) => ({
                            ...prev,
                            invoiceDetails: { ...prev.invoiceDetails, invoiceDate: e.target.value },
                          }))
                        }
                        InputLabelProps={{ shrink: true }}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField
                        fullWidth
                        label="Delivery Date"
                        type="date"
                        value={invoiceData.invoiceDetails.deliveryDate}
                        onChange={(e) =>
                          setInvoiceData((prev) => ({
                            ...prev,
                            invoiceDetails: { ...prev.invoiceDetails, deliveryDate: e.target.value },
                          }))
                        }
                        InputLabelProps={{ shrink: true }}
                      />
                    </Grid>
                  </Grid>
                  <TextField
                    fullWidth
                    label="Source"
                    value={invoiceData.invoiceDetails.source}
                    onChange={(e) =>
                      setInvoiceData((prev) => ({
                        ...prev,
                        invoiceDetails: { ...prev.invoiceDetails, source: e.target.value },
                      }))
                    }
                    sx={{ mb: 2 }}
                  />
                  <TextField
                    fullWidth
                    label="Payment Terms"
                    value={invoiceData.invoiceDetails.paymentTerms}
                    onChange={(e) =>
                      setInvoiceData((prev) => ({
                        ...prev,
                        invoiceDetails: { ...prev.invoiceDetails, paymentTerms: e.target.value },
                      }))
                    }
                    sx={{ mb: 2 }}
                  />
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <FormControl fullWidth>
                        <InputLabel>Payment Method</InputLabel>
                        <Select
                          value={invoiceData.invoiceDetails.paymentMethod}
                          label="Payment Method"
                          onChange={(e) =>
                            setInvoiceData((prev) => ({
                              ...prev,
                              invoiceDetails: { ...prev.invoiceDetails, paymentMethod: e.target.value },
                            }))
                          }
                        >
                          <MenuItem value="CASH">Cash</MenuItem>
                          <MenuItem value="MOBILE MONEY">Mobile Money</MenuItem>
                          <MenuItem value="BANK TRANSFER">Bank Transfer</MenuItem>
                          <MenuItem value="CHEQUE">Cheque</MenuItem>
                          <MenuItem value="CREDIT">Credit</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={6}>
                      <FormControl fullWidth>
                        <InputLabel>Payment Status</InputLabel>
                        <Select value={isPaid} label="Payment Status" onChange={(e) => setIsPaid(e.target.value)}>
                          <MenuItem value={true}>Paid</MenuItem>
                          <MenuItem value={false}>Unpaid</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>
            </Grid>

            {/* Items Section */}
            <Paper sx={{ mb: 3, p: 3 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                <Typography variant="h6" sx={{ color: "#1976d2" }}>
                  Invoice Items
                </Typography>
                <Button variant="contained" startIcon={<AddIcon />} onClick={addItem}>
                  Add Item
                </Button>
              </Box>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: "#f5f5f5" }}>
                      <TableCell width="5%">#</TableCell>
                      <TableCell width="15%">Product Code</TableCell>
                      <TableCell width="30%">Description</TableCell>
                      <TableCell width="10%">Qty</TableCell>
                      <TableCell width="10%">Unit Price</TableCell>
                      <TableCell width="10%">Tax Rate</TableCell>
                      <TableCell width="10%">Taxable Amount</TableCell>
                      <TableCell width="10%">Total</TableCell>
                      <TableCell width="5%">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {invoiceData.items.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>
                          <Autocomplete
                            options={products}
                            getOptionLabel={(option) => `${option.code}`}
                            onChange={(event, value) => handleProductSelect(index, value)}
                            renderInput={(params) => (
                              <TextField {...params} label="Code" size="small" sx={{ minWidth: 120 }} />
                            )}
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            size="small"
                            value={item.description}
                            onChange={(e) => handleItemChange(index, "description", e.target.value)}
                            fullWidth
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            size="small"
                            type="number"
                            value={item.quantity}
                            onChange={(e) => handleItemChange(index, "quantity", e.target.value)}
                            inputProps={{ min: 0, step: 0.1 }}
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            size="small"
                            type="number"
                            value={item.unitPrice}
                            onChange={(e) => handleItemChange(index, "unitPrice", e.target.value)}
                            inputProps={{ min: 0, step: 0.01 }}
                          />
                        </TableCell>
                        <TableCell>
                          <FormControl fullWidth size="small">
                            <Select
                              value={item.taxRate}
                              onChange={(e) => handleItemChange(index, "taxRate", e.target.value)}
                            >
                              <MenuItem value={16}>16%</MenuItem>
                              <MenuItem value={8}>8%</MenuItem>
                              <MenuItem value={0}>0%</MenuItem>
                              <MenuItem value={-1}>Non-VAT</MenuItem>
                              <MenuItem value={-2}>Exempt</MenuItem>
                            </Select>
                          </FormControl>
                        </TableCell>
                        <TableCell>{formatCurrency(item.taxableAmount)}</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>{formatCurrency(item.totalAmount)}</TableCell>
                        <TableCell>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => removeItem(index)}
                            disabled={invoiceData.items.length === 1}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>

            {/* Totals Section */}
            <Grid container spacing={3}>
              <Grid item xs={12} md={7}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ mb: 2, color: "#1976d2" }}>
                    Tax Summary
                  </Typography>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow sx={{ bgcolor: "#f5f5f5" }}>
                          <TableCell>Tax Rate</TableCell>
                          <TableCell align="right">Taxable Amount (KSh)</TableCell>
                          <TableCell align="right">Tax Amount (KSh)</TableCell>
                          <TableCell align="right">Total Amount (KSh)</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        <TableRow>
                          <TableCell>16%</TableCell>
                          <TableCell align="right">
                            {formatCurrency(invoiceData.taxSummary.vat16.taxableAmount)}
                          </TableCell>
                          <TableCell align="right">{formatCurrency(invoiceData.taxSummary.vat16.taxAmount)}</TableCell>
                          <TableCell align="right">
                            {formatCurrency(invoiceData.taxSummary.vat16.totalAmount)}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>8%</TableCell>
                          <TableCell align="right">
                            {formatCurrency(invoiceData.taxSummary.vat8.taxableAmount)}
                          </TableCell>
                          <TableCell align="right">{formatCurrency(invoiceData.taxSummary.vat8.taxAmount)}</TableCell>
                          <TableCell align="right">{formatCurrency(invoiceData.taxSummary.vat8.totalAmount)}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>0%</TableCell>
                          <TableCell align="right">
                            {formatCurrency(invoiceData.taxSummary.vat0.taxableAmount)}
                          </TableCell>
                          <TableCell align="right">{formatCurrency(invoiceData.taxSummary.vat0.taxAmount)}</TableCell>
                          <TableCell align="right">{formatCurrency(invoiceData.taxSummary.vat0.totalAmount)}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Non-VAT</TableCell>
                          <TableCell align="right">
                            {formatCurrency(invoiceData.taxSummary.nonVat.taxableAmount)}
                          </TableCell>
                          <TableCell align="right">{formatCurrency(invoiceData.taxSummary.nonVat.taxAmount)}</TableCell>
                          <TableCell align="right">
                            {formatCurrency(invoiceData.taxSummary.nonVat.totalAmount)}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Exempt</TableCell>
                          <TableCell align="right">
                            {formatCurrency(invoiceData.taxSummary.exempt.taxableAmount)}
                          </TableCell>
                          <TableCell align="right">{formatCurrency(invoiceData.taxSummary.exempt.taxAmount)}</TableCell>
                          <TableCell align="right">
                            {formatCurrency(invoiceData.taxSummary.exempt.totalAmount)}
                          </TableCell>
                        </TableRow>
                        <TableRow sx={{ fontWeight: "bold", bgcolor: "#f5f5f5" }}>
                          <TableCell sx={{ fontWeight: 600 }}>Total</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 600 }}>
                            {formatCurrency(invoiceData.totals.subtotal)}
                          </TableCell>
                          <TableCell align="right" sx={{ fontWeight: 600 }}>
                            {formatCurrency(invoiceData.totals.taxAmount)}
                          </TableCell>
                          <TableCell align="right" sx={{ fontWeight: 600 }}>
                            {formatCurrency(invoiceData.totals.totalAmount)}
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>

                  <Box sx={{ mt: 3 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                      Payment Information
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Payment Communication"
                          value={invoiceData.invoiceDetails.paymentCommunication}
                          onChange={(e) =>
                            setInvoiceData((prev) => ({
                              ...prev,
                              invoiceDetails: {
                                ...prev.invoiceDetails,
                                paymentCommunication: e.target.value,
                              },
                            }))
                          }
                          size="small"
                        />
                      </Grid>
                      {isPaid && (
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            label="Paid Date"
                            type="date"
                            defaultValue={new Date().toISOString().split("T")[0]}
                            InputLabelProps={{ shrink: true }}
                            size="small"
                          />
                        </Grid>
                      )}
                    </Grid>
                  </Box>

                  <Box sx={{ mt: 3 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                      SCU Information
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="SCU ID"
                          value={invoiceData.scuInfo.scuId}
                          onChange={(e) =>
                            setInvoiceData((prev) => ({
                              ...prev,
                              scuInfo: { ...prev.scuInfo, scuId: e.target.value },
                            }))
                          }
                          size="small"
                          sx={{ mb: 2 }}
                        />
                        <TextField
                          fullWidth
                          label="Receipt Number"
                          value={invoiceData.scuInfo.receiptNumber}
                          onChange={(e) =>
                            setInvoiceData((prev) => ({
                              ...prev,
                              scuInfo: { ...prev.scuInfo, receiptNumber: e.target.value },
                            }))
                          }
                          size="small"
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Receipt Signature"
                          value={invoiceData.scuInfo.receiptSignature}
                          onChange={(e) =>
                            setInvoiceData((prev) => ({
                              ...prev,
                              scuInfo: { ...prev.scuInfo, receiptSignature: e.target.value },
                            }))
                          }
                          size="small"
                          sx={{ mb: 2 }}
                        />
                        <TextField
                          fullWidth
                          label="Internal Data"
                          value={invoiceData.scuInfo.internalData}
                          onChange={(e) =>
                            setInvoiceData((prev) => ({
                              ...prev,
                              scuInfo: { ...prev.scuInfo, internalData: e.target.value },
                            }))
                          }
                          size="small"
                        />
                      </Grid>
                    </Grid>
                  </Box>
                </Paper>
              </Grid>
              <Grid item xs={12} md={5}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ mb: 2, color: "#1976d2" }}>
                    Invoice Summary
                  </Typography>
                  <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                    <Typography>Subtotal:</Typography>
                    <Typography>{formatCurrency(invoiceData.totals.subtotal)}</Typography>
                  </Box>
                  <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                    <Typography>Tax Amount:</Typography>
                    <Typography>{formatCurrency(invoiceData.totals.taxAmount)}</Typography>
                  </Box>
                  <Divider sx={{ my: 1 }} />
                  <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
                    <Typography variant="h6">Total Amount:</Typography>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {formatCurrency(invoiceData.totals.totalAmount)}
                    </Typography>
                  </Box>

                  {isPaid && (
                    <>
                      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1, color: "success.main" }}>
                        <Typography>Paid Amount:</Typography>
                        <Typography>{formatCurrency(invoiceData.totals.totalAmount)}</Typography>
                      </Box>
                      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                        <Typography>Amount Due:</Typography>
                        <Typography>KSh 0.00</Typography>
                      </Box>
                    </>
                  )}

                  <Box sx={{ mt: 4, p: 2, bgcolor: "#f5f5f5", borderRadius: 1 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                      Terms & Conditions
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      1. Payment is due within the terms specified on the invoice.
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      2. Goods remain the property of First Craft Ltd until paid in full.
                    </Typography>
                    <Typography variant="body2">
                      3. For full terms and conditions, visit: https://www.fcl.co.ke/terms
                    </Typography>
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={onClose}>Cancel</Button>
          <Button variant="outlined" startIcon={<PreviewIcon />} onClick={() => setPreviewOpen(true)}>
            Preview
          </Button>
          <Button variant="contained" startIcon={<SaveIcon />} onClick={handleSave}>
            Save Invoice
          </Button>
        </DialogActions>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={previewOpen} onClose={() => setPreviewOpen(false)} maxWidth="lg" fullWidth>
        <DialogTitle>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Typography variant="h6">Invoice Preview</Typography>
            <IconButton onClick={() => setPreviewOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ p: 2, bgcolor: "#f5f5f5", borderRadius: 1 }}>
            {/* Company Header */}
            <Paper sx={{ textAlign: "center", mb: 3, p: 2, bgcolor: "white", borderRadius: 1 }}>
              <Typography variant="h5" sx={{ fontWeight: 600, color: "#1976d2" }}>
                First Craft Ltd
              </Typography>
              <Typography variant="body2">P.O.Box 38869-00623</Typography>
              <Typography variant="body2">Nairobi Kenya</Typography>
              <Typography variant="body2">
                Email: manager@fcl.co.ke | Website: https://www.fcl.co.ke | KRA Pin: P052130436J
              </Typography>
            </Paper>

            {/* Invoice Details */}
            <Paper sx={{ p: 3, mb: 2 }}>
              <Grid container spacing={3}>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Bill To:
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {invoiceData.customerInfo.name}
                  </Typography>
                  <Typography variant="body2" sx={{ whiteSpace: "pre-line" }}>
                    {invoiceData.customerInfo.address}
                  </Typography>
                  <Typography variant="body2">Tax ID: {invoiceData.customerInfo.taxId}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Box sx={{ textAlign: "right" }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                      Invoice {invoiceData.invoiceDetails.invoiceNumber}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Invoice Date:</strong> {invoiceData.invoiceDetails.invoiceDate}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Delivery Date:</strong> {invoiceData.invoiceDetails.deliveryDate}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Source:</strong> {invoiceData.invoiceDetails.source}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Paper>

            {/* Items Table */}
            <Paper sx={{ mb: 2 }}>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: "#f0f0f0" }}>
                      <TableCell>#</TableCell>
                      <TableCell>Description</TableCell>
                      <TableCell align="right">Quantity</TableCell>
                      <TableCell align="right">Unit Price</TableCell>
                      <TableCell align="right">Taxes</TableCell>
                      <TableCell align="right">Taxable Amount</TableCell>
                      <TableCell align="right">Total Amount</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {invoiceData.items.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            [{item.productCode}] {item.description}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">{item.quantity} Pc</TableCell>
                        <TableCell align="right">{formatCurrency(item.unitPrice)}</TableCell>
                        <TableCell align="right">
                          ({item.taxRate < 0 ? (item.taxRate === -1 ? "Non-VAT" : "Exempt") : `${item.taxRate}%`})
                        </TableCell>
                        <TableCell align="right">{formatCurrency(item.taxableAmount)}</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 500 }}>
                          {formatCurrency(item.totalAmount)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>

            {/* Summary */}
            <Grid container spacing={2}>
              <Grid item xs={12} md={7}>
                <Paper sx={{ p: 2, mb: 2 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                    Tax Summary
                  </Typography>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow sx={{ bgcolor: "#f0f0f0" }}>
                          <TableCell>Tax Rate</TableCell>
                          <TableCell align="right">Taxable Amount</TableCell>
                          <TableCell align="right">Tax Amount</TableCell>
                          <TableCell align="right">Total Amount</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        <TableRow>
                          <TableCell>16%</TableCell>
                          <TableCell align="right">
                            {formatCurrency(invoiceData.taxSummary.vat16.taxableAmount)}
                          </TableCell>
                          <TableCell align="right">{formatCurrency(invoiceData.taxSummary.vat16.taxAmount)}</TableCell>
                          <TableCell align="right">
                            {formatCurrency(invoiceData.taxSummary.vat16.totalAmount)}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Total</TableCell>
                          <TableCell align="right">{formatCurrency(invoiceData.totals.subtotal)}</TableCell>
                          <TableCell align="right">{formatCurrency(invoiceData.totals.taxAmount)}</TableCell>
                          <TableCell align="right">{formatCurrency(invoiceData.totals.totalAmount)}</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>

                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2">
                      <strong>Payment terms:</strong> {invoiceData.invoiceDetails.paymentTerms}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Payment Communication:</strong> {invoiceData.invoiceDetails.paymentCommunication}
                    </Typography>
                  </Box>
                </Paper>

                <Paper sx={{ p: 2 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                    SCU Information
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="body2">
                        <strong>Date:</strong> {invoiceData.scuInfo.date} {invoiceData.scuInfo.time}
                      </Typography>
                      <Typography variant="body2">
                        <strong>SCU ID:</strong> {invoiceData.scuInfo.scuId}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Receipt Number:</strong> {invoiceData.scuInfo.receiptNumber}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2">
                        <strong>Payment Method:</strong> {invoiceData.invoiceDetails.paymentMethod}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Item Count:</strong> {invoiceData.scuInfo.itemCount}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Receipt Signature:</strong> {invoiceData.scuInfo.receiptSignature}
                      </Typography>
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>
              <Grid item xs={12} md={5}>
                <Paper sx={{ p: 2 }}>
                  <Box sx={{ textAlign: "right" }}>
                    <Typography variant="body2">Subtotal: {formatCurrency(invoiceData.totals.subtotal)}</Typography>
                    <Typography variant="body2">Tax: {formatCurrency(invoiceData.totals.taxAmount)}</Typography>
                    <Typography variant="h6" sx={{ fontWeight: 600, my: 1 }}>
                      Total: {formatCurrency(invoiceData.totals.totalAmount)}
                    </Typography>

                    {isPaid && (
                      <>
                        <Box sx={{ bgcolor: "#e8f5e8", p: 1, borderRadius: 1, mb: 1 }}>
                          <Typography variant="body2" sx={{ color: "success.main" }}>
                            Paid on {new Date().toLocaleDateString()}
                          </Typography>
                          <Typography variant="body1" sx={{ fontWeight: 600, color: "success.main" }}>
                            {formatCurrency(invoiceData.totals.totalAmount)}
                          </Typography>
                        </Box>
                        <Typography variant="body2">
                          Amount Due: <strong>{formatCurrency(0)}</strong>
                        </Typography>
                      </>
                    )}
                  </Box>
                </Paper>
              </Grid>
            </Grid>

            <Box sx={{ textAlign: "center", mt: 3, p: 2, bgcolor: "white", borderRadius: 1 }}>
              <Typography variant="body2">
                <strong>Terms & Conditions:</strong> https://www.fcl.co.ke/terms
              </Typography>
              <Divider sx={{ my: 1 }} />
              <Typography variant="body2">First Craft Ltd | P.O.Box 38869-00623 | Nairobi Kenya</Typography>
              <Typography variant="caption">
                Email: manager@fcl.co.ke | Website: https://www.fcl.co.ke | KRA Pin: P052130436J
              </Typography>
              <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                Page: 1 / 1
              </Typography>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewOpen(false)}>Close</Button>
          <Button variant="outlined" startIcon={<PrintIcon />}>
            Print
          </Button>
          <Button variant="outlined" startIcon={<DownloadIcon />}>
            Download PDF
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default InvoiceForm
