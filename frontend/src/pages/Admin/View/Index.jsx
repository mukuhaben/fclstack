"use client"

import { useState, useEffect } from "react"
import {
  Box,
  Container,
  Typography,
  Paper,
  Tabs,
  Tab,
  Alert,
  Button,
  useMediaQuery,
  useTheme,
  Snackbar,
} from "@mui/material"
import { Add as AddIcon, List as ListIcon } from "@mui/icons-material"
import { useNavigate } from "react-router-dom"
import AdminNavigation from "../../../components/admin/AdminNavigation"
import EnhancedDashboard from "../../../components/admin/EnhancedDashboard"
import NewItemForm from "../../../components/admin/NewItemForm"
import ManageItems from "../../../components/admin/ManageItems"
import CategoryManagement from "../../../components/admin/CategoryManagement"
import GRNManagement from "../../../components/admin/InventoryManagement"
import SalesManagement from "../../../components/admin/SalesManagement"
import SupplierManagement from "../../../components/admin/SupplierManagement"
import SalesAgentAdminPanel from "../../../components/admin/SalesAgentAdminPanel"
import CustomerManagement from "../../../components/admin/CustomerManagement"
import OrdersManagement from "../../../components/admin/OrdersManagement"
import PurchaseOrderManagement from "../../../components/admin/PurchaseOrderManagement"
import AlertsManagement from "../../../components/admin/AlertsManagement"

// Tab panel component for clean content rendering
function TabPanel(props) {
  const { children, value, index, ...other } = props

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`admin-tabpanel-${index}`}
      aria-labelledby={`admin-tab-${index}`}
      {...other}
      style={{ width: "100%" }}
    >
      {value === index && (
        <Box
          sx={{
            p: { xs: 0, sm: 0 },
            minHeight: "calc(100vh - 120px)",
          }}
        >
          {children}
        </Box>
      )}
    </div>
  )
}

const AdminPage = () => {
  const navigate = useNavigate()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("md"))

  // E-commerce admin state management
  const [tabValue, setTabValue] = useState(0)
  const [subTabValue, setSubTabValue] = useState(0)
  const [currentUser, setCurrentUser] = useState(null)
  const [successMessage, setSuccessMessage] = useState("")
  const [editingItem, setEditingItem] = useState(null)
  const [crudNotification, setCrudNotification] = useState({ open: false, message: "", severity: "success" })
  const [salesSubTabValue, setSalesSubTabValue] = useState(0)
  const [inventorySubTabValue, setInventorySubTabValue] = useState(0)

  // E-commerce data state for CRUD operations
  const [items, setItems] = useState([])
  const [categories, setCategories] = useState([
    {
      id: 1,
      name: "Art Supplies",
      description: "Art and creative supplies",
      subCategories: [
        { id: 101, name: "Sketch Pads", description: "Drawing and sketching pads" },
        { id: 102, name: "Acrylic Paints", description: "Acrylic paint sets and tubes" },
        { id: 103, name: "Coloring Pencils", description: "Colored pencils and sets" },
        { id: 104, name: "Crayons", description: "Wax crayons and oil pastels" },
        { id: 105, name: "Art Accessories", description: "Brushes, palettes, and other art tools" },
      ],
    },
    {
      id: 2,
      name: "General Stationery",
      description: "General office and school stationery",
      subCategories: [
        { id: 201, name: "Accounts Books", description: "Accounting and record books" },
        { id: 202, name: "Analysis Books", description: "Analysis and computation books" },
        { id: 203, name: "Binding PVC Book Covers", description: "Book covers and binding materials" },
        { id: 204, name: "Cash Boxes", description: "Cash storage and security boxes" },
        { id: 205, name: "Exercise Books", description: "Student exercise and composition books" },
        { id: 206, name: "Pens & Pencils", description: "Writing instruments" },
        { id: 207, name: "Paper Products", description: "Various paper types and sizes" },
      ],
    },
    {
      id: 3,
      name: "IT & Accessories",
      description: "Information technology and computer accessories",
      subCategories: [
        { id: 301, name: "Ink Cartridges", description: "Printer ink cartridges" },
        { id: 302, name: "Toner Cartridges", description: "Laser printer toner cartridges" },
        { id: 303, name: "USB Cables", description: "USB cables and connectors" },
        { id: 304, name: "Printers", description: "Desktop and office printers" },
        { id: 305, name: "Computer Accessories", description: "Keyboards, mice, and other accessories" },
        { id: 306, name: "Storage Devices", description: "USB drives, hard drives, and memory cards" },
      ],
    },
    {
      id: 4,
      name: "Furniture",
      description: "Office and school furniture",
      subCategories: [
        { id: 401, name: "Chairs", description: "Office and student chairs" },
        { id: 402, name: "Tables", description: "Desks and work tables" },
        { id: 403, name: "Cabinets", description: "Storage cabinets and lockers" },
        { id: 404, name: "Shelving", description: "Bookshelves and storage shelves" },
        { id: 405, name: "Reception Furniture", description: "Reception desks and seating" },
      ],
    },
    {
      id: 5,
      name: "Office Automation",
      description: "Office automation and equipment",
      subCategories: [
        { id: 501, name: "Safes", description: "Security safes and cash boxes" },
        { id: 502, name: "Binders", description: "Document binders and organizers" },
        { id: 503, name: "Shredders", description: "Paper shredders and destroyers" },
        { id: 504, name: "Laminators", description: "Document laminators and supplies" },
        { id: 505, name: "Calculators", description: "Desktop and scientific calculators" },
        { id: 506, name: "Staplers & Punchers", description: "Staplers, hole punchers, and accessories" },
      ],
    },
    {
      id: 6,
      name: "School Supplies",
      description: "Educational and school supplies",
      subCategories: [
        { id: 601, name: "Student Notebooks", description: "Exercise books and notebooks" },
        { id: 602, name: "Mathematical Instruments", description: "Geometry sets and instruments" },
        { id: 603, name: "Educational Charts", description: "Learning charts and posters" },
        { id: 604, name: "School Bags", description: "Student backpacks and bags" },
        { id: 605, name: "Laboratory Equipment", description: "Basic lab equipment for schools" },
      ],
    },
    {
      id: 7,
      name: "Cleaning Supplies",
      description: "Cleaning and maintenance supplies",
      subCategories: [
        { id: 701, name: "Cleaning Chemicals", description: "Detergents and cleaning solutions" },
        { id: 702, name: "Cleaning Tools", description: "Mops, brooms, and cleaning equipment" },
        { id: 703, name: "Tissue Papers", description: "Toilet paper, tissues, and paper towels" },
        { id: 704, name: "Waste Management", description: "Trash bags and waste containers" },
      ],
    },
  ])

  // E-commerce admin authentication
  useEffect(() => {
    const storedUser = localStorage.getItem("currentUser")
    if (storedUser) {
      const user = JSON.parse(storedUser)
      setCurrentUser(user)

      // E-commerce admin access control
      if (!user.isAdmin && !user.email?.includes("admin")) {
        navigate("/")
        return
      }
    } else {
      navigate("/login")
      return
    }
  }, [navigate])

  // CRUD Operations Handler
  const handleCRUDOperation = (action, section, data) => {
    console.log(`CRUD Operation: ${action} on ${section}`, data)

    switch (action) {
      case "create":
        if (section === "itemMaster") {
          setTabValue(1)
          setSubTabValue(0) // New Item
          setCrudNotification({
            open: true,
            message: "Opening New Item form...",
            severity: "info",
          })
        } else if (section === "categories") {
          setTabValue(2)
          setCrudNotification({
            open: true,
            message: "Opening Category creation form...",
            severity: "info",
          })
        } else if (section === "orders") {
          setTabValue(3) // Route to Sales tab
          setSalesSubTabValue(0) // OrdersManagement
          setCrudNotification({
            open: true,
            message: "Opening Orders Management...",
            severity: "info",
          })
        } else if (section === "purchaseOrders") {
          setTabValue(4) // Route to Inventory tab
          setInventorySubTabValue(0) // PurchaseOrderManagement
          setCrudNotification({
            open: true,
            message: "Opening Purchase Order Management...",
            severity: "info",
          })
        }
        // Add more create operations for other sections
        break

      case "read":
        if (section === "itemMaster") {
          setTabValue(1)
          setSubTabValue(1) // Manage Items
          setCrudNotification({
            open: true,
            message: "Loading items list...",
            severity: "info",
          })
        } else if (section === "categories") {
          setTabValue(2)
          setCrudNotification({
            open: true,
            message: "Loading categories...",
            severity: "info",
          })
        } else if (section === "orders") {
          setTabValue(3) // Route to Sales tab
          setSalesSubTabValue(0) // OrdersManagement
          setCrudNotification({
            open: true,
            message: "Loading orders...",
            severity: "info",
          })
        } else if (section === "purchaseOrders") {
          setTabValue(4) // Route to Inventory tab
          setInventorySubTabValue(0) // PurchaseOrderManagement
          setCrudNotification({
            open: true,
            message: "Loading purchase orders...",
            severity: "info",
          })
        }
        // Add more read operations for other sections
        break

      case "update":
        setCrudNotification({
          open: true,
          message: `Opening edit form for ${section}...`,
          severity: "warning",
        })
        // Handle update operations
        break

      case "delete":
        setCrudNotification({
          open: true,
          message: `Delete operation for ${section} - Please confirm`,
          severity: "error",
        })
        // Handle delete operations
        break

      default:
        console.log("Unknown CRUD operation")
    }
  }

  // E-commerce admin navigation handlers
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue)
    setSubTabValue(0) // Reset sub tab when main tab changes
  }

  const handleSubTabChange = (event, newValue) => {
    setSubTabValue(newValue)
  }

  const handleSalesSubTabChange = (event, newValue) => {
    setSalesSubTabValue(newValue)
  }

  const handleInventorySubTabChange = (event, newValue) => {
    setInventorySubTabValue(newValue)
  }

  const handleLogout = () => {
    localStorage.removeItem("currentUser")
    navigate("/")
  }

  const handleDirectNavigation = (componentName, tabIndex) => {
    console.log(`[v0] Direct navigation to: ${componentName} at tab ${tabIndex}`)

    // Set the main tab
    setTabValue(tabIndex)

    // Handle sub-tab navigation based on component
    switch (componentName) {
      case "NewItemForm":
        setSubTabValue(0)
        break
      case "ManageItems":
        setSubTabValue(1)
        break
      case "CategoryManagement":
        // Categories don't have sub-tabs, just set main tab
        break
      case "OrdersManagement":
        setSalesSubTabValue(0)
        break
      case "InvoiceManagement":
      case "SalesManagement":
        setSalesSubTabValue(1)
        break
      case "PurchaseOrderManagement":
        setInventorySubTabValue(0)
        break
      case "InventoryManagement":
      case "GRNManagement":
        setInventorySubTabValue(1)
        break
      case "SupplierManagement":
        // Suppliers don't have sub-tabs
        break
      case "SalesAgentAdminPanel":
        // Sales Agents don't have sub-tabs
        break
      case "CustomerManagement":
        // Customers don't have sub-tabs
        break
      default:
        console.log(`[v0] Unknown component: ${componentName}`)
    }

    setCrudNotification({
      open: true,
      message: `Navigating to ${componentName}...`,
      severity: "info",
    })
  }

  // E-commerce category management
  const handleCategoriesChange = (updatedCategories) => {
    setCategories(updatedCategories)
    setCrudNotification({
      open: true,
      message: "Categories updated successfully!",
      severity: "success",
    })
  }

  // E-commerce product management
  const handleNewItemSubmit = (itemData) => {
    console.log("E-commerce item submitted:", itemData)

    // Add item to items array (simulating database operation)
    const newItem = {
      id: Date.now(),
      ...itemData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    setItems((prevItems) => [...prevItems, newItem])

    setSuccessMessage(editingItem ? "Product updated successfully!" : "Product added successfully!")
    setCrudNotification({
      open: true,
      message: editingItem ? "Product updated successfully!" : "Product added successfully!",
      severity: "success",
    })

    setTimeout(() => setSuccessMessage(""), 3000)
    setEditingItem(null)
    setTabValue(1) // Switch to Item Master tab
    setSubTabValue(1) // Switch to Manage Items sub-tab
  }

  const handleEditItem = (item) => {
    setEditingItem(item)
    setTabValue(1) // Switch to Item Master tab
    setSubTabValue(0) // Switch to New Item sub-tab
    setCrudNotification({
      open: true,
      message: `Editing item: ${item.productName}`,
      severity: "info",
    })
  }

  const handleAddNewItem = () => {
    setEditingItem(null)
    setTabValue(1) // Switch to Item Master tab
    setSubTabValue(0) // Switch to New Item sub-tab
  }

  const handleCloseNotification = () => {
    setCrudNotification({ ...crudNotification, open: false })
  }

  if (!currentUser) {
    return null
  }

  // E-commerce admin access validation
  if (!currentUser.isAdmin && !currentUser.email?.includes("admin")) {
    return (
      <Container maxWidth="sm" sx={{ py: 8, textAlign: "center" }}>
        <Alert severity="error">
          <Typography variant="h6" gutterBottom sx={{ fontFamily: "'Poppins', sans-serif" }}>
            Access Denied
          </Typography>
          <Typography variant="body1" sx={{ fontFamily: "'Poppins', sans-serif" }}>
            {"You don't have permission to access the e-commerce admin panel. Please contact your administrator."}
          </Typography>
          <Button variant="contained" onClick={() => navigate("/")} sx={{ mt: 2, fontFamily: "'Poppins', sans-serif" }}>
            Go to Homepage
          </Button>
        </Alert>
      </Container>
    )
  }

  return (
    <Box
      className="ecommerce-admin-interface"
      sx={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        bgcolor: "#f8fafc",
        fontFamily: "'Poppins', sans-serif",
      }}
    >
      {/* Single Unified Admin Navigation with CRUD */}
      <AdminNavigation
        currentUser={currentUser}
        onLogout={handleLogout}
        activeTab={tabValue}
        onTabChange={handleTabChange}
        onItemMasterSubTabChange={handleSubTabChange}
        onSalesSubTabChange={handleSalesSubTabChange}
        onInventorySubTabChange={handleInventorySubTabChange}
        onDirectNavigation={handleDirectNavigation}
        onCRUDOperation={handleCRUDOperation}
      />

      {/* E-commerce Success Messages */}
      {successMessage && (
        <Box sx={{ px: { xs: 2, sm: 3 }, pt: 2 }}>
          <Alert
            severity="success"
            onClose={() => setSuccessMessage("")}
            sx={{
              fontFamily: "'Poppins', sans-serif",
              borderRadius: 2,
            }}
          >
            {successMessage}
          </Alert>
        </Box>
      )}

      {/* CRUD Operation Notifications */}
      <Snackbar
        open={crudNotification.open}
        autoHideDuration={4000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseNotification}
          severity={crudNotification.severity}
          sx={{
            fontFamily: "'Poppins', sans-serif",
            borderRadius: 2,
          }}
        >
          {crudNotification.message}
        </Alert>
      </Snackbar>

      {/* E-commerce Admin Content */}
      <Box component="main" sx={{ flexGrow: 1, bgcolor: "#f8fafc" }}>
        {/* Dashboard - E-commerce Analytics */}
        <TabPanel value={tabValue} index={0}>
          <EnhancedDashboard />
        </TabPanel>

        {/* Item Master - E-commerce Product Management with CRUD */}
        <TabPanel value={tabValue} index={1}>
          {/* Clean sub-navigation without redundant headers */}
          <Paper
            sx={{
              mb: 3,
              bgcolor: "white",
              borderRadius: 2,
              overflow: "hidden",
              mx: { xs: 2, sm: 3 },
              mt: 3,
            }}
          >
            <Tabs
              value={subTabValue}
              onChange={handleSubTabChange}
              aria-label="item master tabs"
              variant={isMobile ? "scrollable" : "standard"}
              scrollButtons={isMobile ? "auto" : false}
              allowScrollButtonsMobile
              sx={{
                "& .MuiTab-root": {
                  textTransform: "none",
                  fontSize: "0.9rem",
                  fontWeight: 500,
                  fontFamily: "'Poppins', sans-serif",
                  minHeight: 48,
                },
              }}
            >
              <Tab icon={<AddIcon />} label="New Item" />
              <Tab icon={<ListIcon />} label="Manage Items" />
            </Tabs>
          </Paper>

          {/* E-commerce product forms with CRUD operations */}
          {subTabValue === 0 && (
            <NewItemForm categories={categories} onSubmit={handleNewItemSubmit} editItem={editingItem} items={items} />
          )}
          {subTabValue === 1 && (
            <ManageItems
              onEditItem={handleEditItem}
              onAddNewItem={handleAddNewItem}
              items={items}
              setItems={setItems}
            />
          )}
        </TabPanel>

        {/* Categories - E-commerce Category Management with CRUD */}
        <TabPanel value={tabValue} index={2}>
          <CategoryManagement categories={categories} onCategoriesChange={handleCategoriesChange} />
        </TabPanel>

        {/* Sales - E-commerce Sales Management with CRUD */}
        <TabPanel value={tabValue} index={3}>
          <Paper
            sx={{
              mb: 3,
              bgcolor: "white",
              borderRadius: 2,
              overflow: "hidden",
              mx: { xs: 2, sm: 3 },
              mt: 3,
            }}
          >
            <Tabs
              value={salesSubTabValue}
              onChange={handleSalesSubTabChange}
              aria-label="sales management tabs"
              variant={isMobile ? "scrollable" : "standard"}
              scrollButtons={isMobile ? "auto" : false}
              allowScrollButtonsMobile
              sx={{
                "& .MuiTab-root": {
                  textTransform: "none",
                  fontSize: "0.9rem",
                  fontWeight: 500,
                  fontFamily: "'Poppins', sans-serif",
                  minHeight: 48,
                },
              }}
            >
              <Tab label="Orders" />
              <Tab label="Invoices" />
            </Tabs>
          </Paper>

          {salesSubTabValue === 0 && <OrdersManagement />}
          {salesSubTabValue === 1 && <SalesManagement />}
        </TabPanel>

        {/* Inventory - E-commerce Stock Management with CRUD */}
        <TabPanel value={tabValue} index={4}>
          <Paper
            sx={{
              mb: 3,
              bgcolor: "white",
              borderRadius: 2,
              overflow: "hidden",
              mx: { xs: 2, sm: 3 },
              mt: 3,
            }}
          >
            <Tabs
              value={inventorySubTabValue}
              onChange={handleInventorySubTabChange}
              aria-label="inventory management tabs"
              variant={isMobile ? "scrollable" : "standard"}
              scrollButtons={isMobile ? "auto" : false}
              allowScrollButtonsMobile
              sx={{
                "& .MuiTab-root": {
                  textTransform: "none",
                  fontSize: "0.9rem",
                  fontWeight: 500,
                  fontFamily: "'Poppins', sans-serif",
                  minHeight: 48,
                },
              }}
            >
              <Tab label="Purchase Orders" />
              <Tab label="GRN Management" />
            </Tabs>
          </Paper>

          {inventorySubTabValue === 0 && <PurchaseOrderManagement />}
          {inventorySubTabValue === 1 && <GRNManagement />}
        </TabPanel>

        {/* Suppliers - E-commerce Vendor Management with CRUD */}
        <TabPanel value={tabValue} index={5}>
          <SupplierManagement />
        </TabPanel>

        {/* Sales Agents - E-commerce Team Management with CRUD */}
        <TabPanel value={tabValue} index={6}>
          <SalesAgentAdminPanel />
        </TabPanel>

        {/* Customer Management Tab */}
        <TabPanel value={tabValue} index={7}>
          <CustomerManagement />
        </TabPanel>

        {/* Alerts Tab */}
        <TabPanel value={tabValue} index={8}>
          <AlertsManagement />
        </TabPanel>
      </Box>
    </Box>
  )
}

export default AdminPage
