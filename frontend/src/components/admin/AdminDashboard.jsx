"use client"

import { useState, useCallback } from "react"
import { Box, Typography } from "@mui/material"
import AdminNavigation from "./AdminNavigation"

// Import all the components with correct mappings
import EnhancedDashboard from "./EnhancedDashboard"
import ManageItems from "./ManageItems"
import NewItemForm from "./NewItemForm"
import CategoryManagement from "./CategoryManagement"
import OrdersManagement from "./OrdersManagement" // Customer orders
import InvoiceManagement from "./InvoiceManagement" // Invoices
import PurchaseOrderManagement from "./PurchaseOrderManagement" // Purchase orders
import InventoryManagement from "./InventoryManagement" // GRN management
import SupplierManagement from "./SupplierManagement"
import SalesAgentAdminPanel from "./SalesAgentAdminPanel"
import CustomerManagement from "./CustomerManagement"

// Tab Panel Component
function TabPanel(props) {
  const { children, value, index, ...other } = props
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`admin-tabpanel-${index}`}
      aria-labelledby={`admin-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 0 }}>{children}</Box>}
    </div>
  )
}

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState(0)
  const [activeComponent, setActiveComponent] = useState(null) // For direct component navigation
  const [currentUser] = useState({ username: "admin" })

  // Handle main tab changes
  const handleTabChange = useCallback((event, newValue) => {
    setActiveTab(newValue)
    setActiveComponent(null) // Reset component when changing tabs
  }, [])

  // Handle direct component navigation from dropdowns
  const handleDirectNavigation = useCallback((componentName, tabIndex) => {
    console.log(`Direct navigation to: ${componentName} in tab ${tabIndex}`)
    setActiveTab(tabIndex)
    setActiveComponent(componentName)
  }, [])

  // Handle CRUD operations from navigation dropdowns
  const handleCRUDOperation = useCallback((action, section, data) => {
    console.log(`CRUD Operation: ${action} on ${section}`, data)

    // Direct navigation based on section and data type
    switch (section) {
      case "itemMaster":
        setActiveTab(1) // Item Master tab
        if (action === "create") {
          setActiveComponent("NewItemForm")
        } else if (action === "read") {
          setActiveComponent("ManageItems")
        }
        break

      case "categories":
        setActiveTab(2) // Categories tab
        setActiveComponent("CategoryManagement")
        break

      case "sales":
        setActiveTab(3) // Sales tab
        if (data?.type === "orders") {
          setActiveComponent("OrdersManagement")
        } else if (data?.type === "invoices") {
          setActiveComponent("InvoiceManagement")
        }
        break

      case "grn":
        setActiveTab(4) // GRN tab
        if (data?.type === "purchase-orders") {
          setActiveComponent("PurchaseOrderManagement")
        } else if (data?.type === "grn") {
          setActiveComponent("InventoryManagement")
        }
        break

      case "suppliers":
        setActiveTab(5) // Suppliers tab
        setActiveComponent("SupplierManagement")
        break

      case "agents":
        setActiveTab(6) // Sales Agents tab
        setActiveComponent("SalesAgentAdminPanel")
        break

      case "customers":
        setActiveTab(7) // Customers tab
        setActiveComponent("CustomerManagement")
        break

      default:
        console.warn(`Unknown section: ${section}`)
    }
  }, [])

  // Handle logout
  const handleLogout = () => {
    console.log("Logging out...")
    // Implement logout logic
  }

  // Render the appropriate component based on active tab and component
  const renderContent = () => {
    // If a specific component is selected via dropdown, render it directly
    if (activeComponent) {
      switch (activeComponent) {
        case "NewItemForm":
          return <NewItemForm />
        case "ManageItems":
          return <ManageItems />
        case "CategoryManagement":
          return <CategoryManagement />
        case "OrdersManagement":
          return <OrdersManagement />
        case "InvoiceManagement":
          return <InvoiceManagement />
        case "PurchaseOrderManagement":
          return <PurchaseOrderManagement />
        case "InventoryManagement":
          return <InventoryManagement />
        case "SupplierManagement":
          return <SupplierManagement />
        case "SalesAgentAdminPanel":
          return <SalesAgentAdminPanel />
        case "CustomerManagement":
          return <CustomerManagement />
        default:
          return <Typography>Component not found</Typography>
      }
    }

    // Default tab content when no specific component is selected
    switch (activeTab) {
      case 0:
        return <EnhancedDashboard />
      case 1:
        return <ManageItems /> // Default to Manage Items
      case 2:
        return <CategoryManagement />
      case 3:
        return <OrdersManagement /> // Default to Orders
      case 4:
        return <PurchaseOrderManagement /> // Default to Purchase Orders
      case 5:
        return <SupplierManagement />
      case 6:
        return <SalesAgentAdminPanel />
      case 7:
        return <CustomerManagement />
      default:
        return <EnhancedDashboard />
    }
  }

  return (
    <Box sx={{ width: "100%", bgcolor: "#f8fafc", minHeight: "100vh" }}>
      {/* Navigation Header */}
      <AdminNavigation
        currentUser={currentUser}
        onLogout={handleLogout}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        onDirectNavigation={handleDirectNavigation}
        onCRUDOperation={handleCRUDOperation}
        activeComponent={activeComponent}
      />

      {/* Main Content Area */}
      <Box sx={{ width: "100%" }}>{renderContent()}</Box>
    </Box>
  )
}

export default AdminDashboard
