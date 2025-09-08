"use client"

import { useEffect, useState } from "react"
import { Box, Paper, Typography, Grid, Card, CardContent, Table, TableHead, TableRow, TableCell, TableBody, Chip, Button } from "@mui/material"
import { adminAPI } from "../../services/interceptor"

const AlertsManagement = () => {
  const [emailFailedPOs, setEmailFailedPOs] = useState([])
  const [underDelivery, setUnderDelivery] = useState([])
  const [overDelivery, setOverDelivery] = useState([])

  const refresh = async () => {
    try {
      const resFailed = await adminAPI.getPurchaseOrders({ status: "email_failed" })
      const dataFailed = resFailed?.data?.data || resFailed?.data || []
      setEmailFailedPOs(Array.isArray(dataFailed) ? dataFailed : [])

      const grnRes = await adminAPI.getGRNs()
      const grns = grnRes?.data?.data || grnRes?.data || []
      const under = []
      const over = []
      ;(Array.isArray(grns) ? grns : []).forEach((grn) => {
        ;(grn.items || []).forEach((item) => {
          const ordered = Number(item.orderedQuantity || 0)
          const received = Number(item.receivedQuantity || 0)
          if (received < ordered) under.push({ grnNumber: grn.grnNumber, product: item.productName || item.productCode, shortfall: ordered - received, supplier: grn.purchaseOrder?.supplier?.name || grn.supplier?.name })
          if (received > ordered) over.push({ grnNumber: grn.grnNumber, product: item.productName || item.productCode, surplus: received - ordered, supplier: grn.purchaseOrder?.supplier?.name || grn.supplier?.name })
        })
      })
      setUnderDelivery(under)
      setOverDelivery(over)
    } catch (e) {
      setEmailFailedPOs([])
      setUnderDelivery([])
      setOverDelivery([])
    }
  }

  useEffect(() => {
    refresh()
  }, [])

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 3, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Typography variant="h4" fontWeight="bold" color="#1976d2">Alerts & Notifications</Typography>
        <Button variant="outlined" onClick={refresh}>Refresh</Button>
      </Box>

      <Grid container spacing={3} sx={{ mb: 2 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: "#ffebee", border: "1px solid #ffcdd2" }}>
            <CardContent sx={{ textAlign: "center", py: 1.5 }}>
              <Typography variant="h5" sx={{ fontWeight: 600, color: "#d32f2f" }}>{underDelivery.length}</Typography>
              <Typography variant="body2" color="text.secondary">Under-deliveries</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: "#e3f2fd", border: "1px solid #bbdefb" }}>
            <CardContent sx={{ textAlign: "center", py: 1.5 }}>
              <Typography variant="h5" sx={{ fontWeight: 600, color: "#1976d2" }}>{overDelivery.length}</Typography>
              <Typography variant="body2" color="text.secondary">Over-deliveries</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: "#fdecea", border: "1px solid #f5c6cb" }}>
            <CardContent sx={{ textAlign: "center", py: 1.5 }}>
              <Typography variant="h5" sx={{ fontWeight: 600, color: "#c62828" }}>{emailFailedPOs.length}</Typography>
              <Typography variant="body2" color="text.secondary">Email Failures</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Unacknowledged POs are displayed under Purchase Orders. Avoid duplication here. */}

      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 1, color: "#1976d2" }}>Under / Over Deliveries</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1">Under-deliveries</Typography>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>GRN</TableCell>
                  <TableCell>Product</TableCell>
                  <TableCell>Shortfall</TableCell>
                  <TableCell>Supplier</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {underDelivery.length === 0 ? (
                  <TableRow><TableCell colSpan={4} align="center">None</TableCell></TableRow>
                ) : underDelivery.map((u, idx) => (
                  <TableRow key={idx}>
                    <TableCell>{u.grnNumber}</TableCell>
                    <TableCell>{u.product}</TableCell>
                    <TableCell>{u.shortfall}</TableCell>
                    <TableCell>{u.supplier}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1">Over-deliveries</Typography>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>GRN</TableCell>
                  <TableCell>Product</TableCell>
                  <TableCell>Surplus</TableCell>
                  <TableCell>Supplier</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {overDelivery.length === 0 ? (
                  <TableRow><TableCell colSpan={4} align="center">None</TableCell></TableRow>
                ) : overDelivery.map((o, idx) => (
                  <TableRow key={idx}>
                    <TableCell>{o.grnNumber}</TableCell>
                    <TableCell>{o.product}</TableCell>
                    <TableCell>{o.surplus}</TableCell>
                    <TableCell>{o.supplier}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  )
}

export default AlertsManagement

