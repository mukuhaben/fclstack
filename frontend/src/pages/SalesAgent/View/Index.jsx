"use client"

import { useState, useEffect } from "react"
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Avatar,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  useTheme,
  useMediaQuery,
  Alert,
  IconButton,
  Menu,
  MenuItem,
  Drawer,
  InputAdornment,
  Container,
} from "@mui/material"
import {
  Dashboard,
  People,
  TrendingUp,
  ShoppingCart,
  Add,
  Search,
  FilterList,
  Download,
  Refresh,
  AccountCircle,
  Settings,
  ExitToApp,
  Menu as MenuIcon,
  AttachMoney,
} from "@mui/icons-material"
import { useNavigate } from "react-router-dom"

// Mock data for customers onboarded by sales agent
const mockCustomers = [
  {
    id: 1,
    name: "John Doe",
    email: "john.doe@example.com",
    phone: "+254 722 123 456",
    company: "ABC Corp",
    dateOnboarded: "2023-05-15",
    status: "Active",
    totalOrders: 15,
    totalSpent: 450000,
  },
  {
    id: 2,
    name: "Jane Smith",
    email: "jane.smith@example.com",
    phone: "+254 733 987 654",
    company: "XYZ Ltd",
    dateOnboarded: "2023-05-20",
    status: "Active",
    totalOrders: 8,
    totalSpent: 280000,
  },
  {
    id: 3,
    name: "Mike Johnson",
    email: "mike.johnson@example.com",
    phone: "+254 711 555 777",
    company: "Tech Solutions",
    dateOnboarded: "2023-06-01",
    status: "Active",
    totalOrders: 22,
    totalSpent: 680000,
  },
  {
    id: 4,
    name: "Sarah Wilson",
    email: "sarah.wilson@example.com",
    phone: "+254 700 888 999",
    company: "Design Studio",
    dateOnboarded: "2023-06-10",
    status: "Active",
    totalOrders: 12,
    totalSpent: 320000,
  },
  {
    id: 5,
    name: "David Brown",
    email: "david.brown@example.com",
    phone: "+254 755 444 333",
    company: "Marketing Pro",
    dateOnboarded: "2023-06-15",
    status: "Active",
    totalOrders: 18,
    totalSpent: 540000,
  },
]

// Mock data for commission tracking with order sequence
const mockCommissions = [
  {
    id: 1,
    orderNumber: "ORD-2023-001",
    customerId: 1,
    customerName: "John Doe",
    orderDate: "2023-06-15",
    orderAmount: 85000,
    orderSequence: 1, // First order
    commissionRate: 6,
    commissionAmount: 5100,
    status: "paid",
  },
  {
    id: 2,
    orderNumber: "ORD-2023-002",
    customerId: 2,
    customerName: "Jane Smith",
    orderDate: "2023-06-16",
    orderAmount: 120000,
    orderSequence: 1, // First order
    commissionRate: 6,
    commissionAmount: 7200,
    status: "pending",
  },
  {
    id: 3,
    orderNumber: "ORD-2023-003",
    customerId: 1,
    customerName: "John Doe",
    orderDate: "2023-06-17",
    orderAmount: 95000,
    orderSequence: 2, // Second order
    commissionRate: 4,
    commissionAmount: 3800,
    status: "paid",
  },
  {
    id: 4,
    orderNumber: "ORD-2023-004",
    customerId: 3,
    customerName: "Mike Johnson",
    orderDate: "2023-06-18",
    orderAmount: 75000,
    orderSequence: 1, // First order
    commissionRate: 6,
    commissionAmount: 4500,
    status: "pending",
  },
  {
    id: 5,
    orderNumber: "ORD-2023-005",
    customerId: 2,
    customerName: "Jane Smith",
    orderDate: "2023-06-19",
    orderAmount: 110000,
    orderSequence: 2, // Second order
    commissionRate: 4,
    commissionAmount: 4400,
    status: "paid",
  },
  {
    id: 6,
    orderNumber: "ORD-2023-006",
    customerId: 1,
    customerName: "John Doe",
    orderDate: "2023-06-20",
    orderAmount: 65000,
    orderSequence: 3, // Third order
    commissionRate: 3,
    commissionAmount: 1950,
    status: "paid",
  },
  {
    id: 7,
    orderNumber: "ORD-2023-007",
    customerId: 4,
    customerName: "Sarah Wilson",
    orderDate: "2023-06-21",
    orderAmount: 88000,
    orderSequence: 1, // First order
    commissionRate: 6,
    commissionAmount: 5280,
    status: "pending",
  },
  {
    id: 8,
    orderNumber: "ORD-2023-008",
    customerId: 1,
    customerName: "John Doe",
    orderDate: "2023-06-22",
    orderAmount: 92000,
    orderSequence: 4, // Fourth order
    commissionRate: 2,
    commissionAmount: 1840,
    status: "paid",
  },
  {
    id: 9,
    orderNumber: "ORD-2023-009",
    customerId: 5,
    customerName: "David Brown",
    orderDate: "2023-06-23",
    orderAmount: 105000,
    orderSequence: 1, // First order
    commissionRate: 6,
    commissionAmount: 6300,
    status: "paid",
  },
  {
    id: 10,
    orderNumber: "ORD-2023-010",
    customerId: 1,
    customerName: "John Doe",
    orderDate: "2023-06-24",
    orderAmount: 78000,
    orderSequence: 5, // Fifth order - no commission
    commissionRate: 0,
    commissionAmount: 0,
    status: "no_commission",
  },
]

// Commission calculation function
const calculateCommissionRate = (orderSequence) => {
  switch (orderSequence) {
    case 1:
      return 6 // 6% for first order
    case 2:
      return 4 // 4% for second order
    case 3:
      return 3 // 3% for third order
    case 4:
      return 2 // 2% for fourth order
    default:
      return 0 // 0% for fifth order and beyond
  }
}

// Function to calculate commission amount
const calculateCommissionAmount = (orderAmount, orderSequence) => {
  const rate = calculateCommissionRate(orderSequence)
  return (orderAmount * rate) / 100
}

const DRAWER_WIDTH = 240

const SalesAgentPage = () => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("lg"))
  const isTablet = useMediaQuery(theme.breakpoints.down("md"))
  const navigate = useNavigate()

  // State management
  const [activeView, setActiveView] = useState("dashboard")
  const [mobileOpen, setMobileOpen] = useState(false)
  const [customerDialog, setCustomerDialog] = useState(false)
  const [userMenuAnchor, setUserMenuAnchor] = useState(null)
  const [successMessage, setSuccessMessage] = useState("")
  const [searchTerm, setSearchTerm] = useState("")

  // Get current user from localStorage
  const [currentUser, setCurrentUser] = useState(null)

  useEffect(() => {
    const storedUser = localStorage.getItem("currentUser")
    if (storedUser) {
      const user = JSON.parse(storedUser)
      setCurrentUser(user)

      if (user.role !== "sales_agent") {
        navigate("/")
      }
    } else {
      navigate("/login?type=agent")
    }
  }, [navigate])

  // Customer form state
  const [customerForm, setCustomerForm] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
  })

  // Handle drawer toggle
  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen)
  }

  // Handle customer form
  const handleCustomerFormChange = (e) => {
    const { name, value } = e.target
    setCustomerForm({
      ...customerForm,
      [name]: value,
    })
  }

  // Handle customer form submit
  const handleCustomerSubmit = () => {
    console.log("New customer:", customerForm)
    setCustomerForm({ name: "", email: "", phone: "", company: "" })
    setCustomerDialog(false)
    setSuccessMessage("Customer added successfully!")
    setTimeout(() => setSuccessMessage(""), 3000)
  }

  // Handle user menu
  const handleUserMenuOpen = (event) => {
    setUserMenuAnchor(event.currentTarget)
  }

  const handleUserMenuClose = () => {
    setUserMenuAnchor(null)
  }

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem("currentUser")
    navigate("/")
  }

  // Calculate metrics
  const totalCustomers = mockCustomers.length
  const totalCommissionEarned = mockCommissions
    .filter((c) => c.status === "paid")
    .reduce((sum, commission) => sum + commission.commissionAmount, 0)
  const pendingCommission = mockCommissions
    .filter((c) => c.status === "pending")
    .reduce((sum, commission) => sum + commission.commissionAmount, 0)
  const totalOrders = mockCommissions.length

  // Filter customers based on search
  const filteredCustomers = mockCustomers.filter(
    (customer) =>
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.company.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Sidebar content
  const sidebarItems = [
    { id: "dashboard", label: "Dashboard", icon: <Dashboard /> },
    { id: "customers", label: "Customers", icon: <People /> },
    { id: "commissions", label: "Commission Tracking", icon: <AttachMoney /> },
  ]

  const drawer = (
    <Box sx={{ height: "100%", bgcolor: "#f8f9fa" }}>
      <Box sx={{ p: 3, borderBottom: "1px solid #e9ecef" }}>
        <Typography variant="h6" sx={{ fontWeight: "bold", color: "#1976d2", fontSize: "1.1rem" }}>
          Sales Agent Portal
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.875rem", mt: 0.5 }}>
          {currentUser?.username || "Sales Agent"}
        </Typography>
      </Box>
      <List sx={{ px: 2, py: 2 }}>
        {sidebarItems.map((item) => (
          <ListItem key={item.id} disablePadding sx={{ mb: 1 }}>
            <ListItemButton
              selected={activeView === item.id}
              onClick={() => setActiveView(item.id)}
              sx={{
                borderRadius: 1,
                py: 1.5,
                px: 2,
                "&.Mui-selected": {
                  backgroundColor: "#1976d2",
                  color: "white",
                  "&:hover": {
                    backgroundColor: "#1565c0",
                  },
                  "& .MuiListItemIcon-root": {
                    color: "white",
                  },
                },
                "&:hover": {
                  backgroundColor: "#e3f2fd",
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 36 }}>{item.icon}</ListItemIcon>
              <ListItemText
                primary={item.label}
                primaryTypographyProps={{
                  fontSize: "0.875rem",
                  fontWeight: activeView === item.id ? 600 : 400,
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  )

  if (!currentUser) {
    return null
  }

  return (
    <Container maxWidth={false} disableGutters sx={{ bgcolor: "#f5f5f5", minHeight: "100vh" }}>
      <Box sx={{ display: "flex" }}>
        {/* Sidebar */}
        <Box
          component="nav"
          sx={{
            width: { lg: DRAWER_WIDTH },
            flexShrink: { lg: 0 },
          }}
        >
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={handleDrawerToggle}
            ModalProps={{ keepMounted: true }}
            sx={{
              display: { xs: "block", lg: "none" },
              "& .MuiDrawer-paper": {
                boxSizing: "border-box",
                width: DRAWER_WIDTH,
                border: "none",
                top: 0,
                height: "100vh",
              },
            }}
          >
            {drawer}
          </Drawer>
          <Drawer
            variant="permanent"
            sx={{
              display: { xs: "none", lg: "block" },
              "& .MuiDrawer-paper": {
                boxSizing: "border-box",
                width: DRAWER_WIDTH,
                border: "none",
                borderRight: "1px solid #e9ecef",
                position: "relative",
                height: "100vh",
              },
            }}
            open
          >
            {drawer}
          </Drawer>
        </Box>

        {/* Main Content */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            width: { lg: `calc(100% - ${DRAWER_WIDTH}px)` },
            bgcolor: "#ffffff",
            minHeight: "100vh",
          }}
        >
          {/* Top Bar */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              p: 3,
              borderBottom: "1px solid #e9ecef",
              bgcolor: "white",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <IconButton
                color="inherit"
                aria-label="open drawer"
                edge="start"
                onClick={handleDrawerToggle}
                sx={{ mr: 2, display: { lg: "none" } }}
              >
                <MenuIcon />
              </IconButton>
              <Typography variant="h5" sx={{ fontWeight: 600, color: "#333" }}>
                {activeView === "dashboard" && "Dashboard"}
                {activeView === "customers" && "Onboarded Customers"}
                {activeView === "commissions" && "Commission Tracking"}
              </Typography>
            </Box>

            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              {activeView === "customers" && (
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={() => setCustomerDialog(true)}
                  sx={{
                    bgcolor: "#1976d2",
                    "&:hover": { bgcolor: "#1565c0" },
                    textTransform: "none",
                    fontWeight: 500,
                    px: 3,
                  }}
                >
                  Add Customer
                </Button>
              )}
              <IconButton onClick={handleUserMenuOpen}>
                <Avatar sx={{ width: 36, height: 36, bgcolor: "#1976d2" }}>
                  {currentUser?.username?.charAt(0) || "S"}
                </Avatar>
              </IconButton>
            </Box>
          </Box>

          {/* Content Area */}
          <Box sx={{ p: 3 }}>
            {/* Success Message */}
            {successMessage && (
              <Alert severity="success" sx={{ mb: 3 }}>
                {successMessage}
              </Alert>
            )}

            {/* Dashboard View */}
            {activeView === "dashboard" && (
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6} lg={3}>
                  <Card sx={{ height: "100%" }}>
                    <CardContent>
                      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <Box>
                          <Typography color="text.secondary" gutterBottom sx={{ fontSize: "0.875rem" }}>
                            Total Customers
                          </Typography>
                          <Typography variant="h4" sx={{ fontWeight: 600 }}>
                            {totalCustomers}
                          </Typography>
                        </Box>
                        <People sx={{ fontSize: 40, color: "#1976d2" }} />
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} sm={6} lg={3}>
                  <Card sx={{ height: "100%" }}>
                    <CardContent>
                      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <Box>
                          <Typography color="text.secondary" gutterBottom sx={{ fontSize: "0.875rem" }}>
                            Total Orders
                          </Typography>
                          <Typography variant="h4" sx={{ fontWeight: 600 }}>
                            {totalOrders}
                          </Typography>
                        </Box>
                        <ShoppingCart sx={{ fontSize: 40, color: "#2196f3" }} />
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} sm={6} lg={3}>
                  <Card sx={{ height: "100%" }}>
                    <CardContent>
                      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <Box>
                          <Typography color="text.secondary" gutterBottom sx={{ fontSize: "0.875rem" }}>
                            Commission Earned
                          </Typography>
                          <Typography variant="h4" sx={{ fontWeight: 600 }}>
                            {(totalCommissionEarned / 1000).toFixed(0)}K
                          </Typography>
                        </Box>
                        <AttachMoney sx={{ fontSize: 40, color: "#4caf50" }} />
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} sm={6} lg={3}>
                  <Card sx={{ height: "100%" }}>
                    <CardContent>
                      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <Box>
                          <Typography color="text.secondary" gutterBottom sx={{ fontSize: "0.875rem" }}>
                            Pending Commission
                          </Typography>
                          <Typography variant="h4" sx={{ fontWeight: 600 }}>
                            {(pendingCommission / 1000).toFixed(0)}K
                          </Typography>
                        </Box>
                        <TrendingUp sx={{ fontSize: 40, color: "#ff9800" }} />
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            )}

            {/* Customers View */}
            {activeView === "customers" && (
              <Box>
                {/* Search and Actions Bar */}
                <Box sx={{ mb: 3 }}>
                  <Box
                    sx={{
                      display: "flex",
                      gap: 2,
                      alignItems: "center",
                      flexWrap: "wrap",
                    }}
                  >
                    <TextField
                      placeholder="Search customers..."
                      variant="outlined"
                      size="small"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Search sx={{ color: "#666" }} />
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        minWidth: { xs: "100%", sm: 300 },
                        "& .MuiOutlinedInput-root": {
                          bgcolor: "white",
                        },
                      }}
                    />
                    <Button
                      variant="outlined"
                      startIcon={<FilterList />}
                      sx={{
                        textTransform: "none",
                        borderColor: "#ddd",
                        color: "#666",
                        "&:hover": { borderColor: "#1976d2", color: "#1976d2" },
                      }}
                    >
                      Filter
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<Download />}
                      sx={{
                        textTransform: "none",
                        borderColor: "#ddd",
                        color: "#666",
                        "&:hover": { borderColor: "#1976d2", color: "#1976d2" },
                      }}
                    >
                      Export
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<Refresh />}
                      sx={{
                        textTransform: "none",
                        borderColor: "#ddd",
                        color: "#666",
                        "&:hover": { borderColor: "#1976d2", color: "#1976d2" },
                      }}
                    >
                      Refresh
                    </Button>
                  </Box>
                </Box>

                {/* Customers Table */}
                <Paper sx={{ overflow: "hidden", border: "1px solid #e9ecef" }}>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow sx={{ bgcolor: "#f8f9fa" }}>
                          <TableCell sx={{ fontWeight: 600, color: "#333", fontSize: "0.875rem" }}>
                            Customer Name
                          </TableCell>
                          <TableCell sx={{ fontWeight: 600, color: "#333", fontSize: "0.875rem" }}>
                            Email Address
                          </TableCell>
                          <TableCell sx={{ fontWeight: 600, color: "#333", fontSize: "0.875rem" }}>
                            Phone Number
                          </TableCell>
                          <TableCell sx={{ fontWeight: 600, color: "#333", fontSize: "0.875rem" }}>Company</TableCell>
                          <TableCell sx={{ fontWeight: 600, color: "#333", fontSize: "0.875rem" }}>
                            Date Onboarded
                          </TableCell>
                          <TableCell sx={{ fontWeight: 600, color: "#333", fontSize: "0.875rem" }}>
                            Total Orders
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {filteredCustomers.map((customer) => (
                          <TableRow
                            key={customer.id}
                            hover
                            sx={{
                              "&:hover": { bgcolor: "#f8f9fa" },
                              borderBottom: "1px solid #e9ecef",
                            }}
                          >
                            <TableCell>
                              <Box sx={{ display: "flex", alignItems: "center" }}>
                                <Avatar
                                  sx={{
                                    mr: 2,
                                    bgcolor: "#1976d2",
                                    width: 32,
                                    height: 32,
                                    fontSize: "0.875rem",
                                    fontWeight: 600,
                                  }}
                                >
                                  {customer.name.charAt(0)}
                                </Avatar>
                                <Typography variant="body2" sx={{ fontWeight: 500, color: "#333" }}>
                                  {customer.name}
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" color="text.secondary">
                                {customer.email}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" color="text.secondary">
                                {customer.phone}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" color="text.secondary">
                                {customer.company}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" color="text.secondary">
                                {customer.dateOnboarded}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" color="text.secondary">
                                {customer.totalOrders}
                              </Typography>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Paper>
              </Box>
            )}

            {/* Commission Tracking View */}
            {activeView === "commissions" && (
              <Box>
                <Grid container spacing={3} sx={{ mb: 4 }}>
                  <Grid item xs={12} md={4}>
                    <Card>
                      <CardContent>
                        <Typography color="text.secondary" gutterBottom sx={{ fontSize: "0.875rem" }}>
                          Total Commission Earned
                        </Typography>
                        <Typography variant="h4" sx={{ color: "#4caf50", fontWeight: 600 }}>
                          KSH {totalCommissionEarned.toLocaleString()}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Card>
                      <CardContent>
                        <Typography color="text.secondary" gutterBottom sx={{ fontSize: "0.875rem" }}>
                          Pending Commission
                        </Typography>
                        <Typography variant="h4" sx={{ color: "#ff9800", fontWeight: 600 }}>
                          KSH {pendingCommission.toLocaleString()}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Card>
                      <CardContent>
                        <Typography color="text.secondary" gutterBottom sx={{ fontSize: "0.875rem" }}>
                          Commission Rate
                        </Typography>
                        <Typography variant="h4" sx={{ color: "#1976d2", fontWeight: 600 }}>
                          Variable
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>

                <Paper sx={{ overflow: "hidden", border: "1px solid #e9ecef" }}>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow sx={{ bgcolor: "#f8f9fa" }}>
                          <TableCell sx={{ fontWeight: 600, color: "#333", fontSize: "0.875rem" }}>
                            Order Number
                          </TableCell>
                          <TableCell sx={{ fontWeight: 600, color: "#333", fontSize: "0.875rem" }}>
                            Customer Name
                          </TableCell>
                          <TableCell sx={{ fontWeight: 600, color: "#333", fontSize: "0.875rem" }}>
                            Order Sequence
                          </TableCell>
                          <TableCell sx={{ fontWeight: 600, color: "#333", fontSize: "0.875rem" }}>
                            Order Date
                          </TableCell>
                          <TableCell align="right" sx={{ fontWeight: 600, color: "#333", fontSize: "0.875rem" }}>
                            Order Amount
                          </TableCell>
                          <TableCell align="center" sx={{ fontWeight: 600, color: "#333", fontSize: "0.875rem" }}>
                            Commission Rate
                          </TableCell>
                          <TableCell align="right" sx={{ fontWeight: 600, color: "#333", fontSize: "0.875rem" }}>
                            Commission (KSH)
                          </TableCell>
                          <TableCell align="center" sx={{ fontWeight: 600, color: "#333", fontSize: "0.875rem" }}>
                            Status
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {mockCommissions.map((commission) => (
                          <TableRow
                            key={commission.id}
                            hover
                            sx={{
                              "&:hover": { bgcolor: "#f8f9fa" },
                              borderBottom: "1px solid #e9ecef",
                            }}
                          >
                            <TableCell>
                              <Typography variant="body2" sx={{ fontWeight: 500, color: "#1976d2" }}>
                                {commission.orderNumber}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" color="text.secondary">
                                {commission.customerName}
                              </Typography>
                            </TableCell>
                            <TableCell align="center">
                              <Chip
                                label={`${commission.orderSequence}${commission.orderSequence === 1 ? "st" : commission.orderSequence === 2 ? "nd" : commission.orderSequence === 3 ? "rd" : "th"} Order`}
                                size="small"
                                sx={{
                                  bgcolor: commission.orderSequence <= 4 ? "#e8f5e9" : "#ffebee",
                                  color: commission.orderSequence <= 4 ? "#2e7d32" : "#c62828",
                                  fontWeight: 500,
                                  fontSize: "0.75rem",
                                }}
                              />
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" color="text.secondary">
                                {commission.orderDate}
                              </Typography>
                            </TableCell>
                            <TableCell align="right">
                              <Typography variant="body2" color="text.secondary">
                                KSH {commission.orderAmount.toLocaleString()}
                              </Typography>
                            </TableCell>
                            <TableCell align="center">
                              <Chip
                                label={`${commission.commissionRate}%`}
                                size="small"
                                sx={{
                                  bgcolor: "#e3f2fd",
                                  color: "#1976d2",
                                  fontWeight: 500,
                                  fontSize: "0.75rem",
                                }}
                              />
                            </TableCell>
                            <TableCell align="right">
                              <Typography variant="body2" sx={{ fontWeight: 600, color: "#4caf50" }}>
                                KSH {commission.commissionAmount.toLocaleString()}
                              </Typography>
                            </TableCell>
                            <TableCell align="center">
                              <Chip
                                label={commission.status === "no_commission" ? "No Commission" : commission.status}
                                size="small"
                                sx={{
                                  bgcolor:
                                    commission.status === "paid"
                                      ? "#e8f5e9"
                                      : commission.status === "pending"
                                        ? "#fff3e0"
                                        : "#ffebee",
                                  color:
                                    commission.status === "paid"
                                      ? "#2e7d32"
                                      : commission.status === "pending"
                                        ? "#f57c00"
                                        : "#c62828",
                                  fontWeight: 500,
                                  fontSize: "0.75rem",
                                  textTransform: "capitalize",
                                  height: 24,
                                }}
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Paper>
              </Box>
            )}
          </Box>
        </Box>
      </Box>

      {/* Add Customer Dialog */}
      <Dialog open={customerDialog} onClose={() => setCustomerDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 600 }}>Add New Customer</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            name="name"
            label="Customer Name"
            fullWidth
            variant="outlined"
            value={customerForm.name}
            onChange={handleCustomerFormChange}
          />
          <TextField
            margin="dense"
            name="email"
            label="Email Address"
            type="email"
            fullWidth
            variant="outlined"
            value={customerForm.email}
            onChange={handleCustomerFormChange}
          />
          <TextField
            margin="dense"
            name="phone"
            label="Phone Number"
            fullWidth
            variant="outlined"
            value={customerForm.phone}
            onChange={handleCustomerFormChange}
          />
          <TextField
            margin="dense"
            name="company"
            label="Company"
            fullWidth
            variant="outlined"
            value={customerForm.company}
            onChange={handleCustomerFormChange}
          />
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setCustomerDialog(false)} sx={{ textTransform: "none" }}>
            Cancel
          </Button>
          <Button onClick={handleCustomerSubmit} variant="contained" sx={{ textTransform: "none", fontWeight: 500 }}>
            Add Customer
          </Button>
        </DialogActions>
      </Dialog>

      {/* User Menu */}
      <Menu
        anchorEl={userMenuAnchor}
        open={Boolean(userMenuAnchor)}
        onClose={handleUserMenuClose}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      >
        <MenuItem onClick={handleUserMenuClose}>
          <AccountCircle sx={{ mr: 1 }} />
          My Profile
        </MenuItem>
        <MenuItem onClick={handleUserMenuClose}>
          <Settings sx={{ mr: 1 }} />
          Settings
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout}>
          <ExitToApp sx={{ mr: 1 }} />
          Logout
        </MenuItem>
      </Menu>
    </Container>
  )
}

export default SalesAgentPage
