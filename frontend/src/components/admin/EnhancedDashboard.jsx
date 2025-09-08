"use client"

import { useState, useEffect } from "react"
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  Avatar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  useTheme,
  alpha,
  IconButton,
  Menu,
  MenuItem,
  Divider,
  Chip,
  Tooltip,
  CircularProgress,
  Alert,
  Button,
  TextField,
} from "@mui/material"
import {
  TrendingUp,
  TrendingDown,
  ShoppingCart,
  People,
  Inventory,
  AttachMoney,
  Download,
  Refresh,
  FullscreenExit,
  Fullscreen,
  Settings,
  Warning,
  CheckCircle,
} from "@mui/icons-material"
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip as ReTooltip, Legend } from "recharts"
import { adminAPI, categoriesAPI, productsAPI } from "../../services/interceptor.js"

const MetricCard = ({ title, value, change, changeType, icon, color = "#1976d2" }) => {
  return (
    <Card
      sx={{
        height: "100%",
        background: `linear-gradient(135deg, ${alpha(color, 0.12)} 0%, ${alpha(color, 0.06)} 100%)`,
        border: `1px solid ${alpha(color, 0.25)}`,
        borderRadius: 3,
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: `0 12px 32px ${alpha(color, 0.2)}`,
          border: `1px solid ${alpha(color, 0.4)}`,
        },
        position: "relative",
        overflow: "hidden",
        mx: 1.5,
        my: 1,
      }}
    >
      <CardContent sx={{ p: 3.5, "&:last-child": { pb: 3.5 } }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2.5 }}>
          <Avatar sx={{ bgcolor: color, width: 48, height: 48, boxShadow: `0 4px 12px ${alpha(color, 0.3)}` }}>{icon}</Avatar>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
            {changeType === "increase" ? (
              <TrendingUp sx={{ color: "#2e7d32", fontSize: 22 }} />
            ) : (
              <TrendingDown sx={{ color: "#d32f2f", fontSize: 22 }} />
            )}
            <Typography variant="body2" sx={{ color: changeType === "increase" ? "#2e7d32" : "#d32f2f", fontWeight: 700, fontSize: "0.9rem" }}>
              {change}
            </Typography>
          </Box>
        </Box>
        <Typography variant="h3" sx={{ fontWeight: 800, color: "#1a1a1a", mb: 1.5, fontSize: { xs: "1.8rem", sm: "2.2rem", md: "2.5rem" }, lineHeight: 1.2 }}>
          {value}
        </Typography>
        <Typography variant="body1" sx={{ color: "#555", fontWeight: 600, mb: 0.8, fontSize: "1rem" }}>
          {title}
        </Typography>
      </CardContent>
      <Box sx={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 4, background: `linear-gradient(90deg, ${color} 0%, ${alpha(color, 0.7)} 100%)` }} />
    </Card>
  )
}

const ChartContainer = ({ title, children, height = 400, actions, quadrant = "" }) => {
  const [anchorEl, setAnchorEl] = useState(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const open = Boolean(anchorEl)

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }

  return (
    <Paper
      sx={{
        p: 4,
        borderRadius: 3,
        height: "100%",
        width: "100%",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        mx: 2,
        my: 2,
        boxShadow: "0 6px 24px rgba(0,0,0,0.1)",
        border: "1px solid rgba(0,0,0,0.08)",
        "&:hover": { boxShadow: "0 12px 40px rgba(0,0,0,0.15)", transform: "translateY(-3px)" },
        ...(isFullscreen && {
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 1300,
          m: 0,
          borderRadius: 0,
          height: "100vh",
          width: "100vw",
          display: "flex",
          flexDirection: "column",
        }),
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 4, pb: 2.5, borderBottom: "2px solid #f0f0f0" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2.5 }}>
          <Typography variant="h5" sx={{ fontWeight: 700, fontSize: "1.4rem", color: "#1a1a1a", letterSpacing: "-0.02em" }}>
            {title}
          </Typography>
          {quadrant && <Chip label={quadrant} size="small" sx={{ backgroundColor: alpha("#1976d2", 0.12), color: "#1976d2", fontWeight: 700, fontSize: "0.8rem", height: 28 }} />}
        </Box>
        <Box sx={{ display: "flex", gap: 1.5 }}>
          {actions && actions}
          <Tooltip title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}>
            <IconButton size="small" onClick={toggleFullscreen} sx={{ backgroundColor: alpha("#1976d2", 0.1), "&:hover": { backgroundColor: alpha("#1976d2", 0.2) }, width: 36, height: 36 }}>
              {isFullscreen ? <FullscreenExit fontSize="small" /> : <Fullscreen fontSize="small" />}
            </IconButton>
          </Tooltip>
        </Box>
        <Menu anchorEl={anchorEl} open={open} onClose={handleClose} PaperProps={{ sx: { borderRadius: 2, boxShadow: "0 8px 32px rgba(0,0,0,0.12)", border: "1px solid rgba(0,0,0,0.06)" } }}>
          <MenuItem onClick={handleClose} sx={{ py: 1.5 }}><Download fontSize="small" sx={{ mr: 2 }} /> Export Data</MenuItem>
          <MenuItem onClick={handleClose} sx={{ py: 1.5 }}><Refresh fontSize="small" sx={{ mr: 2 }} /> Refresh</MenuItem>
          <Divider />
          <MenuItem onClick={handleClose} sx={{ py: 1.5 }}><Settings fontSize="small" sx={{ mr: 2 }} /> Chart Settings</MenuItem>
        </Menu>
      </Box>
      <Box sx={{ height: isFullscreen ? "calc(100% - 120px)" : "calc(100% - 100px)", width: "100%", p: 2.5, borderRadius: 2, backgroundColor: "#fafbfc", border: "1px solid #f0f2f5" }}>
        {children}
      </Box>
    </Paper>
  )
}

const EnhancedDashboard = () => {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [dashboardData, setDashboardData] = useState({
    metrics: {
      totalSales: 0,
      totalOrders: 0,
      totalCustomers: 0,
      activeListings: 0,
      surplusUtilizationPct: 0,
      pendingOrders: 0,
      poAcknowledgmentRatePct: 0,
      supplierLateDeliveries: 0,
    },
    salesData: [],
    categoryData: [],
    inventoryData: [],
    topProducts: [],
    recentOrders: [],
    customerAcquisitionData: [],
    salesByCategoryData: [],
    surplusVsSold: [],
  })
  const [surplusSearch, setSurplusSearch] = useState("")

  const theme = useTheme()

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      setError("")

      let metricsResponse, categoriesResponse, productsResponse, ordersResponse, customerResponse, salesCategoryResponse
      try { metricsResponse = await adminAPI.getDashboardMetrics() } catch {}
      try { customerResponse = await adminAPI.getCustomerAcquisition() } catch {}
      try { salesCategoryResponse = await adminAPI.getSalesByCategory() } catch {}
      try { categoriesResponse = await categoriesAPI.getAll() } catch {}
      try { productsResponse = await productsAPI.getTopProducts() } catch {}
      try { ordersResponse = await adminAPI.getRecentOrders() } catch {}

      const metricsPayload = metricsResponse?.data || {}
      const metrics = metricsPayload.metrics || {}
      const surplusVsSold = metricsPayload.surplusVsSold || []

      setDashboardData((prev) => ({
        ...prev,
        metrics: {
          totalSales: metrics.totalSales || 0,
          totalOrders: metrics.totalOrders || 0,
          totalCustomers: metrics.totalCustomers || 0,
          activeListings: metrics.activeListings || 0,
          surplusUtilizationPct: metrics.surplusUtilizationPct || 0,
          pendingOrders: metrics.pendingOrders || 0,
          poAcknowledgmentRatePct: metrics.poAcknowledgmentRatePct || 0,
          supplierLateDeliveries: metrics.supplierLateDeliveries || 0,
        },
        salesData: metricsPayload.salesData || [],
        inventoryData: metricsPayload.inventoryData || [],
        categoryData:
          categoriesResponse?.data?.categories?.map((cat, index) => ({ name: cat.name, value: cat.productCount || 0, color: ["#1976d2", "#4caf50", "#ff9800", "#9c27b0", "#f44336"][index % 5] })) || [],
        topProducts: productsResponse?.data?.products || [],
        recentOrders: ordersResponse?.data?.orders || [],
        customerAcquisitionData: customerResponse?.data?.data || [],
        salesByCategoryData: salesCategoryResponse?.data?.data || [],
        surplusVsSold: surplusVsSold || [],
      }))
    } catch (error) {
      setError("Failed to load dashboard data. Please refresh the page or contact support.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDashboardData()
  }, [])

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "400px" }}>
        <CircularProgress />
        <Typography variant="body1" sx={{ ml: 2 }}>Loading dashboard...</Typography>
      </Box>
    )
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
          <Box sx={{ mt: 2 }}>
            <Button variant="outlined" size="small" onClick={loadDashboardData} startIcon={<Refresh />}>Retry Loading</Button>
          </Box>
        </Alert>
      </Box>
    )
  }

  const MetricsCards = () => {
    const metrics = [
      { title: "Total Sales", value: `KSh ${dashboardData.metrics.totalSales?.toLocaleString() || "0"}`, icon: <AttachMoney sx={{ fontSize: 40, color: "#1976d2" }} />, trend: "+12%", trendUp: true, bgcolor: "#e3f2fd" },
      { title: "Total Orders", value: dashboardData.metrics.totalOrders?.toLocaleString() || "0", icon: <ShoppingCart sx={{ fontSize: 40, color: "#4caf50" }} />, trend: "+8%", trendUp: true, bgcolor: "#e8f5e8" },
      { title: "Total Customers", value: dashboardData.metrics.totalCustomers?.toLocaleString() || "0", icon: <People sx={{ fontSize: 40, color: "#ff9800" }} />, trend: "+15%", trendUp: true, bgcolor: "#fff3e0" },
      { title: "Active Listings", value: dashboardData.metrics.activeListings?.toLocaleString() || "0", icon: <Inventory sx={{ fontSize: 40, color: "#9c27b0" }} />, trend: "+5%", trendUp: true, bgcolor: "#f3e5f5" },
      { title: "Surplus Utilization %", value: `${dashboardData.metrics.surplusUtilizationPct || 0}%`, icon: <CheckCircle sx={{ fontSize: 40, color: "#607d8b" }} />, trend: "+2%", trendUp: true, bgcolor: "#eceff1" },
      { title: "Pending Orders", value: dashboardData.metrics.pendingOrders?.toLocaleString() || "0", icon: <Warning sx={{ fontSize: 40, color: "#f44336" }} />, trend: "+3%", trendUp: true, bgcolor: "#ffebee" },
      { title: "PO Acknowledgment Rate", value: `${dashboardData.metrics.poAcknowledgmentRatePct || 0}%`, icon: <CheckCircle sx={{ fontSize: 40, color: "#2e7d32" }} />, trend: "+1%", trendUp: true, bgcolor: "#e8f5e8" },
      { title: "Supplier Late Deliveries", value: dashboardData.metrics.supplierLateDeliveries?.toLocaleString() || "0", icon: <Warning sx={{ fontSize: 40, color: "#ff6f00" }} />, trend: "-1%", trendUp: false, bgcolor: "#fff3e0" },
    ]

    return (
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {metrics.map((metric, index) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
            <Card sx={{ height: "100%", borderRadius: 3, boxShadow: "0 4px 12px rgba(0,0,0,0.1)", transition: "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out", "&:hover": { transform: "translateY(-4px)", boxShadow: "0 8px 25px rgba(0,0,0,0.15)" } }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
                  <Box sx={{ bgcolor: metric.bgcolor, borderRadius: 2, p: 1.5, display: "flex", alignItems: "center", justifyContent: "center" }}>{metric.icon}</Box>
                  <Box sx={{ display: "flex", alignItems: "center" }}>{metric.trendUp ? <TrendingUp sx={{ fontSize: 20, color: "#4caf50", mr: 0.5 }} /> : <TrendingDown sx={{ fontSize: 20, color: "#f44336", mr: 0.5 }} />}<Typography variant="body2" sx={{ color: metric.trendUp ? "#4caf50" : "#f44336", fontWeight: 600 }}>{metric.trend}</Typography></Box>
                </Box>
                <Typography variant="h4" fontWeight="bold" color="#333" sx={{ mb: 1 }}>{metric.value}</Typography>
                <Typography variant="body2" color="text.secondary" fontWeight={500}>{metric.title}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    )
  }

  const SupplierSurplusVsSold = () => {
    const filtered = (dashboardData.surplusVsSold || []).filter((p) => (p.productName || "").toLowerCase().includes(surplusSearch.toLowerCase()))

    return (
      <ChartContainer
        title="Supplier Surplus vs Sold (by Product)"
        quadrant="Primary"
        actions={
          <Box sx={{ display: "flex", gap: 1 }}>
            <TextField size="small" placeholder="Search product..." value={surplusSearch} onChange={(e) => setSurplusSearch(e.target.value)} />
            <Button size="small" variant="outlined" startIcon={<Refresh />} onClick={loadDashboardData}>Refresh</Button>
          </Box>
        }
      >
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={filtered} onClick={(e) => { /* drilldown to Virtual Stock/Product */ }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="productName" tick={{ fontSize: 12 }} interval={0} angle={-20} textAnchor="end" height={70} />
            <YAxis tick={{ fontSize: 12 }} />
            <ReTooltip contentStyle={{ backgroundColor: "#fff", border: "1px solid #e0e0e0", borderRadius: 8, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }} />
            <Legend />
            <Bar dataKey="surplusListedQty" name="Surplus Listed" fill="#1976d2" radius={[4,4,0,0]} />
            <Bar dataKey="surplusSoldQty" name="Surplus Sold" fill="#4caf50" radius={[4,4,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartContainer>
    )
  }

  const CategoryChart = () => (
    <Paper sx={{ p: 3, borderRadius: 3, boxShadow: "0 4px 12px rgba(0,0,0,0.1)", height: "100%" }}>
      <Typography variant="h6" fontWeight="bold" color="#333" gutterBottom>📊 Product Distribution by Category</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>Breakdown of products across different categories</Typography>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie data={dashboardData.categoryData} cx="50%" cy="50%" innerRadius={60} outerRadius={120} paddingAngle={5} dataKey="value">
            {dashboardData.categoryData.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.color} />))}
          </Pie>
          <ReTooltip contentStyle={{ backgroundColor: "#fff", border: "1px solid #e0e0e0", borderRadius: "8px", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }} />
        </PieChart>
      </ResponsiveContainer>
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 2 }}>
        {dashboardData.categoryData.map((entry, index) => (
          <Chip key={index} label={`${entry.name}: ${entry.value}`} sx={{ bgcolor: entry.color, color: "white", fontWeight: 600, fontSize: "0.75rem" }} />
        ))}
      </Box>
    </Paper>
  )

  const TopProducts = () => (
    <Paper sx={{ p: 3, borderRadius: 3, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
      <Typography variant="h6" fontWeight="bold" color="#333" gutterBottom>🏆 Top Performing Products</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>Best selling products this month</Typography>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: "#f8f9fa" }}>
              <TableCell sx={{ fontWeight: 700, fontSize: "0.9rem" }}>Product</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: "0.9rem" }}>Sales</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: "0.9rem" }}>Revenue</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: "0.9rem" }}>Growth</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {!dashboardData.topProducts || dashboardData.topProducts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ py: 4 }}><Typography variant="body2" color="text.secondary">No product data available in database</Typography></TableCell>
              </TableRow>
            ) : (
              dashboardData.topProducts.map((product, index) => (
                <TableRow key={product.id || index} hover>
                  <TableCell>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <Avatar src={product.imageUrl || `/placeholder.svg?height=52&width=52&query=${encodeURIComponent(product.name || "Product")}`} alt={product.name || "Product"} sx={{ width: 52, height: 52, borderRadius: 2 }} />
                      <Typography variant="body1" fontWeight={600}>{product.name || "Unknown Product"}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell><Typography variant="body1" fontWeight={600}>{product.sales || 0}</Typography></TableCell>
                  <TableCell><Typography variant="body1" fontWeight={600} color="#1976d2">{product.revenue || "KSh 0"}</Typography></TableCell>
                  <TableCell>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      {product.trend === "up" || !product.trend ? <TrendingUp sx={{ fontSize: 20, color: "#4caf50" }} /> : <TrendingDown sx={{ fontSize: 20, color: "#f44336" }} />}
                      <Typography variant="body2" sx={{ color: product.trend === "up" || !product.trend ? "#4caf50" : "#f44336", fontWeight: 600 }}>{product.growth || "0%"}</Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  )

  const CustomerAcquisitionChart = () => (
    <Paper sx={{ p: 3, borderRadius: 3, boxShadow: "0 4px 12px rgba(0,0,0,0.1)", height: "100%" }}>
      <Typography variant="h6" fontWeight="bold" color="#333" gutterBottom>👥 Customer Acquisition</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>New customer growth over time</Typography>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={dashboardData.customerAcquisitionData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="month" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <ReTooltip contentStyle={{ backgroundColor: "#fff", border: "1px solid #e0e0e0", borderRadius: "8px", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }} />
          <Bar dataKey="newCustomers" fill="#4caf50" name="New Customers" radius={[4, 4, 0, 0]} />
          <Bar dataKey="returningCustomers" fill="#2196f3" name="Returning Customers" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </Paper>
  )

  const SalesByCategoryChart = () => (
    <Paper sx={{ p: 3, borderRadius: 3, boxShadow: "0 4px 12px rgba(0,0,0,0.1)", height: "100%" }}>
      <Typography variant="h6" fontWeight="bold" color="#333" gutterBottom>💰 Sales by Category</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>Revenue breakdown by product categories</Typography>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie data={dashboardData.salesByCategoryData} cx="50%" cy="50%" innerRadius={60} outerRadius={120} paddingAngle={5} dataKey="sales">
            {dashboardData.salesByCategoryData.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.color || ["#1976d2", "#4caf50", "#ff9800", "#9c27b0", "#f44336"][index % 5]} />))}
          </Pie>
          <ReTooltip contentStyle={{ backgroundColor: "#fff", border: "1px solid #e0e0e0", borderRadius: "8px", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }} />
        </PieChart>
      </ResponsiveContainer>
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 2 }}>
        {dashboardData.salesByCategoryData.map((entry, index) => (
          <Chip key={index} label={`${entry.category}: KSh ${entry.sales?.toLocaleString() || 0}`} sx={{ bgcolor: entry.color || ["#1976d2", "#4caf50", "#ff9800", "#9c27b0", "#f44336"][index % 5], color: "white", fontWeight: 600, fontSize: "0.75rem" }} />
        ))}
      </Box>
    </Paper>
  )

  return (
    <Box sx={{ p: 3, bgcolor: "#f8fafc", minHeight: "100vh" }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" color="#1976d2" gutterBottom>📊 Admin Dashboard</Typography>
        <Typography variant="body1" color="text.secondary">Welcome back! Here's what's happening with your business today.</Typography>
      </Box>

      <MetricsCards />

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} lg={12}>
          <SupplierSurplusVsSold />
        </Grid>
      </Grid>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} lg={6}>
          <CategoryChart />
        </Grid>
        <Grid item xs={12} lg={6}>
          <CustomerAcquisitionChart />
        </Grid>
      </Grid>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} lg={6}>
          <SalesByCategoryChart />
        </Grid>
        <Grid item xs={12} lg={6}>
          <TopProducts />
        </Grid>
      </Grid>
    </Box>
  )
}

export default EnhancedDashboard
