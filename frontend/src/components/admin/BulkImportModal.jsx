"use client"
import { Modal, Box, Typography, Button, TextField, IconButton, Alert } from "@mui/material"
import { Close } from "@mui/icons-material"
import { useState } from "react"
import Papa from "papaparse"
import * as XLSX from "xlsx"

const BulkImportModal = ({ open, onClose }) => {
  const [selectedFile, setSelectedFile] = useState(null)
  const [parsedData, setParsedData] = useState([])
  const [error, setError] = useState("")

  const handleFileChange = (event) => {
    const file = event.target.files?.[0]
    if (!file) {
      setError("No file selected")
      return
    }

    setSelectedFile(file)
    setError("") // Clear previous errors
    setParsedData([]) // Clear previous data
  }

  const handleFileUpload = () => {
    if (!selectedFile) {
      setError("Please select a file.")
      return
    }

    const reader = new FileReader()
    const fileType = selectedFile.name.split(".").pop()?.toLowerCase()

    if (!fileType) {
      setError("Unable to determine file type.")
      return
    }

    reader.onload = (event) => {
      try {
        if (!event.target?.result) {
          throw new Error("Failed to read file content.")
        }

        let data = []
        if (fileType === "csv") {
          const result = Papa.parse(event.target.result, { header: true, skipEmptyLines: true })
          if (result.errors.length > 0) {
            throw new Error("Error parsing CSV file.")
          }
          data = result.data
        } else if (fileType === "xls" || fileType === "xlsx") {
          const workbook = XLSX.read(event.target.result, { type: "binary" })

          if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
            throw new Error("No sheets found in the Excel file.")
          }

          const sheetName = workbook.SheetNames[0]
          const sheet = workbook.Sheets[sheetName]

          if (!sheet) {
            throw new Error("Unable to read the first sheet from Excel file.")
          }

          data = XLSX.utils.sheet_to_json(sheet, { header: 1 }) // Get array of arrays
          if (data.length > 0) {
            const headers = data[0]

            if (!headers || !Array.isArray(headers)) {
              throw new Error("Invalid headers in Excel file.")
            }

            data = data.slice(1).map((row) => {
              const obj = {}
              headers.forEach((header, index) => {
                obj[header] = row?.[index] // Added optional chaining for row access
              })
              return obj
            })
          }
        } else {
          throw new Error("Unsupported file type. Please upload CSV, XLS, or XLSX.")
        }
        setParsedData(data)
        console.log("Parsed data:", data)
        setError("") // Clear any previous error
        // Placeholder for API call to backend:
        // sendDataToBackend(data);
        // onClose(); // Optionally close modal after successful parse, or wait for backend response
      } catch (err) {
        console.error("Error parsing file:", err)
        setError(err.message || "Error parsing file.")
        setParsedData([])
      }
    }

    reader.onerror = () => {
      setError("Error reading file.")
    }

    if (fileType === "csv") {
      reader.readAsText(selectedFile)
    } else if (fileType === "xls" || fileType === "xlsx") {
      reader.readAsBinaryString(selectedFile)
    } else {
      setError("Unsupported file type. Please upload CSV, XLS, or XLSX.")
    }
  }

  return (
    <Modal
      open={open}
      onClose={() => {
        setError("")
        onClose()
      }}
    >
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 400,
          bgcolor: "background.paper",
          boxShadow: 24,
          p: 4,
          borderRadius: 2,
        }}
      >
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
          <Typography variant="h6" component="h2">
            Bulk Import Products
          </Typography>
          <IconButton
            onClick={() => {
              setError("")
              onClose()
            }}
          >
            <Close />
          </IconButton>
        </Box>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <TextField
          type="file"
          onChange={handleFileChange}
          fullWidth
          variant="outlined"
          size="small"
          inputProps={{
            accept: ".csv, application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          }}
          sx={{ mb: 3 }}
        />
        <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
          <Button
            onClick={() => {
              setError("")
              onClose()
            }}
            sx={{ mr: 1, color: "text.secondary" }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleFileUpload}
            disabled={!selectedFile}
            sx={{
              bgcolor: "#1976d2",
              "&:hover": { bgcolor: "#1565c0" },
            }}
          >
            Upload
          </Button>
        </Box>
      </Box>
    </Modal>
  )
}

export default BulkImportModal
