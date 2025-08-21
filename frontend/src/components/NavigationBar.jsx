"use client"

import React, { useState, useRef, useEffect } from "react"
import {
  AppBar,
  Toolbar,
  Typography,
  InputBase,
  Box,
  IconButton,
  Badge,
  Container,
  Button,
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  Collapse,
  useMediaQuery,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton as MuiIconButton,
  Tooltip,
  Paper,
  Popper,
  Fade,
  TextField,
  InputAdornment,
  Divider,
  Avatar,
  Menu,
  MenuItem,
  ListItemIcon,
} from "@mui/material"
import {
  Menu as MenuIcon,
  Search as SearchIcon,
  ShoppingCart as ShoppingCartIcon,
  Person as PersonIcon,
  Favorite as FavoriteIcon,
  ExpandMore as ChevronDownIcon,
  ChevronRight as ChevronRightIcon,
  ExpandLess,
  Close as CloseIcon,
  Wallet as WalletIcon,
  Home as HomeIcon,
  Phone as PhoneIcon,
  Mail as MailIcon,
  AccountCircle,
  Settings,
  ExitToApp,
  Inbox,
  ShoppingBag,
  AdminPanelSettings,
} from "@mui/icons-material"
import { styled, alpha, useTheme } from "@mui/material/styles"
import { useNavigate, useLocation } from "react-router-dom"
import FirstCraftLogo from "../assets/images/FirstCraft-logo.png"
import RegistrationForm from "../pages/Registration/View/Index"
import LoginPage from "../pages/Login/View/Index"
// CHANGE: Import the category navigation hook from the correct location
import { useCategoryNavigation } from "../hooks/useApiData"

// Styled Components (keeping existing styles)
const Search = styled("div")(({ theme }) => ({
  position: "relative",
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  "&:hover": {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  marginRight: theme.spacing(2),
  marginLeft: 0,
  width: "auto",
  [theme.breakpoints.down("sm")]: {
    marginRight: theme.spacing(1),
  },
  [theme.breakpoints.up("sm")]: {
    marginLeft: theme.spacing(3),
    width: "auto",
  },
}))

const SearchIconWrapper = styled("div")(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: "100%",
  position: "absolute",
  pointerEvents: "none",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: theme.palette.grey[500],
  [theme.breakpoints.down("sm")]: {
    padding: theme.spacing(0, 1),
  },
}))

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: "inherit",
  "& .MuiInputBase-input": {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create("width"),
    width: "20ch",
    [theme.breakpoints.down("sm")]: {
      width: "15ch",
      paddingLeft: `calc(1em + ${theme.spacing(3)})`,
      fontSize: "0.875rem",
    },
    [theme.breakpoints.up("md")]: {
      width: "20ch",
    },
  },
}))

const NavButton = styled(Button)(({ theme }) => ({
  color: theme.palette.primary.contrastText,
  textTransform: "none",
  padding: "4px 8px",
  fontSize: "12px",
  minWidth: "unset",
  whiteSpace: "nowrap",
  "&:hover": {
    backgroundColor: alpha(theme.palette.primary.contrastText, 0.15),
  },
}))

const RegisterButton = styled(Button)(({ theme }) => ({
  color: theme.palette.primary.contrastText,
  backgroundColor: alpha(theme.palette.primary.contrastText, 0.2),
  textTransform: "none",
  padding: "4px 12px",
  fontSize: "12px",
  fontWeight: "bold",
  marginLeft: theme.spacing(1),
  whiteSpace: "nowrap",
  "&:hover": {
    backgroundColor: alpha(theme.palette.primary.contrastText, 0.3),
  },
  [theme.breakpoints.down("sm")]: {
    marginLeft: theme.spacing(0.5),
    padding: "4px 8px",
  },
}))

const WalletButton = styled(Button)(({ theme }) => ({
  color: theme.palette.primary.contrastText,
  backgroundColor: alpha(theme.palette.primary.contrastText, 0.2),
  textTransform: "none",
  padding: "4px 12px",
  fontSize: "12px",
  fontWeight: "bold",
  marginLeft: theme.spacing(1),
  whiteSpace: "nowrap",
  "&:hover": {
    backgroundColor: alpha(theme.palette.primary.contrastText, 0.3),
  },
  [theme.breakpoints.down("sm")]: {
    marginLeft: theme.spacing(0.5),
    padding: "4px 8px",
  },
}))

const DropdownContent = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(1),
  backgroundColor: theme.palette.background.paper,
  boxShadow: theme.shadows[4],
  borderRadius: theme.shape.borderRadius,
  minWidth: 180,
  zIndex: 1500,
}))

const DropdownItem = styled("div")(({ theme }) => ({
  padding: theme.spacing(1, 2),
  cursor: "pointer",
  "&:hover": {
    backgroundColor: theme.palette.action.hover,
  },
}))

const NavigationBar = ({ isLoggedIn, currentUser, onLogout, isAdminPage }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"))
  const isTablet = useMediaQuery(theme.breakpoints.down("md"))

  // Refs for menu buttons
  const menuRefs = useRef({})

  const [drawerOpen, setDrawerOpen] = useState(false)
  const [drawerSubmenus, setDrawerSubmenus] = useState({})
  const [registrationOpen, setRegistrationOpen] = useState(false)
  const [loginOpen, setLoginOpen] = useState(false)
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false)

  // State for user menu
  const [userMenuAnchorEl, setUserMenuAnchorEl] = useState(null)
  const userMenuOpen = Boolean(userMenuAnchorEl)

  // State for cart items count
  const [cartItemsCount, setCartItemsCount] = useState(0)

  // Get cart items count from localStorage
  useEffect(() => {
    const storedCartItems = JSON.parse(localStorage.getItem("cartItems")) || []
    setCartItemsCount(storedCartItems.length)
  }, [])

  // State for tooltips and dropdowns
  const [activeTooltip, setActiveTooltip] = useState("")
  const [activeDropdown, setActiveDropdown] = useState("")

  // Add dynamic menu loading
  // CHANGE: Use the enhanced category navigation hook instead of generic navigation
  const { data: navigationData, loading: menusLoading, error: menusError } = useCategoryNavigation()

  // CHANGE: Enhanced error handling for menu loading
  useEffect(() => {
    if (menusError) {
      console.warn("Navigation menu loading error:", menusError)
    }
  }, [menusError])

  // CHANGE: Replace static fallback menus with dynamic API integration
  // OLD: Static fallback menus
  // NEW: Dynamic menus from API with better error handling
  const fallbackMenus = {
    "Office Essentials": ["Paper Products", "Writing Instruments", "Binders & Filing"],
    "Toners & Inks": ["HP Toners", "Canon Inks", "Brother Cartridges"],
    "Office Machines": ["Printers", "Shredders", "Laminators"],
  }

  // CHANGE: Enhanced menu processing to handle API response structure
  // Process navigation data to create menu structure from categories
  const processNavigationMenus = (categoriesData) => {
    if (!categoriesData?.categories) return fallbackMenus

    const processedMenus = {}

    categoriesData.categories.forEach((category) => {
      if (category.subCategories && category.subCategories.length > 0) {
        // Use main category as menu title and subcategories as menu items
        processedMenus[category.name] = category.subCategories
          .filter((sub) => sub.isActive !== false) // Only include active subcategories
          .map((sub) => sub.name)
      } else {
        // If no subcategories, create a single-item menu
        processedMenus[category.name] = [category.name]
      }
    })

    return Object.keys(processedMenus).length > 0 ? processedMenus : fallbackMenus
  }

  // CHANGE: Use processed menus instead of raw API data
  const menus = navigationData?.categories ? processNavigationMenus(navigationData) : fallbackMenus

  // Check if user is admin
  const isAdmin = currentUser?.isAdmin || currentUser?.email?.toLowerCase().includes("admin")

  // Handle dropdown functions
  const handleDropdownOpen = (menuName) => setActiveDropdown(menuName)
  const handleDropdownClose = () => setActiveDropdown("")
  const handleTooltipOpen = (tooltipName) => setActiveTooltip(tooltipName)
  const handleTooltipClose = () => setActiveTooltip("")

  const toggleDrawer = () => setDrawerOpen((prev) => !prev)
  const toggleSubmenu = (key) => {
    setDrawerSubmenus((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const handleOpenRegistration = () => {
    setRegistrationOpen(true)
    setLoginOpen(false)
  }

  const handleCloseRegistration = () => setRegistrationOpen(false)

  const handleOpenLogin = () => {
    setLoginOpen(true)
    setRegistrationOpen(false)
  }

  const handleCloseLogin = () => setLoginOpen(false)

  const toggleMobileSearch = () => setMobileSearchOpen((prev) => !prev)

  // CHANGE: Enhanced dropdown navigation with proper routing and error handling
  const handleDropdownItemClick = (item, categoryName) => {
    console.log(`Navigating to ${categoryName} -> ${item}`)
    try {
      // Navigate to category page with proper slug
      const categorySlug = item
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "")
      navigate(`/category/${categorySlug}`)
      handleDropdownClose()
    } catch (error) {
      console.error("Navigation error:", error)
      // Fallback navigation
      navigate("/")
    }
  }

  // CHANGE: Add mobile drawer navigation with proper routing
  const handleDrawerItemClick = (item, categoryName) => {
    try {
      const categorySlug = item
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "")
      navigate(`/category/${categorySlug}`)
      setDrawerOpen(false) // Close drawer after navigation
    } catch (error) {
      console.error("Mobile navigation error:", error)
      navigate("/")
    }
  }

  const setMenuRef = (menuName, element) => {
    menuRefs.current[menuName] = element
  }

  const handleUserMenuOpen = (event) => setUserMenuAnchorEl(event.currentTarget)
  const handleUserMenuClose = () => setUserMenuAnchorEl(null)

  const handleLogout = () => {
    handleUserMenuClose()
    if (onLogout) onLogout()
    navigate("/")
  }

  const handleLoginSuccess = (userData) => {
    handleCloseLogin()
    // The login component will handle navigation
  }

  return (
    <>
      {isAdminPage ? null : (
        <AppBar
          position="static"
          sx={{
            boxShadow: 0,
            backgroundColor: theme.palette.background.paper,
            color: theme.palette.text.primary,
            overflowX: "hidden",
            zIndex: 1200,
          }}
        >
          <Container
            maxWidth="xl"
            sx={{
              px: { xs: 1, sm: 2 },
              overflowX: "hidden",
            }}
          >
            <Toolbar
              disableGutters
              sx={{
                justifyContent: "space-between",
                flexDirection: { xs: "row", sm: "row" },
                alignItems: "center",
                flexWrap: "wrap",
                minHeight: { xs: "56px" },
                py: { xs: 1, sm: 1 },
                gap: { xs: 1, sm: 0 },
              }}
            >
              {/* Logo and Mobile Menu Button */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  width: { xs: "100%", sm: "auto" },
                  mb: { xs: 0, sm: 0 },
                }}
              >
                {/* Logo */}
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    cursor: "pointer",
                  }}
                  onClick={() => navigate("/")}
                >
                  <Typography variant="h6" noWrap sx={{ fontWeight: 700, display: "flex", alignItems: "center" }}>
                    <Box
                      component="img"
                      src={FirstCraftLogo}
                      alt="FirstCraft Logo"
                      sx={{
                        height: { xs: "70px", sm: "70px" },
                        maxWidth: "100%",
                        objectFit: "contain",
                      }}
                    />
                  </Typography>
                </Box>

                {/* Mobile Menu Button */}
                {isMobile && (
                  <IconButton sx={{ color: theme.palette.primary.main }} onClick={toggleDrawer} aria-label="menu">
                    <MenuIcon />
                  </IconButton>
                )}
              </Box>

              {/* Mobile Search Bar - Expandable */}
              {isMobile && mobileSearchOpen && (
                <Box
                  sx={{
                    width: "100%",
                    py: 1,
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <TextField
                    fullWidth
                    size="small"
                    placeholder={isAdminPage ? "Search admin..." : "Search products..."}
                    variant="outlined"
                    autoFocus
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon fontSize="small" />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton size="small" onClick={toggleMobileSearch}>
                            <CloseIcon fontSize="small" />
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "4px",
                      },
                    }}
                  />
                </Box>
              )}

              {/* Right Side - Desktop and Mobile */}
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "flex-end",
                  gap: { xs: 0.5, sm: 0.5 },
                  backgroundColor: theme.palette.primary.main,
                  color: theme.palette.primary.contrastText,
                  px: { xs: 1, sm: 1 },
                  py: { xs: 1, sm: 1 },
                  borderRadius: 1,
                  width: isMobile ? "100%" : "auto",
                  mt: isMobile && mobileSearchOpen ? 1 : 0,
                }}
              >
                {/* Search bar - desktop only */}
                {!isMobile && (
                  <Search>
                    <SearchIconWrapper>
                      <SearchIcon />
                    </SearchIconWrapper>
                    <StyledInputBase
                      placeholder={isAdminPage ? "Search admin..." : "Search..."}
                      inputProps={{ "aria-label": "search" }}
                    />
                  </Search>
                )}

                {/* Mobile Search Toggle Button */}
                {isMobile && !mobileSearchOpen && (
                  <IconButton
                    size="small"
                    sx={{ color: theme.palette.primary.contrastText }}
                    onClick={toggleMobileSearch}
                  >
                    <SearchIcon fontSize="small" />
                  </IconButton>
                )}

                {/* Action buttons row */}
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "flex-end",
                  }}
                >
                  {/* Wishlist Icon with Tooltip - Hide on admin page */}
                  {!isAdminPage && (
                    <Tooltip title="My Wishlist" arrow>
                      <IconButton
                        size={isMobile ? "small" : "medium"}
                        sx={{ color: theme.palette.primary.contrastText }}
                        onClick={() => navigate("/wishlist")}
                        onMouseEnter={() => handleTooltipOpen("wishlist")}
                        onMouseLeave={handleTooltipClose}
                      >
                        <FavoriteIcon fontSize={isMobile ? "small" : "medium"} />
                      </IconButton>
                    </Tooltip>
                  )}

                  {/* Profile Icon with Tooltip */}
                  <Tooltip title={isLoggedIn ? "My Account" : "Sign In"} arrow>
                    <IconButton
                      size={isMobile ? "small" : "medium"}
                      sx={{ color: theme.palette.primary.contrastText }}
                      onClick={isLoggedIn ? handleUserMenuOpen : handleOpenLogin}
                      onMouseEnter={() => handleTooltipOpen("profile")}
                      onMouseLeave={handleTooltipClose}
                    >
                      {isLoggedIn ? (
                        <Avatar
                          sx={{
                            width: isMobile ? 24 : 32,
                            height: isMobile ? 24 : 32,
                            bgcolor: theme.palette.secondary.main,
                            fontSize: isMobile ? "0.75rem" : "1rem",
                          }}
                        >
                          {currentUser?.first_name?.charAt(0) || (
                            <PersonIcon fontSize={isMobile ? "small" : "medium"} />
                          )}
                        </Avatar>
                      ) : (
                        <PersonIcon fontSize={isMobile ? "small" : "medium"} />
                      )}
                    </IconButton>
                  </Tooltip>

                  {/* Cart Icon with Tooltip - Hide on admin page */}
                  {!isAdminPage && (
                    <Tooltip title="My Cart" arrow>
                      <IconButton
                        size={isMobile ? "small" : "medium"}
                        sx={{ color: theme.palette.primary.contrastText }}
                        onClick={() => navigate("/cart")}
                        onMouseEnter={() => handleTooltipOpen("cart")}
                        onMouseLeave={handleTooltipClose}
                      >
                        <Badge badgeContent={cartItemsCount} color="error">
                          <ShoppingCartIcon fontSize={isMobile ? "small" : "medium"} />
                        </Badge>
                      </IconButton>
                    </Tooltip>
                  )}

                  {/* E-Wallet Button - Desktop only, hide on admin page */}
                  {!isTablet && !isMobile && !isAdminPage && (
                    <WalletButton startIcon={<WalletIcon />} onClick={() => navigate("/wallet")}>
                      E-Wallet
                    </WalletButton>
                  )}

                  {/* Register/Login Button - Desktop only, hide on admin page */}
                  {!isMobile && !isLoggedIn && !isAdminPage && (
                    <RegisterButton onClick={handleOpenRegistration}>Register</RegisterButton>
                  )}
                </Box>
              </Box>
            </Toolbar>
          </Container>

          {/* Bottom Toolbar - ONLY show on customer pages, COMPLETELY HIDDEN on admin pages */}
          {!isMobile && !isAdminPage && (
            <Box
              sx={{
                bgcolor: theme.palette.primary.main,
                width: "100%",
                color: theme.palette.primary.contrastText,
                overflowX: "auto",
                "&::-webkit-scrollbar": { height: "4px" },
                "&::-webkit-scrollbar-thumb": { backgroundColor: "rgba(255,255,255,0.2)", borderRadius: "4px" },
                position: "relative",
                zIndex: 1,
              }}
            >
              <Container maxWidth="xl">
                <Toolbar
                  disableGutters
                  sx={{
                    minHeight: "40px",
                    overflowX: "auto",
                    display: "flex",
                    flexWrap: "nowrap",
                  }}
                >
                  {/* Regular Customer Navigation Links ONLY */}
                  <NavButton startIcon={<HomeIcon fontSize="small" />} onClick={() => navigate("/")}>
                    Home
                  </NavButton>

                  <NavButton>Special Offer</NavButton>

                  {/* Menu items with hover effect - now dynamic */}
                  {Object.keys(menus).map((menuName) => (
                    <Box
                      key={menuName}
                      ref={(el) => setMenuRef(menuName, el)}
                      sx={{ position: "relative" }}
                      onMouseEnter={() => handleDropdownOpen(menuName)}
                      onMouseLeave={handleDropdownClose}
                    >
                      <NavButton endIcon={<ChevronDownIcon fontSize="small" />}>{menuName}</NavButton>

                      {/* Dropdown content */}
                      <Popper
                        open={activeDropdown === menuName}
                        anchorEl={menuRefs.current[menuName]}
                        placement="bottom-start"
                        transition
                        disablePortal={false}
                        style={{ zIndex: 1400 }}
                        modifiers={[
                          {
                            name: "offset",
                            options: {
                              offset: [0, 8],
                            },
                          },
                        ]}
                      >
                        {({ TransitionProps }) => (
                          <Fade {...TransitionProps} timeout={200}>
                            <DropdownContent
                              onMouseEnter={() => handleDropdownOpen(menuName)}
                              onMouseLeave={handleDropdownClose}
                            >
                              {menus[menuName].map((item, index) => (
                                <DropdownItem key={index} onClick={() => handleDropdownItemClick(item, menuName)}>
                                  {item}
                                </DropdownItem>
                              ))}
                            </DropdownContent>
                          </Fade>
                        )}
                      </Popper>
                    </Box>
                  ))}

                  <NavButton>School Supplies</NavButton>
                  <NavButton>Stapling & Punching</NavButton>
                  <NavButton>IT Accessories</NavButton>
                  <NavButton>Office Furniture</NavButton>
                  <NavButton>More</NavButton>
                  <NavButton>ALL Brands</NavButton>
                  <NavButton>Contact Us</NavButton>

                  {/* E-Wallet Button for tablet view */}
                  {isTablet && !isMobile && (
                    <WalletButton startIcon={<WalletIcon />} onClick={() => navigate("/wallet")}>
                      E-Wallet
                    </WalletButton>
                  )}
                </Toolbar>
              </Container>
            </Box>
          )}
        </AppBar>
      )}

      {/* Mobile Drawer */}
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={toggleDrawer}
        sx={{
          "& .MuiDrawer-paper": {
            width: { xs: "85%", sm: 280 },
            maxWidth: "100%",
          },
        }}
      >
        <Box sx={{ width: "100%" }} role="presentation">
          {/* User Profile Section */}
          <Box
            sx={{
              p: 2,
              bgcolor: theme.palette.primary.main,
              color: "white",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            {isLoggedIn ? (
              <>
                <Avatar
                  sx={{
                    width: 64,
                    height: 64,
                    mb: 1,
                    bgcolor: theme.palette.secondary.main,
                  }}
                >
                  {currentUser?.first_name?.charAt(0) || <PersonIcon fontSize="large" />}
                </Avatar>
                <Typography variant="subtitle1" fontWeight="bold">
                  Hello, {currentUser?.first_name || "User"}
                </Typography>
                {isAdmin && (
                  <Typography variant="caption" sx={{ color: "yellow", fontWeight: "bold" }}>
                    Administrator
                  </Typography>
                )}
                <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
                  <Button
                    variant="outlined"
                    size="small"
                    sx={{
                      color: "white",
                      borderColor: "white",
                      "&:hover": { borderColor: "white", bgcolor: "rgba(255,255,255,0.1)" },
                    }}
                    onClick={() => {
                      toggleDrawer()
                      navigate(isAdmin ? "/admin" : "/account")
                    }}
                  >
                    {isAdmin ? "Admin Panel" : "My Account"}
                  </Button>
                  <Button
                    variant="contained"
                    size="small"
                    sx={{
                      bgcolor: "white",
                      color: theme.palette.primary.main,
                      "&:hover": { bgcolor: "rgba(255,255,255,0.9)" },
                    }}
                    onClick={() => {
                      toggleDrawer()
                      handleLogout()
                    }}
                  >
                    Logout
                  </Button>
                </Box>
              </>
            ) : (
              <>
                <Avatar
                  sx={{
                    width: 64,
                    height: 64,
                    mb: 1,
                    bgcolor: theme.palette.primary.light,
                  }}
                >
                  <PersonIcon fontSize="large" />
                </Avatar>
                <Typography variant="subtitle1" fontWeight="bold">
                  Welcome
                </Typography>
                <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
                  <Button
                    variant="outlined"
                    size="small"
                    sx={{
                      color: "white",
                      borderColor: "white",
                      "&:hover": { borderColor: "white", bgcolor: "rgba(255,255,255,0.1)" },
                    }}
                    onClick={() => {
                      toggleDrawer()
                      handleOpenLogin()
                    }}
                  >
                    Sign In
                  </Button>
                  <Button
                    variant="contained"
                    size="small"
                    sx={{
                      bgcolor: "white",
                      color: theme.palette.primary.main,
                      "&:hover": { bgcolor: "rgba(255,255,255,0.9)" },
                    }}
                    onClick={() => {
                      toggleDrawer()
                      handleOpenRegistration()
                    }}
                  >
                    Register
                  </Button>
                </Box>
              </>
            )}
          </Box>

          {/* Search in drawer */}
          <Box sx={{ p: 2 }}>
            <TextField
              fullWidth
              size="small"
              placeholder={isAdminPage ? "Search admin..." : "Search..."}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          {/* Quick Actions */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-around",
              p: 1,
              borderBottom: "1px solid #e0e0e0",
              borderTop: "1px solid #e0e0e0",
            }}
          >
            {!isAdminPage && (
              <>
                <IconButton
                  color="primary"
                  onClick={() => {
                    toggleDrawer()
                    navigate("/cart")
                  }}
                >
                  <Badge badgeContent={cartItemsCount} color="error">
                    <ShoppingCartIcon />
                  </Badge>
                </IconButton>
                <IconButton
                  color="primary"
                  onClick={() => {
                    toggleDrawer()
                    navigate("/wishlist")
                  }}
                >
                  <FavoriteIcon />
                </IconButton>
              </>
            )}
            <IconButton
              color="primary"
              onClick={() => {
                toggleDrawer()
                navigate("/wallet")
              }}
            >
              <WalletIcon />
            </IconButton>
          </Box>

          <List>
            {/* Home option */}
            <ListItem disablePadding>
              <ListItemButton
                onClick={() => {
                  toggleDrawer()
                  navigate("/")
                }}
              >
                <ListItemText
                  primary={
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <HomeIcon fontSize="small" color="primary" />
                      <span>Home</span>
                    </Box>
                  }
                />
              </ListItemButton>
            </ListItem>

            {isLoggedIn && (
              <ListItem disablePadding>
                <ListItemButton
                  onClick={() => {
                    toggleDrawer()
                    navigate(isAdmin ? "/admin" : "/account")
                  }}
                >
                  <ListItemText
                    primary={
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        {isAdmin ? (
                          <AdminPanelSettings fontSize="small" color="primary" />
                        ) : (
                          <AccountCircle fontSize="small" color="primary" />
                        )}
                        <span>{isAdmin ? "Admin Panel" : "My Account"}</span>
                      </Box>
                    }
                  />
                </ListItemButton>
              </ListItem>
            )}

            {/* Show only customer menu items on non-admin pages */}
            {!isAdminPage && (
              <>
                <ListItem disablePadding>
                  <ListItemButton>
                    <ListItemText primary="Special Offer" />
                  </ListItemButton>
                </ListItem>

                {Object.keys(menus).map((menuName) => (
                  <React.Fragment key={menuName}>
                    <ListItem disablePadding>
                      <ListItemButton onClick={() => toggleSubmenu(menuName)}>
                        <ListItemText primary={menuName} />
                        {drawerSubmenus[menuName] ? <ExpandLess /> : <ChevronRightIcon />}
                      </ListItemButton>
                    </ListItem>
                    <Collapse in={drawerSubmenus[menuName]} timeout="auto" unmountOnExit>
                      <List component="div" disablePadding>
                        {menus[menuName].map((subItem, index) => (
                          <ListItemButton
                            key={index}
                            sx={{ pl: 4 }}
                            onClick={() => handleDrawerItemClick(subItem, menuName)}
                          >
                            <ListItemText primary={subItem} />
                          </ListItemButton>
                        ))}
                      </List>
                    </Collapse>
                  </React.Fragment>
                ))}

                {[
                  "School Supplies",
                  "Stapling & Punching",
                  "IT Accessories",
                  "Office Furniture",
                  "More",
                  "ALL Brands",
                  "Contact Us",
                ].map((item, index) => (
                  <ListItem disablePadding key={index}>
                    <ListItemButton>
                      <ListItemText primary={item} />
                    </ListItemButton>
                  </ListItem>
                ))}
              </>
            )}
          </List>

          <Divider />

          {/* Contact Information */}
          <Box sx={{ p: 2 }}>
            <Typography variant="subtitle2" color="primary" gutterBottom>
              Contact Us
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
              <PhoneIcon fontSize="small" color="primary" />
              <Typography variant="body2">+254 722517263</Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <MailIcon fontSize="small" color="primary" />
              <Typography variant="body2">info@firstcraft.com</Typography>
            </Box>
          </Box>
        </Box>
      </Drawer>

      {/* User Menu */}
      <Menu
        anchorEl={userMenuAnchorEl}
        open={userMenuOpen}
        onClose={handleUserMenuClose}
        PaperProps={{
          elevation: 3,
          sx: { minWidth: 200 },
        }}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      >
        <MenuItem
          onClick={() => {
            handleUserMenuClose()
            navigate(isAdmin ? "/admin" : "/account")
          }}
        >
          <ListItemIcon>
            {isAdmin ? <AdminPanelSettings fontSize="small" /> : <AccountCircle fontSize="small" />}
          </ListItemIcon>
          {isAdmin ? "Admin Panel" : "My Account"}
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleUserMenuClose()
            navigate("/wallet")
          }}
        >
          <ListItemIcon>
            <WalletIcon fontSize="small" />
          </ListItemIcon>
          E-Wallet
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleUserMenuClose()
            navigate("/cart")
          }}
        >
          <ListItemIcon>
            <ShoppingBag fontSize="small" />
          </ListItemIcon>
          My Orders
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleUserMenuClose()
            navigate("/account")
          }}
        >
          <ListItemIcon>
            <Inbox fontSize="small" />
          </ListItemIcon>
          Inbox
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleUserMenuClose()
            navigate("/account")
          }}
        >
          <ListItemIcon>
            <Settings fontSize="small" />
          </ListItemIcon>
          Settings
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <ExitToApp fontSize="small" />
          </ListItemIcon>
          Logout
        </MenuItem>
      </Menu>

      {/* Registration Form Dialog */}
      <Dialog
        open={registrationOpen}
        onClose={handleCloseRegistration}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: "8px",
            maxHeight: "90vh",
            width: { xs: "95%", sm: "90%", md: "80%" },
            margin: { xs: "10px", sm: "auto" },
          },
        }}
      >
        <DialogTitle sx={{ m: 0, p: 2, bgcolor: theme.palette.primary.main, color: "white" }}>
          Registration
          <MuiIconButton
            aria-label="close"
            onClick={handleCloseRegistration}
            sx={{
              position: "absolute",
              right: 8,
              top: 8,
              color: "white",
            }}
          >
            <CloseIcon />
          </MuiIconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ p: 0, bgcolor: "#f5f5f5", overflowX: "hidden" }}>
          <RegistrationForm />
        </DialogContent>
      </Dialog>

      {/* Login Dialog */}
      <Dialog
        open={loginOpen}
        onClose={handleCloseLogin}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: "8px",
            maxHeight: "90vh",
            width: { xs: "95%", sm: "90%", md: "500px" },
            margin: { xs: "10px", sm: "auto" },
          },
        }}
      >
        <DialogTitle sx={{ m: 0, p: 2, bgcolor: theme.palette.primary.main, color: "white" }}>
          Sign In
          <MuiIconButton
            aria-label="close"
            onClick={handleCloseLogin}
            sx={{
              position: "absolute",
              right: 8,
              top: 8,
              color: "white",
            }}
          >
            <CloseIcon />
          </MuiIconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ p: 0, bgcolor: "#f5f5f5", overflowX: "hidden" }}>
          <LoginPage onLogin={handleLoginSuccess} />
        </DialogContent>
        <Box sx={{ p: 2, textAlign: "center" }}>
          <Typography variant="body2">
            Don't have an account?{" "}
            <Button
              color="primary"
              onClick={() => {
                handleCloseLogin()
                handleOpenRegistration()
              }}
            >
              Register
            </Button>
          </Typography>
        </Box>
      </Dialog>
    </>
  )
}

export default NavigationBar
