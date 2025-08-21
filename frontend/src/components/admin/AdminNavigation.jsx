"use client"

import { useState, useRef, useCallback } from "react"
import {
  AppBar,
  Toolbar,
  Box,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  Button,
  useMediaQuery,
  useTheme,
  Popper,
  Paper,
  ClickAwayListener,
  Grow,
  MenuList,
  ListItemIcon,
  ListItemText,
} from "@mui/material"
import { styled } from "@mui/material/styles"
import {
  Dashboard,
  ShoppingCart,
  Category as CategoryIcon,
  AttachMoney as SalesIcon,
  Inventory,
  LocalShipping as SuppliersIcon,
  People,
  AccountCircle,
  Settings,
  ExitToApp,
  Add as AddIcon,
  List as ListIcon,
  KeyboardArrowDown,
  Visibility as ViewIcon,
  Store as StoreIcon,
  ListAlt as ListAltIcon,
  Receipt as GRNIcon,
} from "@mui/icons-material"
import { useNavigate } from "react-router-dom"

// Clean, modern admin navigation button with white text on blue background
const AdminNavButton = styled(Button)(({ theme, active }) => ({
  color: active ? "#ffffff" : "rgba(255,255,255,0.8)",
  backgroundColor: active ? "rgba(255,255,255,0.15)" : "transparent",
  textTransform: "none",
  fontSize: "0.8rem",
  fontWeight: active ? 600 : 500,
  fontFamily: "'Poppins', sans-serif",
  padding: "6px 12px",
  borderRadius: "6px",
  minWidth: "auto",
  margin: "0 2px",
  height: "36px",
  transition: "all 0.2s ease",
  "&:hover": {
    backgroundColor: "rgba(255,255,255,0.2)",
    color: "#ffffff",
  },
  "& .MuiButton-startIcon": {
    marginRight: "4px",
  },
  "& .MuiButton-endIcon": {
    marginLeft: "2px",
  },
}))

// Clean dropdown paper with no borders
const StyledDropdownPaper = styled(Paper)(({ theme }) => ({
  backgroundColor: "white",
  color: "#333",
  minWidth: 180,
  maxWidth: 240,
  boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
  borderRadius: "8px",
  fontFamily: "'Poppins', sans-serif",
  marginTop: "8px",
  overflow: "hidden",
  zIndex: 99999,
}))

// Clean menu item with no borders
const StyledMenuItem = styled(MenuItem)(({ theme }) => ({
  fontFamily: "'Poppins', sans-serif",
  fontSize: "0.875rem",
  fontWeight: 500,
  padding: "10px 16px",
  transition: "all 0.15s ease",
  "&:hover": {
    backgroundColor: "#f5f5f5",
    color: "#1976d2",
  },
  "& .MuiListItemIcon-root": {
    minWidth: "32px",
    color: "inherit",
  },
  "& .MuiListItemText-primary": {
    fontWeight: 500,
    fontSize: "0.875rem",
  },
  "& .MuiListItemText-secondary": {
    fontSize: "0.75rem",
    color: "#666",
  },
}))

const AdminNavigation = ({
  currentUser,
  onLogout,
  activeTab,
  onTabChange,
  onDirectNavigation,
  onCRUDOperation,
  activeComponent,
}) => {
  const navigate = useNavigate()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("md"))

  // State management for dropdowns and menus
  const [anchorEl, setAnchorEl] = useState(null)
  const [dropdownStates, setDropdownStates] = useState({
    itemMaster: false,
    categories: false,
    sales: false,
    grn: false,
    suppliers: false,
    agents: false,
  })

  // Refs for dropdown positioning
  const dropdownRefs = {
    itemMaster: useRef(null),
    categories: useRef(null),
    sales: useRef(null),
    grn: useRef(null),
    suppliers: useRef(null),
    agents: useRef(null),
  }

  const isMenuOpen = Boolean(anchorEl)

  const handleDropdownToggle = useCallback((section) => {
    console.log(`🔄 Dropdown ${section}: TOGGLING`)
    setDropdownStates((prev) => {
      // Close all other dropdowns first
      const newState = {
        itemMaster: false,
        categories: false,
        sales: false,
        grn: false,
        suppliers: false,
        agents: false,
      }
      // Toggle the clicked dropdown
      newState[section] = !prev[section]
      return newState
    })
  }, [])

  const handleDropdownClose = useCallback((section) => {
    setDropdownStates((prev) => ({
      ...prev,
      [section]: false,
    }))
  }, [])

  const handleAllDropdownsClose = useCallback(() => {
    setDropdownStates({
      itemMaster: false,
      categories: false,
      sales: false,
      grn: false,
      suppliers: false,
      agents: false,
    })
  }, [])

  // Enhanced direct navigation handler
  const handleDirectComponentNavigation = useCallback(
    (componentName, tabIndex, section, data = null) => {
      console.log(`🎯 Direct navigation to: ${componentName} in tab ${tabIndex}`)

      // Close all dropdowns immediately
      handleAllDropdownsClose()

      try {
        // Use direct navigation if available
        if (onDirectNavigation) {
          onDirectNavigation(componentName, tabIndex)
        }

        // Also call CRUD operation handler for backward compatibility
        if (onCRUDOperation) {
          onCRUDOperation("read", section, data)
        }

        console.log(`✅ Navigation completed for ${componentName}`)
      } catch (error) {
        console.error(`❌ Navigation failed for ${componentName}:`, error)
        alert(`Failed to navigate to ${componentName}. Please try again.`)
      }
    },
    [onDirectNavigation, onCRUDOperation, handleAllDropdownsClose],
  )

  // Profile menu handlers
  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
  }

  const handleLogout = () => {
    handleMenuClose()
    if (onLogout) onLogout()
  }

  const handleNavigateHome = () => {
    navigate("/")
  }

  const handleTabClick = (tabIndex) => {
    console.log(`🎯 Direct tab click: ${tabIndex}`)
    handleAllDropdownsClose()
    onTabChange(null, tabIndex)
  }

  // Check if a tab or component is active
  const isTabActive = (tabIndex, componentName = null) => {
    if (componentName && activeComponent === componentName) {
      return true
    }
    return activeTab === tabIndex && !activeComponent
  }

  const renderCRUDDropdown = (section, isOpen, anchorRef, items) => (
    <Popper
      open={isOpen}
      anchorEl={anchorRef.current}
      placement="bottom-start"
      transition
      disablePortal={false}
      sx={{
        zIndex: 99999,
      }}
      modifiers={[
        {
          name: "offset",
          options: {
            offset: [0, 4],
          },
        },
      ]}
    >
      {({ TransitionProps }) => (
        <Grow {...TransitionProps} timeout={200}>
          <StyledDropdownPaper elevation={4}>
            <ClickAwayListener onClickAway={() => handleDropdownClose(section)}>
              <MenuList autoFocusItem={isOpen} id={`${section}-menu`} sx={{ py: 0.5 }}>
                {items.map((item, index) => (
                  <StyledMenuItem
                    key={`${section}-${index}`}
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      console.log(`🖱️ Dropdown item clicked: ${item.label} in ${section}`)
                      try {
                        handleDirectComponentNavigation(item.componentName, item.tabIndex, section, item.data)
                      } catch (error) {
                        console.error(`Error handling dropdown click for ${item.label}:`, error)
                      }
                    }}
                  >
                    <ListItemIcon>{item.icon}</ListItemIcon>
                    <ListItemText primary={item.label} secondary={item.description} />
                  </StyledMenuItem>
                ))}
              </MenuList>
            </ClickAwayListener>
          </StyledDropdownPaper>
        </Grow>
      )}
    </Popper>
  )

  // Profile menu renderer
  const menuId = "primary-search-account-menu"
  const renderMenu = (
    <Menu
      anchorEl={anchorEl}
      anchorOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
      id={menuId}
      keepMounted
      transformOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
      open={isMenuOpen}
      onClose={handleMenuClose}
      sx={{
        "& .MuiPaper-root": {
          fontFamily: "'Poppins', sans-serif",
          borderRadius: "12px",
          boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
        },
      }}
    >
      <MenuItem onClick={handleMenuClose} sx={{ fontFamily: "'Poppins', sans-serif", py: 1.5 }}>
        <AccountCircle sx={{ mr: 2, color: "#2196f3" }} />
        Profile Settings
      </MenuItem>
      <MenuItem onClick={handleMenuClose} sx={{ fontFamily: "'Poppins', sans-serif", py: 1.5 }}>
        <Settings sx={{ mr: 2, color: "#ff9800" }} />
        Admin Settings
      </MenuItem>
      <Divider />
      <MenuItem onClick={handleLogout} sx={{ fontFamily: "'Poppins', sans-serif", py: 1.5, color: "#f44336" }}>
        <ExitToApp sx={{ mr: 2 }} />
        Logout
      </MenuItem>
    </Menu>
  )

  return (
    <AppBar
      position="static"
      elevation={0}
      sx={{
        bgcolor: "#1976d2",
        borderBottom: "1px solid rgba(255,255,255,0.1)",
        boxShadow: "0 1px 3px rgba(0,0,0,0.12)",
      }}
    >
      <Toolbar
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: { xs: 1, sm: 2, md: 3 },
          minHeight: "56px !important",
          height: "56px",
        }}
      >
        {/* Main navigation items in a single row */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            flexGrow: 1,
            overflowX: "auto",
            "&::-webkit-scrollbar": { display: "none" },
            scrollbarWidth: "none",
          }}
        >
          {/* Dashboard */}
          <AdminNavButton
            startIcon={<Dashboard sx={{ fontSize: 18 }} />}
            active={isTabActive(0)}
            onClick={() => handleTabClick(0)}
          >
            Dashboard
          </AdminNavButton>

          <Box ref={dropdownRefs.itemMaster} sx={{ position: "relative" }}>
            <AdminNavButton
              startIcon={<ShoppingCart sx={{ fontSize: 18 }} />}
              endIcon={<KeyboardArrowDown sx={{ fontSize: 16 }} />}
              active={isTabActive(1) || activeComponent === "NewItemForm" || activeComponent === "ManageItems"}
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                handleDropdownToggle("itemMaster")
              }}
            >
              Item Master
            </AdminNavButton>

            {renderCRUDDropdown("itemMaster", dropdownStates.itemMaster, dropdownRefs.itemMaster, [
              {
                label: "New Item",
                description: "Create new product",
                icon: <AddIcon sx={{ color: "#2196f3", fontSize: 18 }} />,
                componentName: "NewItemForm",
                tabIndex: 1,
                data: { type: "item" },
              },
              {
                label: "Manage Items",
                description: "View and edit products",
                icon: <ListIcon sx={{ color: "#4caf50", fontSize: 18 }} />,
                componentName: "ManageItems",
                tabIndex: 1,
                data: { type: "item" },
              },
            ])}
          </Box>

          <Box ref={dropdownRefs.categories} sx={{ position: "relative" }}>
            <AdminNavButton
              startIcon={<CategoryIcon sx={{ fontSize: 18 }} />}
              endIcon={<KeyboardArrowDown sx={{ fontSize: 16 }} />}
              active={isTabActive(2) || activeComponent === "CategoryManagement"}
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                handleDropdownToggle("categories")
              }}
            >
              Categories
            </AdminNavButton>

            {renderCRUDDropdown("categories", dropdownStates.categories, dropdownRefs.categories, [
              {
                label: "Manage Categories",
                description: "View and manage categories",
                icon: <ViewIcon sx={{ color: "#4caf50", fontSize: 18 }} />,
                componentName: "CategoryManagement",
                tabIndex: 2,
                data: { type: "category" },
              },
            ])}
          </Box>

          <Box ref={dropdownRefs.sales} sx={{ position: "relative" }}>
            <AdminNavButton
              startIcon={<SalesIcon sx={{ fontSize: 18 }} />}
              endIcon={<KeyboardArrowDown sx={{ fontSize: 16 }} />}
              active={
                isTabActive(3) || activeComponent === "OrdersManagement" || activeComponent === "InvoiceManagement"
              }
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                handleDropdownToggle("sales")
              }}
            >
              Sales
            </AdminNavButton>

            {renderCRUDDropdown("sales", dropdownStates.sales, dropdownRefs.sales, [
              {
                label: "Orders",
                description: "Customer orders management",
                icon: <ListAltIcon sx={{ color: "#2196f3", fontSize: 18 }} />,
                componentName: "OrdersManagement",
                tabIndex: 3,
                data: { type: "orders" },
              },
              {
                label: "Invoices",
                description: "Invoice management",
                icon: <ViewIcon sx={{ color: "#4caf50", fontSize: 18 }} />,
                componentName: "InvoiceManagement",
                tabIndex: 3,
                data: { type: "invoices" },
              },
            ])}
          </Box>

          <Box ref={dropdownRefs.grn} sx={{ position: "relative" }}>
            <AdminNavButton
              startIcon={<GRNIcon sx={{ fontSize: 18 }} />}
              endIcon={<KeyboardArrowDown sx={{ fontSize: 16 }} />}
              active={
                isTabActive(4) ||
                activeComponent === "PurchaseOrderManagement" ||
                activeComponent === "InventoryManagement"
              }
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                handleDropdownToggle("grn")
              }}
            >
              GRN
            </AdminNavButton>

            {renderCRUDDropdown("grn", dropdownStates.grn, dropdownRefs.grn, [
              {
                label: "Purchase Orders",
                description: "Manage purchase orders",
                icon: <AddIcon sx={{ color: "#2196f3", fontSize: 18 }} />,
                componentName: "PurchaseOrderManagement",
                tabIndex: 4,
                data: { type: "purchase-orders" },
              },
              {
                label: "GRN Goods Received",
                description: "Goods received notes",
                icon: <Inventory sx={{ color: "#4caf50", fontSize: 18 }} />,
                componentName: "InventoryManagement",
                tabIndex: 4,
                data: { type: "grn" },
              },
            ])}
          </Box>

          <Box ref={dropdownRefs.suppliers} sx={{ position: "relative" }}>
            <AdminNavButton
              startIcon={<SuppliersIcon sx={{ fontSize: 18 }} />}
              endIcon={<KeyboardArrowDown sx={{ fontSize: 16 }} />}
              active={isTabActive(5) || activeComponent === "SupplierManagement"}
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                handleDropdownToggle("suppliers")
              }}
            >
              Suppliers
            </AdminNavButton>

            {renderCRUDDropdown("suppliers", dropdownStates.suppliers, dropdownRefs.suppliers, [
              {
                label: "Manage Suppliers",
                description: "View and manage suppliers",
                icon: <ViewIcon sx={{ color: "#4caf50", fontSize: 18 }} />,
                componentName: "SupplierManagement",
                tabIndex: 5,
                data: { type: "supplier" },
              },
            ])}
          </Box>

          <Box ref={dropdownRefs.agents} sx={{ position: "relative" }}>
            <AdminNavButton
              startIcon={<People sx={{ fontSize: 18 }} />}
              endIcon={<KeyboardArrowDown sx={{ fontSize: 16 }} />}
              active={isTabActive(6) || activeComponent === "SalesAgentAdminPanel"}
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                handleDropdownToggle("agents")
              }}
            >
              Sales Agents
            </AdminNavButton>

            {renderCRUDDropdown("agents", dropdownStates.agents, dropdownRefs.agents, [
              {
                label: "Manage Agents",
                description: "View and manage sales agents",
                icon: <ViewIcon sx={{ color: "#4caf50", fontSize: 18 }} />,
                componentName: "SalesAgentAdminPanel",
                tabIndex: 6,
                data: { type: "agent" },
              },
            ])}
          </Box>

          {/* Customers Button */}
          <AdminNavButton
            startIcon={<People sx={{ fontSize: 18 }} />}
            active={isTabActive(7) || activeComponent === "CustomerManagement"}
            onClick={() => handleDirectComponentNavigation("CustomerManagement", 7, "customers")}
          >
            Customers
          </AdminNavButton>
        </Box>

        {/* Right side icons - Store and Profile only */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          {/* Store view icon */}
          <IconButton
            size="small"
            color="inherit"
            onClick={handleNavigateHome}
            title="Go to Customer Store"
            sx={{
              color: "rgba(255,255,255,0.8)",
              "&:hover": { color: "#ffffff", bgcolor: "rgba(255,255,255,0.1)" },
              borderRadius: "8px",
              p: 1,
            }}
          >
            <StoreIcon fontSize="small" />
          </IconButton>

          {/* Profile */}
          <IconButton
            size="small"
            edge="end"
            aria-label="account of current user"
            aria-controls={menuId}
            aria-haspopup="true"
            onClick={handleProfileMenuOpen}
            color="inherit"
            title={`Profile: ${currentUser?.username || "Admin"}`}
            sx={{
              color: "rgba(255,255,255,0.8)",
              "&:hover": { color: "#ffffff", bgcolor: "rgba(255,255,255,0.1)" },
              borderRadius: "8px",
              p: 0.5,
            }}
          >
            <Avatar
              sx={{
                width: 28,
                height: 28,
                bgcolor: "rgba(255,255,255,0.2)",
                color: "#ffffff",
                fontFamily: "'Poppins', sans-serif",
                fontWeight: 600,
                fontSize: "0.75rem",
                border: "1px solid rgba(255,255,255,0.3)",
              }}
            >
              {currentUser?.username?.charAt(0)?.toUpperCase() || "A"}
            </Avatar>
          </IconButton>
        </Box>
      </Toolbar>

      {/* Profile Menu */}
      {renderMenu}
    </AppBar>
  )
}

export default AdminNavigation
