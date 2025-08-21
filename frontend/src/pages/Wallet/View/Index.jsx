import React, { useState, useEffect } from "react"
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Button,
  TextField,
  List,
  ListItem,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  useTheme,
  useMediaQuery,
  Tabs,
  Tab,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material"
import { AccountBalanceWallet, ArrowUpward, History, Close, CheckCircle, Warning } from "@mui/icons-material"
import { useNavigate } from "react-router-dom"

// Mock cashback transaction data with item codes and percentages
// Each transaction represents a purchase that earned cashback
const mockCashbackTransactionsData = [
  {
    id: 1,
    orderNo: "ORD-2023-001",
    date: "2023-05-15",
    items: [
      {
        itemCode: "SC001",
        productName: "Soft Chair",
        purchaseAmount: 80,
        cashbackAmount: 4,
      },
      {
        itemCode: "BL001",
        productName: "Blender",
        purchaseAmount: 35,
        cashbackAmount: 3,
      },
    ],
    totalAmount: 115,
    totalCashback: 7,
    status: "completed",
  },
  {
    id: 2,
    orderNo: "ORD-2023-002",
    date: "2023-06-02",
    items: [
      {
        itemCode: "KM001",
        productName: "Kitchen Mixer",
        purchaseAmount: 150,
        cashbackAmount: 23,
      },
    ],
    totalAmount: 150,
    totalCashback: 23,
    status: "completed",
  },
  {
    id: 3,
    orderNo: "ORD-2023-003",
    date: "2023-06-10",
    items: [
      {
        itemCode: "SW001",
        productName: "Smart Watch",
        purchaseAmount: 100,
        cashbackAmount: 10,
      },
      {
        itemCode: "CM001",
        productName: "Coffee Maker",
        purchaseAmount: 50,
        cashbackAmount: 6,
      },
    ],
    totalAmount: 150,
    totalCashback: 16,
    status: "completed",
  },
]

// Sort orders by date (newest first)
const mockCashbackTransactions = [...mockCashbackTransactionsData].sort(
  (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
)

// Mock withdrawal history
// Records of when users withdrew their cashback to external payment methods
const mockWithdrawalsData = [
  {
    id: 1,
    date: "2023-06-01",
    reference: "WD-2023-001",
    safaricomRef: "PXL12345678",
    method: "M-Pesa",
    amount: 30,
    maintenanceCharge: 2,
    withdrawalCharge: 1.5,
    status: "completed",
  },
  {
    id: 2,
    date: "2023-05-10",
    reference: "WD-2023-002",
    safaricomRef: "PXL87654321",
    method: "M-Pesa",
    amount: 15,
    maintenanceCharge: 2,
    withdrawalCharge: 1,
    status: "completed",
  },
]

// Sort withdrawals by date (newest first) and assign serial numbers
const mockWithdrawals = [...mockWithdrawalsData]
  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  .map((withdrawal, index) => ({
    ...withdrawal,
    serialNo: index + 1,
  }))

// Calculate cumulative total withdrawn
mockWithdrawals.forEach((withdrawal, index) => {
  const previousTotal = index > 0 ? mockWithdrawals[index - 1].cumulativeTotal : 0
  withdrawal.cumulativeTotal = previousTotal + withdrawal.amount
})

const WalletPage = () => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"))
  const navigate = useNavigate()

  // Calculate total cashback from transactions
  // This function computes the available balance by subtracting withdrawals from earned cashback
  const calculateTotalCashback = () => {
    const totalEarned = mockCashbackTransactions.reduce((sum, transaction) => sum + transaction.totalCashback, 0)
    const totalWithdrawn = mockWithdrawals.reduce((sum, withdrawal) => sum + withdrawal.amount, 0)
    return totalEarned - totalWithdrawn
  }

  // State for cashback balance
  const [cashbackBalance, setCashbackBalance] = useState(0)

  // Update cashback balance on component mount
  useEffect(() => {
    setCashbackBalance(calculateTotalCashback())
  }, [])

  // State for dialogs
  const [withdrawDialog, setWithdrawDialog] = useState(false)

  // State for transaction history tab
  const [historyTab, setHistoryTab] = useState(0)

  // State for withdraw amount
  const [amount, setAmount] = useState("")
  const [paymentMethod, setPaymentMethod] = useState("")

  // State for success message
  const [successMessage, setSuccessMessage] = useState("")
  const [errorMessage, setErrorMessage] = useState("")

  // Handle withdraw
  // This function processes a cashback withdrawal request
  const handleWithdraw = () => {
    if (!amount || !paymentMethod) {
      setErrorMessage("Please enter an amount and select a payment method")
      return
    }

    const withdrawAmount = Number.parseFloat(amount)

    if (withdrawAmount < 100) {
      setErrorMessage("Minimum withdrawal amount is KSH 100")
      return
    }

    if (withdrawAmount > cashbackBalance) {
      setErrorMessage("Insufficient balance")
      return
    }

    // In a real app, you would process the withdrawal through an API
    setCashbackBalance(cashbackBalance - withdrawAmount)

    // Add to withdrawals
    const newWithdrawal = {
      id: mockWithdrawals.length + 1,
      serialNo: 1, // Will be reassigned when sorting
      date: new Date().toISOString().split("T")[0],
      reference: `WD-2023-${mockWithdrawals.length + 1}`,
      safaricomRef: `PXL${Math.floor(10000000 + Math.random() * 90000000)}`,
      method: "M-Pesa",
      amount: Math.round(withdrawAmount),
      maintenanceCharge: 2,
      withdrawalCharge: Math.round(withdrawAmount * 0.05), // 5% withdrawal charge
      status: "completed",
      cumulativeTotal: 0, // Will be calculated
    }

    // In a real app, you would update this in the server/state management
    mockWithdrawals.unshift(newWithdrawal)

    // Recalculate cumulative totals
    mockWithdrawals.forEach((withdrawal, index) => {
      const previousTotal = index > 0 ? mockWithdrawals[index - 1].cumulativeTotal : 0
      withdrawal.cumulativeTotal = previousTotal + withdrawal.amount
    })

    // Reset form and close dialog
    setAmount("")
    setPaymentMethod("")
    setWithdrawDialog(false)

    // Show success message
    setSuccessMessage("Withdrawal successful! Your cashback has been sent to your selected payment method.")
    setTimeout(() => setSuccessMessage(""), 5000)
  }

  // Handle history tab change
  const handleHistoryTabChange = (event, newValue) => {
    setHistoryTab(newValue)
  }

  // Clear error message
  const clearErrorMessage = () => {
    setErrorMessage("")
  }

  // Calculate total earned and withdrawn
  const totalEarned = mockCashbackTransactions.reduce((sum, transaction) => sum + transaction.totalCashback, 0)
  const totalWithdrawn = mockWithdrawals.reduce((sum, withdrawal) => sum + withdrawal.amount, 0)

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Success Message */}
      {successMessage && (
        <Alert
          severity="success"
          sx={{ mb: 3 }}
          action={
            <IconButton aria-label="close" color="inherit" size="small" onClick={() => setSuccessMessage("")}>
              <Close fontSize="inherit" />
            </IconButton>
          }
        >
          {successMessage}
        </Alert>
      )}

      {/* Error Message */}
      {errorMessage && (
        <Alert
          severity="error"
          sx={{ mb: 3 }}
          action={
            <IconButton aria-label="close" color="inherit" size="small" onClick={clearErrorMessage}>
              <Close fontSize="inherit" />
            </IconButton>
          }
        >
          {errorMessage}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* E-Wallet Balance Section */}
        <Grid item xs={12} md={8}>
          <Paper
            elevation={1}
            sx={{
              p: 3,
              borderRadius: 2,
              mb: 3,
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
              color: "white",
            }}
          >
            <Grid container spacing={3} alignItems="center">
              <Grid item xs={12} sm={8}>
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <AccountBalanceWallet sx={{ fontSize: 40, mr: 2 }} />
                  <Typography variant="h5" component="h1">
                    E-Wallet Balance
                  </Typography>
                </Box>
                <Typography variant="h3" component="p" sx={{ mb: 1, fontWeight: "bold" }}>
                  {Math.round(cashbackBalance)}/= {/* Rounded to whole number */}
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", mt: 2 }}>
                  <Chip
                    icon={<CheckCircle sx={{ color: "white !important" }} />}
                    label="Available for withdrawal"
                    sx={{
                      bgcolor: "rgba(255, 255, 255, 0.2)",
                      color: "white",
                      "& .MuiChip-icon": { color: "white" },
                    }}
                  />
                </Box>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <Button
                    variant="contained"
                    startIcon={<ArrowUpward />}
                    onClick={() => setWithdrawDialog(true)}
                    disabled={cashbackBalance < 100}
                    sx={{
                      bgcolor: "rgba(255, 255, 255, 0.9)",
                      color: theme.palette.primary.main,
                      "&:hover": {
                        bgcolor: "white",
                      },
                      "&.Mui-disabled": {
                        bgcolor: "rgba(255, 255, 255, 0.5)",
                        color: "rgba(0, 0, 0, 0.4)",
                      },
                    }}
                  >
                    Withdraw Cashback
                  </Button>
                  {cashbackBalance < 100 && (
                    <Typography variant="caption" sx={{ color: "white", textAlign: "center" }}>
                      Minimum withdrawal: KSH 100/=
                    </Typography>
                  )}
                </Box>
              </Grid>
            </Grid>
          </Paper>

          <Paper
            elevation={1}
            sx={{
              p: 3,
              borderRadius: 2,
              mb: 3,
              background: "white",
            }}
          >
            <Typography variant="h6" component="h2" gutterBottom>
              Cashback Dashboard
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <Box
                  sx={{
                    p: 2,
                    bgcolor: "#f0f7ff",
                    borderRadius: 2,
                    textAlign: "center",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                  }}
                >
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Total Cashback Earned
                  </Typography>
                  <Typography variant="h4" color="primary.main" sx={{ fontWeight: "bold" }}>
                    {Math.round(totalEarned)}/=
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Box
                  sx={{
                    p: 2,
                    bgcolor: "#e8f5e9",
                    borderRadius: 2,
                    textAlign: "center",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                  }}
                >
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Available Balance
                  </Typography>
                  <Typography variant="h4" color="success.main" sx={{ fontWeight: "bold" }}>
                    {Math.round(cashbackBalance)}/=
                  </Typography>
                </Box>
              </Grid>
            </Grid>

            <Box sx={{ mt: 3 }}>
              <Typography variant="body2" color="text.secondary">
                <strong>Cashback Summary:</strong> You've earned a total of {Math.round(totalEarned)}/= in cashback
                since you started shopping with FirstCraft. Keep shopping to earn more rewards!
              </Typography>
            </Box>
          </Paper>

          {/* Transaction History */}
          <Paper elevation={1} sx={{ p: 3, borderRadius: 2 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
              <Typography variant="h6" component="h2">
                Cashback History
              </Typography>
              <Chip icon={<History />} label="All transactions" color="primary" variant="outlined" size="small" />
            </Box>

            <Tabs
              value={historyTab}
              onChange={handleHistoryTabChange}
              sx={{ mb: 2, borderBottom: 1, borderColor: "divider" }}
            >
              <Tab label="Cashback Earned" />
              <Tab label="Withdrawals" />
            </Tabs>

            {historyTab === 0 ? (
              <TableContainer component={Paper} variant="outlined" sx={{ mb: 2 }}>
                <Table size={isMobile ? "small" : "medium"}>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: theme.palette.action.hover }}>
                      <TableCell>Date</TableCell>
                      <TableCell>Order No.</TableCell>
                      <TableCell>Item Code</TableCell>
                      <TableCell>Product</TableCell>
                      <TableCell align="right">Purchase Amount</TableCell>
                      <TableCell align="right">Cashback Earned</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {mockCashbackTransactions.map((order) => (
                      <React.Fragment key={order.id}>
                        {order.items.map((item, itemIndex) => (
                          <TableRow key={`${order.id}-${itemIndex}`} hover>
                            {itemIndex === 0 && (
                              <>
                                <TableCell rowSpan={order.items.length}>{order.date}</TableCell>
                                <TableCell rowSpan={order.items.length}>{order.orderNo}</TableCell>
                              </>
                            )}
                            <TableCell>
                              <Chip
                                label={item.itemCode}
                                size="small"
                                sx={{
                                  fontSize: "0.7rem",
                                  height: "20px",
                                  backgroundColor: "#f0f7ff",
                                  color: theme.palette.primary.main,
                                }}
                              />
                            </TableCell>
                            <TableCell>{item.productName}</TableCell>
                            <TableCell align="right">{item.purchaseAmount}/=</TableCell>
                            <TableCell align="right" sx={{ fontWeight: "bold", color: "success.main" }}>
                              {item.cashbackAmount}/=
                            </TableCell>
                          </TableRow>
                        ))}
                        <TableRow sx={{ backgroundColor: "rgba(76, 175, 80, 0.08)" }}>
                          <TableCell colSpan={4} align="right" sx={{ fontWeight: "bold" }}>
                            Order Total:
                          </TableCell>
                          <TableCell align="right" sx={{ fontWeight: "bold" }}>
                            {order.totalAmount}/=
                          </TableCell>
                          <TableCell align="right" sx={{ fontWeight: "bold", color: "success.main" }}>
                            {order.totalCashback}/=
                          </TableCell>
                        </TableRow>
                      </React.Fragment>
                    ))}
                    <TableRow sx={{ backgroundColor: "rgba(25, 118, 210, 0.08)" }}>
                      <TableCell colSpan={5} align="right" sx={{ fontWeight: "bold" }}>
                        Total Cashback Earned:
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: "bold", color: "success.main" }}>
                        {totalEarned}/=
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <TableContainer component={Paper} variant="outlined" sx={{ mb: 2 }}>
                <Table size={isMobile ? "small" : "medium"}>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: theme.palette.action.hover }}>
                      <TableCell>Serial No.</TableCell>
                      <TableCell>Date</TableCell>
                      <TableCell>Reference</TableCell>
                      <TableCell>Safaricom Ref</TableCell>
                      <TableCell>Method</TableCell>
                      <TableCell>Maintenance Charge</TableCell>
                      <TableCell>Withdrawal Charge</TableCell>
                      <TableCell align="right">Amount</TableCell>
                      <TableCell align="right">Total Withdrawn</TableCell>
                      <TableCell align="center">Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {mockWithdrawals.length > 0 ? (
                      <>
                        {mockWithdrawals.map((withdrawal) => (
                          <TableRow key={withdrawal.id} hover>
                            <TableCell>{withdrawal.serialNo}</TableCell>
                            <TableCell>{withdrawal.date}</TableCell>
                            <TableCell>{withdrawal.reference}</TableCell>
                            <TableCell>{withdrawal.safaricomRef}</TableCell>
                            <TableCell>{withdrawal.method}</TableCell>
                            <TableCell>{withdrawal.maintenanceCharge}/=</TableCell>
                            <TableCell>{withdrawal.withdrawalCharge}/=</TableCell>
                            <TableCell align="right" sx={{ fontWeight: "bold" }}>
                              {withdrawal.amount}/=
                            </TableCell>
                            <TableCell align="right" sx={{ fontWeight: "bold", color: "primary.main" }}>
                              {withdrawal.cumulativeTotal}/=
                            </TableCell>
                            <TableCell align="center">
                              <Chip
                                label="Successful"
                                size="small"
                                color="success"
                                sx={{ fontSize: "0.7rem", height: "20px" }}
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                        <TableRow sx={{ backgroundColor: "rgba(76, 175, 80, 0.08)" }}>
                          <TableCell colSpan={7} align="right" sx={{ fontWeight: "bold" }}>
                            Total Withdrawn:
                          </TableCell>
                          <TableCell align="right" sx={{ fontWeight: "bold" }}>
                            {totalWithdrawn}/=
                          </TableCell>
                          <TableCell colSpan={2}></TableCell>
                        </TableRow>
                      </>
                    ) : (
                      <TableRow>
                        <TableCell colSpan={10} align="center" sx={{ py: 3 }}>
                          <Typography variant="body1" color="text.secondary">
                            No withdrawals yet
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            )}

            {/* Mobile view for transaction history */}
            {isMobile && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Swipe horizontally to view all transaction details
                </Typography>
              </Box>
            )}

            <Alert severity="info" sx={{ mt: 2 }}>
              <Typography variant="body2">
                <strong>Cashback Policy:</strong> Cashback is earned on all eligible purchases and can be withdrawn once
                you have accumulated a minimum of KSH 100/=.
              </Typography>
            </Alert>
          </Paper>
        </Grid>

        {/* Right Sidebar */}
        <Grid item xs={12} md={4}>
          {/* Withdrawal Information */}
          <Paper elevation={1} sx={{ p: 3, borderRadius: 2, mb: 3 }}>
            <Typography variant="h6" component="h2" gutterBottom>
              Withdrawal Information
            </Typography>

            <Alert severity="warning" sx={{ mb: 3 }}>
              <Typography variant="body2" fontWeight="bold">
                Minimum withdrawal amount: KSH 100/=
              </Typography>
            </Alert>

            <Box sx={{ mb: 3 }}>
              <Typography variant="body1" fontWeight="bold" gutterBottom>
                Available for Withdrawal
              </Typography>
              <Typography variant="h5" color="success.main">
                {Math.round(cashbackBalance)}/= {/* Rounded to whole number */}
              </Typography>
              {cashbackBalance < 100 && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  You need {Math.round(100 - cashbackBalance)}/= more to reach the minimum withdrawal amount.
                </Typography>
              )}
            </Box>

            <Button
              variant="contained"
              fullWidth
              startIcon={<ArrowUpward />}
              onClick={() => setWithdrawDialog(true)}
              disabled={cashbackBalance < 100}
              sx={{ mb: 2 }}
            >
              Withdraw Cashback
            </Button>
          </Paper>

          {/* Cashback Information */}
          <Paper elevation={1} sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h6" component="h2" gutterBottom>
              About Cashback
            </Typography>

            <Typography variant="body2" paragraph>
              <strong>How Cashback Works:</strong>
            </Typography>

            <List sx={{ pl: 2 }}>
              <ListItem sx={{ display: "list-item", p: 0, mb: 1 }}>
                <Typography variant="body2">
                  Earn cashback on every eligible purchase based on the product's cashback percentage.
                </Typography>
              </ListItem>
              <ListItem sx={{ display: "list-item", p: 0, mb: 1 }}>
                <Typography variant="body2">
                  Cashback is calculated on the product price and added to your balance after purchase.
                </Typography>
              </ListItem>
              <ListItem sx={{ display: "list-item", p: 0, mb: 1 }}>
                <Typography variant="body2">
                  Withdraw your cashback once you've accumulated a minimum of KSH 100/=.
                </Typography>
              </ListItem>
              <ListItem sx={{ display: "list-item", p: 0 }}>
                <Typography variant="body2">Choose your preferred withdrawal method: M-Pesa.</Typography>
              </ListItem>
            </List>

            <Alert severity="info" sx={{ mt: 2 }}>
              <Typography variant="body2">
                Need help with your cashback? Contact our support team at support@firstcraft.com
              </Typography>
            </Alert>
          </Paper>

          {/* M-Pesa Withdrawal Charges */}
          <Paper elevation={1} sx={{ p: 3, borderRadius: 2, mt: 3 }}>
            <Typography variant="h6" component="h2" gutterBottom>
              M-Pesa Withdrawal Charges
            </Typography>

            <Alert severity="warning" sx={{ mb: 2 }}>
              <Typography variant="body2">
                <strong>Note:</strong> M-Pesa withdrawal charges will be borne by the client.
              </Typography>
            </Alert>

            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ backgroundColor: theme.palette.action.hover }}>
                    <TableCell>Amount Range (KSH)</TableCell>
                    <TableCell align="right">Charge (KSH)</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell>100 - 500</TableCell>
                    <TableCell align="right">1</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>501 - 1,000</TableCell>
                    <TableCell align="right">1.5</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>1,001 - 2,500</TableCell>
                    <TableCell align="right">2.5</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>2,501 - 5,000</TableCell>
                    <TableCell align="right">5</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>5,001 - 10,000</TableCell>
                    <TableCell align="right">10</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Above 10,000</TableCell>
                    <TableCell align="right">15</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>

            <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1 }}>
              * Charges are subject to change based on Safaricom's policies.
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Withdraw Dialog */}
      <Dialog open={withdrawDialog} onClose={() => setWithdrawDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Withdraw Cashback
          <IconButton
            aria-label="close"
            onClick={() => setWithdrawDialog(false)}
            sx={{
              position: "absolute",
              right: 8,
              top: 8,
            }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" paragraph>
            Withdraw your cashback to your M-Pesa account.
          </Typography>

          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" gutterBottom>
              Available Balance
            </Typography>
            <Typography variant="h6" color="success.main">
              {Math.round(cashbackBalance)}/= {/* Rounded to whole number */}
            </Typography>
          </Box>

          <TextField
            label="Amount"
            type="number"
            fullWidth
            margin="normal"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            InputProps={{
              startAdornment: <InputAdornment position="start">KES</InputAdornment>,
            }}
            error={
              Number.parseFloat(amount) > cashbackBalance ||
              (Number.parseFloat(amount) > 0 && Number.parseFloat(amount) < 100)
            }
            helperText={
              Number.parseFloat(amount) > cashbackBalance
                ? "Amount exceeds available balance"
                : Number.parseFloat(amount) > 0 && Number.parseFloat(amount) < 100
                  ? "Minimum withdrawal amount is KSH 100/="
                  : ""
            }
          />

          <FormControl fullWidth margin="normal">
            <InputLabel>Withdraw To</InputLabel>
            <Select value="2" onChange={(e) => setPaymentMethod(e.target.value)} label="Withdraw To">
              <MenuItem value="2">M-Pesa (+254 722 123 456)</MenuItem>
            </Select>
          </FormControl>

          <Alert severity="warning" sx={{ mt: 2 }}>
            <Box sx={{ display: "flex", alignItems: "flex-start" }}>
              <Warning sx={{ mr: 1, mt: 0.5 }} fontSize="small" />
              <Typography variant="body2">
                <strong>Important:</strong> Minimum withdrawal amount is KSH 100/=. M-Pesa withdrawals are typically
                processed instantly. A maintenance charge of KSH 2 and M-Pesa withdrawal charges will apply.
              </Typography>
            </Box>
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setWithdrawDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleWithdraw}
            disabled={!amount || Number.parseFloat(amount) > cashbackBalance || Number.parseFloat(amount) < 100}
          >
            Withdraw
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  )
}

export default WalletPage
