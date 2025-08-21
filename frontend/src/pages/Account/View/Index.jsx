"use client"

import React, { useState, useEffect } from "react"
import {
  Box,
  Container,
  Typography,
  Paper,
  Tabs,
  Tab,
  Avatar,
  Button,
  TextField,
  Grid,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Badge,
  useTheme,
  useMediaQuery,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  Snackbar,
  Switch,
  FormControlLabel,
  FormGroup,
  Pagination,
  IconButton,
  Menu,
  MenuItem,
} from "@mui/material"
import {
  Person,
  Edit,
  ShoppingBag,
  Inbox,
  Settings,
  PhotoCamera,
  Notifications,
  CheckCircle,
  Schedule,
  Delete,
  DeleteForever,
  Save,
  Cancel,
  Visibility,
  Download,
  MoreVert,
  Help,
  Logout,
} from "@mui/icons-material"
import { useNavigate } from "react-router-dom"
import { usersAPI, ordersAPI, authAPI, uploadAPI } from "../../../services/interceptor.js"

const AccountPage = () => {
  const theme = useTheme()
  const is_mobile = useMediaQuery(theme.breakpoints.down("sm"))
  const navigate = useNavigate()

  // State for active tab
  const [active_tab, setActiveTab] = useState(0)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // State for user data
  const [user_data, setUserData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone_number: "",
    avatar_url: null,
    date_joined: "",
    last_login: "",
    email_verified: true,
    phone_verified: true,
  })

  // State for orders
  const [orders, setOrders] = useState([])
  const [orders_loading, setOrdersLoading] = useState(false)
  const [orders_pagination, setOrdersPagination] = useState({
    current_page: 1,
    total_pages: 1,
    total_count: 0,
    per_page: 10,
  })

  // State for messages/notifications
  const [messages, setMessages] = useState([])
  const [unread_count, setUnreadCount] = useState(0)
  const [messages_loading, setMessagesLoading] = useState(false)
  const [messages_pagination, setMessagesPagination] = useState({
    current_page: 1,
    total_pages: 1,
    total_count: 0,
    per_page: 10,
  })

  // State for password change
  const [password_data, setPasswordData] = useState({
    current_password: "",
    new_password: "",
    new_password_confirmation: "",
  })

  // State for privacy settings
  const [privacy_settings, setPrivacySettings] = useState({
    profile_visibility: "private",
    data_sharing: false,
    analytics_tracking: true,
    marketing_communications: false,
  })

  // State for edit mode
  const [edit_mode, setEditMode] = useState(false)

  // State for dialogs
  const [profile_picture_dialog, setProfilePictureDialog] = useState(false)
  const [remove_profile_dialog, setRemoveProfileDialog] = useState(false)
  const [delete_account_dialog, setDeleteAccountDialog] = useState(false)
  const [uploading_avatar, setUploadingAvatar] = useState(false)

  // State for notifications
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "success",
  })

  // State for menu
  const [anchor_el, setAnchorEl] = useState(null)
  const [selected_order, setSelectedOrder] = useState(null)

  // State for delete account confirmation
  const [delete_confirmation, setDeleteConfirmation] = useState("")

  // Load user profile on component mount
  useEffect(() => {
    load_user_profile()
  }, [])

  // Load data based on active tab
  useEffect(() => {
    switch (active_tab) {
      case 1:
        load_user_orders()
        break
      case 2:
        load_user_messages()
        break
    }
  }, [active_tab])

  const load_user_profile = async () => {
    try {
      setLoading(true)
      const response = await usersAPI.getProfile()

      if (response.data.success) {
        const profile = response.data.data
        setUserData({
          first_name: profile.first_name || "",
          last_name: profile.last_name || "",
          email: profile.email || "",
          phone_number: profile.phone_number || "",
          avatar_url: profile.avatar_url
            ? `${import.meta.env.VITE_API_URL || "http://localhost:3000"}/uploads/${profile.avatar_url}`
            : null,
          date_joined: profile.created_at || "",
          last_login: profile.last_login || "",
          email_verified: profile.email_verified || false,
          phone_verified: profile.phone_verified || false,
        })
      }
    } catch (error) {
      console.error("Error loading user profile:", error)
      show_notification("Failed to load profile data", "error")
    } finally {
      setLoading(false)
    }
  }

  const load_user_orders = async (page = 1) => {
    try {
      setOrdersLoading(true)
      const response = await ordersAPI.getMyOrders({
        page,
        per_page: orders_pagination.per_page,
        sort_by: "created_at",
        sort_order: "desc",
      })

      if (response.data.success) {
        const { data: orders_data, pagination } = response.data.data
        setOrders(orders_data || [])
        setOrdersPagination(
          pagination || {
            current_page: 1,
            total_pages: 1,
            total_count: 0,
            per_page: 10,
          },
        )
      }
    } catch (error) {
      console.error("Error loading orders:", error)
      show_notification("Failed to load orders", "error")
      setOrders([])
    } finally {
      setOrdersLoading(false)
    }
  }

  const load_user_messages = async (page = 1) => {
    try {
      setMessagesLoading(true)
      // Since we don't have a messages API yet, we'll simulate it
      // In production, this would be: await messages_api.get_user_messages({page, per_page: 10})

      // For now, set empty state
      setMessages([])
      setUnreadCount(0)
      setMessagesPagination({
        current_page: 1,
        total_pages: 1,
        total_count: 0,
        per_page: 10,
      })
    } catch (error) {
      console.error("Error loading messages:", error)
      show_notification("Failed to load messages", "error")
    } finally {
      setMessagesLoading(false)
    }
  }

  const show_notification = (message, severity = "success") => {
    setNotification({
      open: true,
      message,
      severity,
    })
  }

  const handle_notification_close = () => {
    setNotification((prev) => ({ ...prev, open: false }))
  }

  const handle_tab_change = (event, new_value) => {
    setActiveTab(new_value)
  }

  const handle_user_data_change = (e) => {
    const { name, value } = e.target
    setUserData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handle_password_data_change = (e) => {
    const { name, value } = e.target
    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handle_privacy_setting_change = (setting) => (event) => {
    setPrivacySettings((prev) => ({
      ...prev,
      [setting]: event.target.checked,
    }))
  }

  const handle_profile_picture_change = async (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        show_notification("File size must be less than 5MB", "error")
        return
      }

      // Validate file type
      if (!file.type.startsWith("image/")) {
        show_notification("Please select a valid image file", "error")
        return
      }

      try {
        setUploadingAvatar(true)
        const response = await uploadAPI.uploadFile(file, "profiles")

        if (response.data.success) {
          setUserData((prev) => ({
            ...prev,
            avatar_url: `${import.meta.env.VITE_API_URL || "http://localhost:3000"}/uploads/${response.data.data.avatar_url}`,
          }))
          setProfilePictureDialog(false)
          show_notification("Profile picture updated successfully!")
        }
      } catch (error) {
        console.error("Error uploading avatar:", error)
        show_notification("Failed to upload profile picture", "error")
      } finally {
        setUploadingAvatar(false)
      }
    }
  }

  const handle_remove_profile_picture = async () => {
    try {
      const response = await uploadAPI.removeProfilePicture()

      if (response.data.success) {
        setUserData((prev) => ({
          ...prev,
          avatar_url: null,
        }))
        setRemoveProfileDialog(false)
        show_notification("Profile picture removed successfully!")
      }
    } catch (error) {
      console.error("Error removing avatar:", error)
      show_notification("Failed to remove profile picture", "error")
    }
  }

  const handle_save_profile = async () => {
    try {
      setSaving(true)
      const response = await usersAPI.updateProfile(user_data)

      if (response.data.success) {
        setEditMode(false)
        show_notification("Profile updated successfully!")
      }
    } catch (error) {
      console.error("Error updating profile:", error)
      const error_message = error.response?.data?.message || "Failed to update profile"
      show_notification(error_message, "error")
    } finally {
      setSaving(false)
    }
  }

  const handle_password_change = async () => {
    // Validate passwords
    if (password_data.new_password !== password_data.new_password_confirmation) {
      show_notification("New passwords do not match!", "error")
      return
    }

    if (password_data.new_password.length < 8) {
      show_notification("Password must be at least 8 characters long", "error")
      return
    }

    try {
      setSaving(true)
      const response = await authAPI.update_password(password_data)

      if (response.data.success) {
        setPasswordData({
          current_password: "",
          new_password: "",
          new_password_confirmation: "",
        })
        show_notification("Password changed successfully!")
      }
    } catch (error) {
      console.error("Error changing password:", error)
      const error_message = error.response?.data?.message || "Failed to change password"
      show_notification(error_message, "error")
    } finally {
      setSaving(false)
    }
  }

  const handle_order_menu_open = (event, order) => {
    setAnchorEl(event.currentTarget)
    setSelectedOrder(order)
  }

  const handle_order_menu_close = () => {
    setAnchorEl(null)
    setSelectedOrder(null)
  }

  const handle_view_order = () => {
    if (selected_order) {
      navigate(`/order-details/${selected_order.id}`)
    }
    handle_order_menu_close()
  }

  const handle_download_invoice = async () => {
    if (selected_order) {
      try {
        const response = await ordersAPI.get_invoice(selected_order.id)
        // Create blob and download
        const blob = new Blob([response.data], { type: "application/pdf" })
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement("a")
        link.href = url
        link.download = `invoice-${selected_order.order_number}.pdf`
        link.click()
        window.URL.revokeObjectURL(url)
        show_notification("Invoice downloaded successfully!")
      } catch (error) {
        console.error("Error downloading invoice:", error)
        show_notification("Failed to download invoice", "error")
      }
    }
    handle_order_menu_close()
  }

  const handle_logout = async () => {
    try {
      await authAPI.logout()
      localStorage.removeItem("auth_token")
      localStorage.removeItem("refresh_token")
      localStorage.removeItem("current_user")
      navigate("/")
    } catch (error) {
      console.error("Error logging out:", error)
      // Force logout even if API call fails
      localStorage.removeItem("auth_token")
      localStorage.removeItem("refresh_token")
      localStorage.removeItem("current_user")
      navigate("/login")
    }
  }

  const handle_delete_account = async () => {
    if (delete_confirmation !== "DELETE") {
      show_notification("Please type 'DELETE' to confirm account deletion", "error")
      return
    }

    try {
      setSaving(true)
      const response = await usersAPI.deleteAccount({
        confirmation: delete_confirmation,
        reason: "User requested account deletion",
      })

      if (response.data.success) {
        // Clear all local storage
        localStorage.removeItem("auth_token")
        localStorage.removeItem("refresh_token")
        localStorage.removeItem("current_user")
        localStorage.removeItem("token")
        localStorage.removeItem("user")

        show_notification("Account deleted successfully. You will be redirected to the homepage.", "success")

        // Redirect to homepage after a short delay
        setTimeout(() => {
          navigate("/")
        }, 2000)
      }
    } catch (error) {
      console.error("Error deleting account:", error)
      const error_message = error.response?.data?.message || "Failed to delete account"
      show_notification(error_message, "error")
    } finally {
      setSaving(false)
    }
  }

  const format_currency = (amount) => {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount)
  }

  const format_date = (date_string) => {
    if (!date_string) return "N/A"
    return new Date(date_string).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const format_datetime = (date_string) => {
    if (!date_string) return "N/A"
    return new Date(date_string).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const get_status_color = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
      case "delivered":
        return "success"
      case "pending":
      case "processing":
        return "warning"
      case "cancelled":
      case "failed":
        return "error"
      case "shipped":
        return "info"
      default:
        return "default"
    }
  }

  const get_status_icon = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
      case "delivered":
        return <CheckCircle />
      case "pending":
      case "processing":
        return <Schedule />
      default:
        return null
    }
  }

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, textAlign: "center" }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Loading your account...
        </Typography>
      </Container>
    )
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={1} sx={{ p: { xs: 2, md: 3 }, borderRadius: 2, mb: 4 }}>
        {/* Header Section */}
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 3 }}>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Avatar
              src={user_data.avatar_url}
              sx={{ width: 80, height: 80, mr: 2, bgcolor: theme.palette.primary.main }}
            >
              {!user_data.avatar_url && <Person fontSize="large" />}
            </Avatar>
            <Box>
              <Typography variant="h5" component="h1" gutterBottom>
                Hello, {user_data?.first_name || "User"}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Welcome to your account dashboard
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Tabs Navigation */}
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs
            value={active_tab}
            onChange={handle_tab_change}
            variant={is_mobile ? "scrollable" : "fullWidth"}
            scrollButtons={is_mobile ? "auto" : false}
            allowScrollButtonsMobile
            aria-label="account tabs"
          >
            <Tab icon={<Person />} label="Profile" iconPosition="start" sx={{ minHeight: 48, textTransform: "none" }} />
            <Tab
              icon={<ShoppingBag />}
              label="My Orders"
              iconPosition="start"
              sx={{ minHeight: 48, textTransform: "none" }}
            />
            <Tab
              icon={
                <Badge badgeContent={unread_count} color="error">
                  <Inbox />
                </Badge>
              }
              label="Inbox"
              iconPosition="start"
              sx={{ minHeight: 48, textTransform: "none" }}
            />
            <Tab
              icon={<Settings />}
              label="Settings"
              iconPosition="start"
              sx={{ minHeight: 48, textTransform: "none" }}
            />
          </Tabs>
        </Box>

        {/* Profile Tab */}
        {active_tab === 0 && (
          <Box sx={{ py: 3 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
              <Typography variant="h6" component="h2">
                Account Information
              </Typography>
              <Box sx={{ display: "flex", gap: 1 }}>
                {edit_mode ? (
                  <>
                    <Button
                      variant="outlined"
                      startIcon={<Cancel />}
                      onClick={() => {
                        setEditMode(false)
                        load_user_profile()
                      }}
                    >
                      Cancel
                    </Button>
                    <Button variant="contained" startIcon={<Save />} onClick={handle_save_profile} disabled={saving}>
                      {saving ? <CircularProgress size={20} /> : "Save Changes"}
                    </Button>
                  </>
                ) : (
                  <Button variant="outlined" startIcon={<Edit />} onClick={() => setEditMode(true)}>
                    Edit Profile
                  </Button>
                )}
              </Box>
            </Box>

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                {/* Profile Picture Section */}
                <Box sx={{ mb: 3, position: "relative", textAlign: "center" }}>
                  <Avatar
                    src={user_data.avatar_url}
                    sx={{
                      width: 120,
                      height: 120,
                      mx: "auto",
                      mb: 2,
                      bgcolor: theme.palette.primary.main,
                    }}
                  >
                    {!user_data.avatar_url && <Person fontSize="large" />}
                  </Avatar>

                  {edit_mode && (
                    <Box sx={{ display: "flex", justifyContent: "center", gap: 2 }}>
                      <Button
                        variant="contained"
                        color="primary"
                        startIcon={uploading_avatar ? <CircularProgress size={16} /> : <PhotoCamera />}
                        onClick={() => setProfilePictureDialog(true)}
                        size="small"
                        disabled={uploading_avatar}
                      >
                        {uploading_avatar ? "Uploading..." : "Change Photo"}
                      </Button>

                      {user_data.avatar_url && (
                        <Button
                          variant="outlined"
                          color="error"
                          startIcon={<DeleteForever />}
                          onClick={() => setRemoveProfileDialog(true)}
                          size="small"
                        >
                          Remove
                        </Button>
                      )}
                    </Box>
                  )}
                </Box>

                {/* Personal Information */}
                <TextField
                  fullWidth
                  label="First Name"
                  name="first_name"
                  value={user_data.first_name}
                  onChange={handle_user_data_change}
                  disabled={!edit_mode}
                  margin="normal"
                  variant="outlined"
                  required
                />

                <TextField
                  fullWidth
                  label="Last Name"
                  name="last_name"
                  value={user_data.last_name}
                  onChange={handle_user_data_change}
                  disabled={!edit_mode}
                  margin="normal"
                  variant="outlined"
                  required
                />

                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  type="email"
                  value={user_data.email}
                  disabled={true}
                  margin="normal"
                  variant="outlined"
                  helperText="Contact support to change your email address"
                />

                <TextField
                  fullWidth
                  label="Phone Number"
                  name="phone_number"
                  value={user_data.phone_number}
                  onChange={handle_user_data_change}
                  disabled={!edit_mode}
                  margin="normal"
                  variant="outlined"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Box sx={{ mb: 24 }}></Box>
                {/* Password Change Section */}
                <Typography variant="h6" component="h3" gutterBottom>
                  Change Password
                </Typography>
                <TextField
                  fullWidth
                  label="Current Password"
                  name="current_password"
                  type="password"
                  value={password_data.current_password}
                  onChange={handle_password_data_change}
                  margin="normal"
                  variant="outlined"
                />
                <TextField
                  fullWidth
                  label="New Password"
                  name="new_password"
                  type="password"
                  value={password_data.new_password}
                  onChange={handle_password_data_change}
                  margin="normal"
                  variant="outlined"
                  helperText="Password must be at least 8 characters long"
                />
                <TextField
                  fullWidth
                  label="Confirm New Password"
                  name="new_password_confirmation"
                  type="password"
                  value={password_data.new_password_confirmation}
                  onChange={handle_password_data_change}
                  margin="normal"
                  variant="outlined"
                />
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handle_password_change}
                  sx={{ mt: 2 }}
                  fullWidth
                  disabled={
                    !password_data.current_password ||
                    !password_data.new_password ||
                    !password_data.new_password_confirmation ||
                    saving
                  }
                  startIcon={saving ? <CircularProgress size={16} /> : null}
                >
                  {saving ? "Updating..." : "Update Password"}
                </Button>
              </Grid>
            </Grid>
          </Box>
        )}

        {/* Orders Tab */}
        {active_tab === 1 && (
          <Box sx={{ py: 3 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
              <Typography variant="h6" component="h2">
                My Orders
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total: {orders_pagination.total_count} orders
              </Typography>
            </Box>

            {orders_loading ? (
              <Box sx={{ textAlign: "center", py: 4 }}>
                <CircularProgress />
                <Typography variant="body2" sx={{ mt: 2 }}>
                  Loading your orders...
                </Typography>
              </Box>
            ) : orders.length > 0 ? (
              <>
                <TableContainer component={Paper} variant="outlined" sx={{ mt: 2 }}>
                  <Table sx={{ minWidth: 650 }}>
                    <TableHead>
                      <TableRow sx={{ backgroundColor: theme.palette.action.hover }}>
                        <TableCell>Order No.</TableCell>
                        <TableCell>Date</TableCell>
                        <TableCell>Items</TableCell>
                        <TableCell align="right">Total Amount</TableCell>
                        <TableCell align="center">Status</TableCell>
                        <TableCell align="center">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {orders.map((order) => (
                        <TableRow key={order.id} hover>
                          <TableCell>
                            <Button
                              variant="text"
                              color="primary"
                              onClick={() => navigate(`/order-details/${order.id}`)}
                              sx={{ textTransform: "none", padding: 0, minWidth: "auto" }}
                            >
                              {order.order_number}
                            </Button>
                          </TableCell>
                          <TableCell>{format_date(order.created_at)}</TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {order.items_count} item{order.items_count !== 1 ? "s" : ""}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">{format_currency(order.total_amount)}</TableCell>
                          <TableCell align="center">
                            <Chip
                              label={order.status}
                              color={get_status_color(order.status)}
                              size="small"
                              icon={get_status_icon(order.status)}
                            />
                          </TableCell>
                          <TableCell align="center">
                            <IconButton size="small" onClick={(e) => handle_order_menu_open(e, order)}>
                              <MoreVert />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>

                {/* Pagination */}
                {orders_pagination.total_pages > 1 && (
                  <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
                    <Pagination
                      count={orders_pagination.total_pages}
                      page={orders_pagination.current_page}
                      onChange={(event, page) => load_user_orders(page)}
                      color="primary"
                    />
                  </Box>
                )}
              </>
            ) : (
              <Box sx={{ textAlign: "center", py: 4 }}>
                <ShoppingBag sx={{ fontSize: 60, color: "text.secondary", mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No Orders Yet
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  You haven't placed any orders yet. Start shopping to see your orders here.
                </Typography>
                <Button variant="contained" color="primary" onClick={() => navigate("/")} sx={{ mt: 2 }}>
                  Browse Products
                </Button>
              </Box>
            )}
          </Box>
        )}

        {/* Inbox Tab */}
        {active_tab === 2 && (
          <Box sx={{ py: 3 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
              <Typography variant="h6" component="h2">
                My Inbox
              </Typography>
              <Badge badgeContent={unread_count} color="error">
                <Notifications />
              </Badge>
            </Box>

            {messages_loading ? (
              <Box sx={{ textAlign: "center", py: 4 }}>
                <CircularProgress />
                <Typography variant="body2" sx={{ mt: 2 }}>
                  Loading messages...
                </Typography>
              </Box>
            ) : messages.length > 0 ? (
              <>
                <List sx={{ width: "100%", bgcolor: "background.paper" }}>
                  {messages.map((message) => (
                    <React.Fragment key={message.id}>
                      <ListItem
                        alignItems="flex-start"
                        sx={{
                          bgcolor: message.is_read ? "transparent" : "rgba(25, 118, 210, 0.08)",
                          borderRadius: 1,
                          mb: 1,
                        }}
                      >
                        <ListItemAvatar>
                          <Avatar
                            sx={{
                              bgcolor:
                                message.type === "order"
                                  ? "primary.main"
                                  : message.type === "support"
                                    ? "secondary.main"
                                    : "success.main",
                            }}
                          >
                            {message.type === "order" ? (
                              <ShoppingBag />
                            ) : message.type === "support" ? (
                              <Help />
                            ) : (
                              <Notifications />
                            )}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                              <Typography
                                variant="subtitle1"
                                component="span"
                                sx={{ fontWeight: message.is_read ? "normal" : "bold" }}
                              >
                                {message.title}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {format_date(message.created_at)}
                              </Typography>
                            </Box>
                          }
                          secondary={
                            <React.Fragment>
                              <Typography
                                component="span"
                                variant="body2"
                                color="text.primary"
                                sx={{ display: "block", mt: 1 }}
                              >
                                {message.content}
                              </Typography>
                              <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 1 }}>
                                {!message.is_read && (
                                  <Button size="small" sx={{ mr: 1 }}>
                                    Mark as Read
                                  </Button>
                                )}
                                <Button size="small" variant="outlined">
                                  View Details
                                </Button>
                              </Box>
                            </React.Fragment>
                          }
                        />
                      </ListItem>
                    </React.Fragment>
                  ))}
                </List>

                {/* Pagination for messages */}
                {messages_pagination.total_pages > 1 && (
                  <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
                    <Pagination
                      count={messages_pagination.total_pages}
                      page={messages_pagination.current_page}
                      onChange={(event, page) => load_user_messages(page)}
                      color="primary"
                    />
                  </Box>
                )}
              </>
            ) : (
              <Box sx={{ textAlign: "center", py: 4 }}>
                <Inbox sx={{ fontSize: 60, color: "text.secondary", mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  Your Inbox is Empty
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  You don't have any messages yet. Notifications about your orders and support tickets will appear here.
                </Typography>
              </Box>
            )}
          </Box>
        )}

        {/* Settings Tab */}
        {active_tab === 3 && (
          <Box sx={{ py: 3 }}>
            <Typography variant="h6" component="h2" gutterBottom>
              Account Settings
            </Typography>

            {/* Privacy Settings */}
            <Card variant="outlined" sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Privacy Settings
                </Typography>
                <FormGroup>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={privacy_settings.profile_visibility === "public"}
                        onChange={(e) =>
                          setPrivacySettings((prev) => ({
                            ...prev,
                            profile_visibility: e.target.checked ? "public" : "private",
                          }))
                        }
                      />
                    }
                    label="Make profile visible to other users"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={privacy_settings.data_sharing}
                        onChange={handle_privacy_setting_change("data_sharing")}
                      />
                    }
                    label="Allow data sharing for personalized recommendations"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={privacy_settings.analytics_tracking}
                        onChange={handle_privacy_setting_change("analytics_tracking")}
                      />
                    }
                    label="Enable analytics tracking to improve user experience"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={privacy_settings.marketing_communications}
                        onChange={handle_privacy_setting_change("marketing_communications")}
                      />
                    }
                    label="Receive marketing communications and promotional offers"
                  />
                </FormGroup>
              </CardContent>
            </Card>

            {/* Account Actions */}
            <Card variant="outlined" sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Account Actions
                </Typography>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Box>
                      <Typography variant="body1">Download Account Data</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Download a copy of all your account data and order history
                      </Typography>
                    </Box>
                    <Button variant="outlined" startIcon={<Download />}>
                      Download Data
                    </Button>
                  </Box>
                  <Divider />
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Box>
                      <Typography variant="body1">Logout from All Devices</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Sign out from all devices and invalidate all active sessions
                      </Typography>
                    </Box>
                    <Button variant="outlined" startIcon={<Logout />} onClick={handle_logout}>
                      Logout All
                    </Button>
                  </Box>
                </Box>
              </CardContent>
            </Card>

            {/* Danger Zone */}
            <Card variant="outlined" sx={{ mb: 3, borderColor: "error.main" }}>
              <CardContent>
                <Typography variant="h6" gutterBottom color="error">
                  Danger Zone
                </Typography>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Box>
                    <Typography variant="body1">Delete Account</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Permanently delete your account and all associated data. This action cannot be undone.
                    </Typography>
                  </Box>
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<Delete />}
                    onClick={() => setDeleteAccountDialog(true)}
                  >
                    Delete Account
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Box>
        )}
      </Paper>

      {/* Order Actions Menu */}
      <Menu anchorEl={anchor_el} open={Boolean(anchor_el)} onClose={handle_order_menu_close}>
        <MenuItem onClick={handle_view_order}>
          <Visibility sx={{ mr: 1 }} />
          View Details
        </MenuItem>
        <MenuItem onClick={handle_download_invoice}>
          <Download sx={{ mr: 1 }} />
          Download Invoice
        </MenuItem>
      </Menu>

      {/* Profile Picture Upload Dialog */}
      <Dialog open={profile_picture_dialog} onClose={() => setProfilePictureDialog(false)}>
        <DialogTitle>Change Profile Picture</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" paragraph>
            Upload a new profile picture. The image should be at least 200x200 pixels and less than 5MB. Supported
            formats: JPG, PNG, GIF.
          </Typography>
          <Button
            variant="contained"
            component="label"
            startIcon={<PhotoCamera />}
            fullWidth
            disabled={uploading_avatar}
          >
            {uploading_avatar ? "Uploading..." : "Choose File"}
            <input type="file" hidden accept="image/*" onChange={handle_profile_picture_change} />
          </Button>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setProfilePictureDialog(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>

      {/* Remove Profile Picture Confirmation Dialog */}
      <Dialog open={remove_profile_dialog} onClose={() => setRemoveProfileDialog(false)}>
        <DialogTitle>Remove Profile Picture</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            Are you sure you want to remove your profile picture? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRemoveProfileDialog(false)}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handle_remove_profile_picture}>
            Remove
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Account Confirmation Dialog */}
      <Dialog open={delete_account_dialog} onClose={() => setDeleteAccountDialog(false)}>
        <DialogTitle color="error">Delete Account</DialogTitle>
        <DialogContent>
          <Alert severity="error" sx={{ mb: 2 }}>
            This action is permanent and cannot be undone!
          </Alert>
          <Typography variant="body2" color="text.secondary" paragraph>
            Deleting your account will permanently remove:
          </Typography>
          <ul>
            <li>Your profile information</li>
            <li>Order history</li>
            <li>Wallet balance and transaction history</li>
            <li>All personal data</li>
          </ul>
          <Typography variant="body2" color="text.secondary" paragraph>
            If you have any pending orders or wallet balance, please resolve them before deleting your account.
          </Typography>
          <TextField
            fullWidth
            label="Type 'DELETE' to confirm"
            variant="outlined"
            margin="normal"
            value={delete_confirmation}
            onChange={(e) => setDeleteConfirmation(e.target.value)}
            helperText="This confirmation is required to proceed"
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setDeleteAccountDialog(false)
              setDeleteConfirmation("")
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            startIcon={saving ? <CircularProgress size={16} /> : <DeleteForever />}
            onClick={handle_delete_account}
            disabled={delete_confirmation !== "DELETE" || saving}
          >
            {saving ? "Deleting..." : "Delete My Account"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Notification Snackbar */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handle_notification_close}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert onClose={handle_notification_close} severity={notification.severity} sx={{ width: "100%" }}>
          {notification.message}
        </Alert>
      </Snackbar>
    </Container>
  )
}

export default AccountPage
