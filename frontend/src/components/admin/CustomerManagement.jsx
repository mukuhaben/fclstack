"use client"

import { useState, useEffect } from "react"
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Card,
  CardContent,
  TextField,
  InputAdornment,
  Tabs,
  Tab,
  Alert,
  Snackbar,
  Tooltip,
  Avatar,
} from "@mui/material"
import {
  Search as SearchIcon,
  Visibility as ViewIcon,
  Block as BlockIcon,
  CheckCircle as CheckCircleIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  AccountBalanceWallet as WalletIcon,
  History as HistoryIcon,
  CardGiftcard as CashbackIcon,
  Refresh as RefreshIcon,
} from "@mui/icons-material"

// Tab Panel Component
function TabPanel(props) {
  const { children, value, index, ...other } = props
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`customer-tabpanel-${index}`}
      aria-labelledby={`customer-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  )
}

const CustomerManagement = () => {
  // State management
  const [customers, setCustomers] = useState([])
  const [filteredCustomers, setFilteredCustomers] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [tabValue, setTabValue] = useState(0)
  const [loading, setLoading] = useState(false)
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "success",
  })

  // Initialize sample customer data
  useEffect(() => {
    const sampleCustomers = [
      {
        id: 1,
        name: "John Doe",
        email: "john.doe@example.com",
        phone: "+254 722 123 456",
        location: "Nairobi",
        registrationDate: "2024-01-15",
        status: "active",
        totalOrders: 15,
        totalSpent: 45000,
        walletBalance: 2500,
        cashbackEarned: 1200,
        lastLogin: "2024-06-15",
        transactions: [
          {
            id: 1,
            date: "2024-06-10",
            type: "purchase",
            amount: 1500,
            description: "Office supplies order",
            status: "completed",
          },
          {
            id: 2,
            date: "2024-06-08",
            type: "cashback",
            amount: 75,
            description: "Cashback from previous order",
            status: "completed",
          },
        ],
        cashbackHistory: [
          {
            id: 1,
            date: "2024-06-08",
            orderAmount: 1500,
            cashbackRate: 5,
            cashbackAmount: 75,
            status: "credited",
          },
        ],
      },
      {
        id: 2,
        name: "Jane Smith",
        email: "jane.smith@company.com",
        phone: "+254 733 987 654",
        location: "Mombasa",
        registrationDate: "2024-02-20",
        status: "active",
        totalOrders: 8,
        totalSpent: 28000,
        walletBalance: 1200,
        cashbackEarned: 800,
        lastLogin: "2024-06-14",
        transactions: [
          {
            id: 1,
            date: "2024-06-12",
            type: "purchase",
            amount: 3200,
            description: "Bulk stationery order",
            status: "completed",
          },
        ],
        cashbackHistory: [
          {
            id: 1,
            date: "2024-06-12",
            orderAmount: 3200,
            cashbackRate: 4,
            cashbackAmount: 128,
            status: "credited",
          },
        ],
      },
      {
        id: 3,
        name: "Michael Johnson",
        email: "m.johnson@school.edu",
        phone: "+254 711 456 789",
        location: "Kisumu",
        registrationDate: "2024-03-10",
        status: "disabled",
        totalOrders: 3,
        totalSpent: 12000,
        walletBalance: 500,
        cashbackEarned: 300,
        lastLogin: "2024-05-20",
        transactions: [],
        cashbackHistory: [],
      },
    ]

    setCustomers(sampleCustomers)
    setFilteredCustomers(sampleCustomers)
  }, [])

  // Filter customers based on search term
  useEffect(() => {
    const filtered = customers.filter(
      (customer) =>
        customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.phone.includes(searchTerm),
    )
    setFilteredCustomers(filtered)
  }, [customers, searchTerm])

  // Handle customer status toggle
  const handleStatusToggle = async (customerId, currentStatus) => {
    setLoading(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const newStatus = currentStatus === "active" ? "disabled" : "active"
      setCustomers((prev) =>
        prev.map((customer) => (customer.id === customerId ? { ...customer, status: newStatus } : customer)),
      )

      showNotification(
        `Customer ${newStatus === "active" ? "enabled" : "disabled"} successfully`,
        newStatus === "active" ? "success" : "warning",
      )
    } catch (error) {
      showNotification("Error updating customer status", "error")
    } finally {
      setLoading(false)
    }
  }

  // Handle view customer details
  const handleViewCustomer = (customer) => {
    setSelectedCustomer(customer)
    setViewDialogOpen(true)
  }

  // Show notification
  const showNotification = (message, severity = "success") => {
    setNotification({
      open: true,
      message,
      severity,
    })
  }

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue)
  }

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
    }).format(amount)
  }

  // Get status color
  const getStatusColor = (status) => {
    return status === "active" ? "success" : "error"
  }

  return (
    <Box sx={{ width: "100%", bgcolor: "#f8fafc", minHeight: "100vh", p: 3 }}>
      {/* Header */}
      <Paper sx={{ mb: 3, p: 3, borderRadius: 2 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
          <Typography variant="h5" sx={{ fontWeight: 600, color: "#1976d2" }}>
            Customer Management
          </Typography>
          <Button variant="outlined" startIcon={<RefreshIcon />} onClick={() => window.location.reload()}>
            Refresh
          </Button>
        </Box>

        {/* Summary Cards */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: "#e3f2fd", border: "1px solid #bbdefb" }}>
              <CardContent sx={{ textAlign: "center", py: 2 }}>
                <Typography variant="h4" sx={{ fontWeight: 600, color: "#1976d2" }}>
                  {customers.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Customers
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: "#e8f5e8", border: "1px solid #c8e6c9" }}>
              <CardContent sx={{ textAlign: "center", py: 2 }}>
                <Typography variant="h4" sx={{ fontWeight: 600, color: "#388e3c" }}>
                  {customers.filter((c) => c.status === "active").length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Active Customers
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: "#ffebee", border: "1px solid #ffcdd2" }}>
              <CardContent sx={{ textAlign: "center", py: 2 }}>
                <Typography variant="h4" sx={{ fontWeight: 600, color: "#d32f2f" }}>
                  {customers.filter((c) => c.status === "disabled").length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Disabled Customers
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: "#f3e5f5", border: "1px solid #e1bee7" }}>
              <CardContent sx={{ textAlign: "center", py: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, color: "#7b1fa2" }}>
                  {formatCurrency(customers.reduce((sum, c) => sum + c.totalSpent, 0))}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Revenue
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Search */}
        <TextField
          fullWidth
          size="small"
          placeholder="Search customers by name, email, or phone..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ maxWidth: 400 }}
        />
      </Paper>

      {/* Customer Table */}
      <Paper sx={{ borderRadius: 2 }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: "#f5f5f5" }}>
                <TableCell sx={{ fontWeight: 600 }}>Customer</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Contact</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Location</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Orders</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Total Spent</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredCustomers.map((customer) => (
                <TableRow key={customer.id} hover>
                  <TableCell>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <Avatar sx={{ bgcolor: "#1976d2" }}>
                        <PersonIcon />
                      </Avatar>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {customer.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Joined: {new Date(customer.registrationDate).toLocaleDateString()}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2" sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <EmailIcon fontSize="small" />
                        {customer.email}
                      </Typography>
                      <Typography variant="body2" sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.5 }}>
                        <PhoneIcon fontSize="small" />
                        {customer.phone}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <LocationIcon fontSize="small" />
                      {customer.location}
                    </Box>
                  </TableCell>
                  <TableCell>{customer.totalOrders}</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>{formatCurrency(customer.totalSpent)}</TableCell>
                  <TableCell>
                    <Chip label={customer.status.toUpperCase()} color={getStatusColor(customer.status)} size="small" />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: "flex", gap: 1 }}>
                      <Tooltip title="View Details">
                        <IconButton size="small" onClick={() => handleViewCustomer(customer)}>
                          <ViewIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={customer.status === "active" ? "Disable Customer" : "Enable Customer"}>
                        <IconButton
                          size="small"
                          onClick={() => handleStatusToggle(customer.id, customer.status)}
                          disabled={loading}
                          color={customer.status === "active" ? "error" : "success"}
                        >
                          {customer.status === "active" ? <BlockIcon /> : <CheckCircleIcon />}
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

      {/* Customer Details Dialog */}
      <Dialog open={viewDialogOpen} onClose={() => setViewDialogOpen(false)} maxWidth="lg" fullWidth>
        <DialogTitle>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Avatar sx={{ bgcolor: "#1976d2" }}>
              <PersonIcon />
            </Avatar>
            <Box>
              <Typography variant="h6">{selectedCustomer?.name}</Typography>
              <Typography variant="body2" color="text.secondary">
                Customer Details
              </Typography>
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedCustomer && (
            <Box>
              {/* Customer Info */}
              <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 3 }}>
                    <Typography variant="h6" sx={{ mb: 2, color: "#1976d2" }}>
                      Customer Information
                    </Typography>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <EmailIcon />
                        <Typography>{selectedCustomer.email}</Typography>
                      </Box>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <PhoneIcon />
                        <Typography>{selectedCustomer.phone}</Typography>
                      </Box>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <LocationIcon />
                        <Typography>{selectedCustomer.location}</Typography>
                      </Box>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <WalletIcon />
                        <Typography>Wallet: {formatCurrency(selectedCustomer.walletBalance)}</Typography>
                      </Box>
                    </Box>
                  </Paper>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 3 }}>
                    <Typography variant="h6" sx={{ mb: 2, color: "#1976d2" }}>
                      Account Summary
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Total Orders
                        </Typography>
                        <Typography variant="h6">{selectedCustomer.totalOrders}</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Total Spent
                        </Typography>
                        <Typography variant="h6">{formatCurrency(selectedCustomer.totalSpent)}</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Cashback Earned
                        </Typography>
                        <Typography variant="h6">{formatCurrency(selectedCustomer.cashbackEarned)}</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Last Login
                        </Typography>
                        <Typography variant="body2">
                          {new Date(selectedCustomer.lastLogin).toLocaleDateString()}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Paper>
                </Grid>
              </Grid>

              {/* Tabs for detailed information */}
              <Paper>
                <Tabs value={tabValue} onChange={handleTabChange} aria-label="customer details tabs">
                  <Tab icon={<HistoryIcon />} label="Transaction History" />
                  <Tab icon={<CashbackIcon />} label="Cashback Details" />
                </Tabs>

                <TabPanel value={tabValue} index={0}>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Date</TableCell>
                          <TableCell>Type</TableCell>
                          <TableCell>Description</TableCell>
                          <TableCell>Amount</TableCell>
                          <TableCell>Status</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {selectedCustomer.transactions.map((transaction) => (
                          <TableRow key={transaction.id}>
                            <TableCell>{new Date(transaction.date).toLocaleDateString()}</TableCell>
                            <TableCell>
                              <Chip
                                label={transaction.type}
                                color={transaction.type === "purchase" ? "primary" : "success"}
                                size="small"
                              />
                            </TableCell>
                            <TableCell>{transaction.description}</TableCell>
                            <TableCell>{formatCurrency(transaction.amount)}</TableCell>
                            <TableCell>
                              <Chip label={transaction.status} color="success" size="small" />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </TabPanel>

                <TabPanel value={tabValue} index={1}>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Date</TableCell>
                          <TableCell>Order Amount</TableCell>
                          <TableCell>Cashback Rate</TableCell>
                          <TableCell>Cashback Amount</TableCell>
                          <TableCell>Status</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {selectedCustomer.cashbackHistory.map((cashback) => (
                          <TableRow key={cashback.id}>
                            <TableCell>{new Date(cashback.date).toLocaleDateString()}</TableCell>
                            <TableCell>{formatCurrency(cashback.orderAmount)}</TableCell>
                            <TableCell>{cashback.cashbackRate}%</TableCell>
                            <TableCell>{formatCurrency(cashback.cashbackAmount)}</TableCell>
                            <TableCell>
                              <Chip label={cashback.status} color="success" size="small" />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </TabPanel>
              </Paper>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
          <Button
            variant="contained"
            color={selectedCustomer?.status === "active" ? "error" : "success"}
            onClick={() => {
              handleStatusToggle(selectedCustomer.id, selectedCustomer.status)
              setViewDialogOpen(false)
            }}
          >
            {selectedCustomer?.status === "active" ? "Disable Customer" : "Enable Customer"}
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

export default CustomerManagement
