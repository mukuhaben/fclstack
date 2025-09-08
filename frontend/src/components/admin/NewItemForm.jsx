"use client"

import { useState, useEffect, useRef } from "react"
import {
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  Alert,
  Snackbar,
  Stack,
  Divider,
  Card,
  CardMedia,
  IconButton,
  Chip,
} from "@mui/material"
import { ExpandMore, Save, Clear, PhotoCamera, Delete as DeleteIcon, Star as StarIcon } from "@mui/icons-material"
import { uploadAPI } from "../../services/interceptor.js"
import { categoriesAPI } from "../../services/interceptor.js"
import { adminAPI } from "../../services/interceptor.js"

const NewItemForm = ({ editItem, onSave, onCancel, onRefresh }) => {
  const fileInputRef = useRef(null)
  const multipleFileInputRef = useRef(null)

  const [formData, setFormData] = useState({
    productName: "",
    productCode: "",
    description: "",
    longerDescription: "",
    category: "",
    subCategory: "",
    costPrice: "",
    vat: "16",
    cashbackRate: "0",
    uom: "PC",
    productBarcode: "",
    etimsRefCode: "",
    expiryDate: "",
    class: "Standard",
    qty1Min: "1",
    qty1Max: "3",
    sellingPrice1: "",
    qty2Min: "4",
    qty2Max: "11",
    sellingPrice2: "",
    qty3Min: "12",
    qty3Max: "999",
    sellingPrice3: "",
    images: [],
    image: null,
    imagePreview: null,
    imageUrl: "",
  })

  const [categories, setCategories] = useState([])
  const [subcategories, setSubcategories] = useState([])
  const [loading, setLoading] = useState(false)
  const [imageUploading, setImageUploading] = useState(false)
  const [notification, setNotification] = useState({ open: false, message: "", severity: "success" })
  const [isEditMode, setIsEditMode] = useState(false)
  const [calculatedProfits, setCalculatedProfits] = useState({})
  const [calculatedCashback, setCalculatedCashback] = useState({})
  const [errors, setErrors] = useState({})

  const initialFormState = {
    productName: "",
    productCode: "",
    description: "",
    longerDescription: "",
    category: "",
    subCategory: "",
    costPrice: "",
    vat: "16",
    cashbackRate: "0",
    qty1Min: "1",
    qty1Max: "3",
    qty2Min: "4",
    qty2Max: "11",
    qty3Min: "12",
    qty3Max: "999",
    sellingPrice1: "",
    sellingPrice2: "",
    sellingPrice3: "",
    image: null,
    imagePreview: null,
    imageUrl: "",
  }

  // Function to validate form
  const validateForm = () => {
    const newErrors = {}

    if (!formData.productName?.trim()) {
      newErrors.productName = "Product name is required"
    }

    if (!formData.productCode?.trim()) {
      newErrors.productCode = "Product code is required"
    }

    if (!formData.category?.trim()) {
      newErrors.category = "Category is required"
    }

    if (!formData.costPrice || Number.parseFloat(formData.costPrice) <= 0) {
      newErrors.costPrice = "Valid cost price is required"
    }

    setErrors(newErrors)
    const isValid = Object.keys(newErrors).length === 0
    return isValid
  }

  // Initialize form with edit data if provided
  useEffect(() => {
    if (editItem) {
      setIsEditMode(true)
      setFormData({
        ...editItem,
        imagePreview: editItem.imageUrl || editItem.image || null,
        imageUrl: editItem.imageUrl || "",
      })
    }
  }, [editItem])

  useEffect(() => {
    const loadCategories = async () => {
      try {
        console.log("[v0] Loading categories from API...")
        const response = await categoriesAPI.getAll()

        if (response.data?.success && response.data.data?.categories) {
          console.log("[v0] Categories loaded successfully:", response.data.data.categories)
          setCategories(response.data.data.categories)
        } else {
          console.error("[v0] Failed to load categories:", response.data)
          setNotification({
            open: true,
            message: "Failed to load categories. Using offline data.",
            severity: "warning",
          })
          // Fallback to mock data if API fails
          setCategories([
            {
              id: 1,
              name: "Office Supplies",
              subCategories: [
                { id: 1, name: "Stationery" },
                { id: 2, name: "Filing" },
                { id: 3, name: "Writing Instruments" },
              ],
            },
            {
              id: 2,
              name: "Technology",
              subCategories: [
                { id: 4, name: "Computers" },
                { id: 5, name: "Accessories" },
              ],
            },
          ])
        }
      } catch (error) {
        console.error("[v0] Error loading categories:", error)
        setNotification({
          open: true,
          message: "Failed to connect to server. Using offline categories.",
          severity: "error",
        })
        // Fallback to mock data
        setCategories([
          {
            id: 1,
            name: "Office Supplies",
            subCategories: [
              { id: 1, name: "Stationery" },
              { id: 2, name: "Filing" },
              { id: 3, name: "Writing Instruments" },
            ],
          },
          {
            id: 2,
            name: "Technology",
            subCategories: [
              { id: 4, name: "Computers" },
              { id: 5, name: "Accessories" },
            ],
          },
        ])
      }
    }
    loadCategories()
  }, [])

  // Update subcategories when category changes
  useEffect(() => {
    if (formData.category && categories.length > 0) {
      const selectedCategory = categories.find((cat) => cat.name === formData.category)
      if (selectedCategory && selectedCategory.subCategories) {
        console.log("[v0] Setting subcategories for category:", selectedCategory.name, selectedCategory.subCategories)
        setSubcategories(selectedCategory.subCategories)
        if (!selectedCategory.subCategories.some((sub) => sub.name === formData.subCategory)) {
          setFormData((prev) => ({ ...prev, subCategory: "" }))
        }
      } else {
        console.log("[v0] No subcategories found for category:", formData.category)
        setSubcategories([])
      }
    } else {
      setSubcategories([])
    }
  }, [formData.category, categories])

  // Calculate GP, NP, and Cashback when prices change
  useEffect(() => {
    const costPriceExclVat = Number.parseFloat(formData.costPrice) || 0
    const vatRate = Number.parseFloat(formData.vat) / 100
    const cashbackRate = Number.parseFloat(formData.cashbackRate) / 100

    const calculateProfit = (sellingPriceInclVat) => {
      const sellingPrice = Number.parseFloat(sellingPriceInclVat) || 0
      const sellingPriceExclVat = sellingPrice / (1 + vatRate)
      const gp = sellingPriceExclVat - costPriceExclVat
      const gpPercentage = costPriceExclVat > 0 ? (gp / costPriceExclVat) * 100 : 0
      const npPercentage = sellingPrice > 0 ? (gp / sellingPrice) * 100 : 0

      return {
        gp: gpPercentage.toFixed(2),
        np: npPercentage.toFixed(2),
      }
    }

    const calculateCashback = (sellingPriceInclVat) => {
      const sellingPrice = Number.parseFloat(sellingPriceInclVat) || 0
      const cashbackAmount = sellingPrice * cashbackRate
      return cashbackAmount.toFixed(2)
    }

    setCalculatedProfits({
      ...calculateProfit(formData.sellingPrice1),
      gp2: calculateProfit(formData.sellingPrice2).gp,
      np2: calculateProfit(formData.sellingPrice2).np,
      gp3: calculateProfit(formData.sellingPrice3).gp,
      np3: calculateProfit(formData.sellingPrice3).np,
    })

    setCalculatedCashback({
      cashback1: calculateCashback(formData.sellingPrice1),
      cashback2: calculateCashback(formData.sellingPrice2),
      cashback3: calculateCashback(formData.sellingPrice3),
    })
  }, [
    formData.costPrice,
    formData.sellingPrice1,
    formData.sellingPrice2,
    formData.sellingPrice3,
    formData.vat,
    formData.cashbackRate,
  ])

  const handleMultipleImageSelect = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files)

      // Validate file count (max 5 images)
      if (files.length > 5) {
        setNotification({
          open: true,
          message: "Maximum 5 images allowed",
          severity: "error",
        })
        return
      }

      // Validate each file
      for (const file of files) {
        if (!file.type.startsWith("image/")) {
          setNotification({
            open: true,
            message: "Please select only image files",
            severity: "error",
          })
          return
        }

        if (file.size > 5 * 1024 * 1024) {
          setNotification({
            open: true,
            message: "Each image should be less than 5MB",
            severity: "error",
          })
          return
        }
      }

      handleMultipleImageUpload(files)
    }
  }

  const handleMultipleImageUpload = async (files) => {
    setImageUploading(true)
    try {
      const token = localStorage.getItem("token")
      const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}")
      const userProfile = JSON.parse(localStorage.getItem("userProfile") || "{}")
      
      // Use currentUser first, fallback to userProfile
      const user = currentUser.id ? currentUser : userProfile

      console.log("[v0] Current user for multiple upload:", user)
      console.log("[v0] Token exists:", !!token)

      if (!token) {
        setNotification({
          open: true,
          message: "Authentication required. Please log in as admin to upload images.",
          severity: "error",
        })
        return
      }

      if (!user || user.role !== "admin") {
        setNotification({
          open: true,
          message: "Admin access required. You must be signed in as admin to upload photos.",
          severity: "error",
        })
        return
      }

      const uploadFormData = new FormData()
      files.forEach((file, index) => {
        uploadFormData.append("images", file)
      })

      console.log("[v0] Uploading multiple images:", files.length)
      const response = await uploadAPI.uploadMultipleProductImages(uploadFormData)
      console.log("[v0] Multiple image upload response:", response.data)

      if (response.data && response.data.success && response.data.images) {
        const newImages = response.data.images.map((img, index) => ({
          id: img.id || `temp-${Date.now()}-${index}`,
          image_url: img.image_url || img.imageUrl,
          is_primary: img.is_primary || index === 0,
          preview: null,
        }))

        setFormData((prev) => ({
          ...prev,
          images: [...prev.images, ...newImages],
          imageUrl: prev.imageUrl || newImages[0]?.image_url,
        }))

        setNotification({
          open: true,
          message: `${files.length} image(s) uploaded successfully!`,
          severity: "success",
        })
      } else {
        console.error("[v0] Invalid upload response:", response.data)
        setNotification({
          open: true,
          message: response.data?.error || "Image upload failed",
          severity: "error",
        })
      }
    } catch (error) {
      console.error("[v0] Error uploading images:", error)

      let errorMessage = "Failed to upload images"
      if (error.response?.status === 403) {
        errorMessage =
          error.response.data?.error || "Access denied. Please ensure you're logged in as an admin to upload photos."
      } else if (error.response?.status === 401) {
        errorMessage = error.response.data?.error || "Authentication required. Please log in again as admin."
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message
      }

      setNotification({
        open: true,
        message: errorMessage,
        severity: "error",
      })
    } finally {
      setImageUploading(false)
    }
  }

  const handleImageSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]

      // Validate file type
      if (!file.type.startsWith("image/")) {
        setNotification({
          open: true,
          message: "Please select a valid image file",
          severity: "error",
        })
        return
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setNotification({
          open: true,
          message: "Image size should be less than 5MB",
          severity: "error",
        })
        return
      }

      const reader = new FileReader()
      reader.onload = (event) => {
        const newImage = {
          id: `temp-${Date.now()}`,
          image_url: null,
          is_primary: formData.images.length === 0,
          preview: event.target.result,
          file: file,
        }

        setFormData((prev) => ({
          ...prev,
          images: [...prev.images, newImage],
        }))

        handleSingleImageUpload(file, newImage.id)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSingleImageUpload = async (file, tempId) => {
    setImageUploading(true)
    try {
      const token = localStorage.getItem("token")
      const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}")
      const userProfile = JSON.parse(localStorage.getItem("userProfile") || "{}")
      
      // Use currentUser first, fallback to userProfile
      const user = currentUser.id ? currentUser : userProfile

      console.log("[v0] Current user:", user)
      console.log("[v0] Token exists:", !!token)

      if (!token) {
        setNotification({
          open: true,
          message: "Authentication required. Please log in as admin to upload images.",
          severity: "error",
        })
        return
      }

      if (!user || user.role !== "admin") {
        setNotification({
          open: true,
          message: "Admin access required. You must be signed in as admin to upload photo.",
          severity: "error",
        })
        return
      }

      const uploadFormData = new FormData()
      uploadFormData.append("image", file)
      uploadFormData.append("type", "product")

      console.log("[v0] Uploading single image:", file.name)
      const response = await uploadAPI.uploadProductImage(uploadFormData)
      console.log("[v0] Single image upload response:", response.data)

      if (response.data && response.data.success && response.data.imageUrl) {
        setFormData((prev) => ({
          ...prev,
          images: prev.images.map((img) =>
            img.id === tempId ? { ...img, image_url: response.data.imageUrl, preview: null } : img,
          ),
          imageUrl: prev.imageUrl || response.data.imageUrl,
        }))

        setNotification({
          open: true,
          message: "Image uploaded successfully!",
          severity: "success",
        })
      } else {
        console.error("[v0] Invalid upload response:", response.data)
        setNotification({
          open: true,
          message: response.data?.error || "Image upload failed",
          severity: "error",
        })
      }
    } catch (error) {
      console.error("[v0] Error uploading image:", error)

      let errorMessage = "Failed to upload image"
      if (error.response?.status === 403) {
        errorMessage = error.response.data?.error || "Access denied. You must be signed in as admin to upload photo."
      } else if (error.response?.status === 401) {
        errorMessage = error.response.data?.error || "Authentication required. Please log in again as admin."
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message
      }

      setNotification({
        open: true,
        message: errorMessage,
        severity: "error",
      })

      setFormData((prev) => ({
        ...prev,
        images: prev.images.filter((img) => img.id !== tempId),
      }))
    } finally {
      setImageUploading(false)
    }
  }

  const handleImageRemove = (imageId) => {
    setFormData((prev) => {
      const updatedImages = prev.images.filter((img) => img.id !== imageId)

      // If we removed the primary image, make the first remaining image primary
      if (updatedImages.length > 0) {
        const hadPrimary = prev.images.find((img) => img.id === imageId)?.is_primary
        if (hadPrimary) {
          updatedImages[0].is_primary = true
        }
      }

      return {
        ...prev,
        images: updatedImages,
        imageUrl:
          updatedImages.length > 0
            ? updatedImages.find((img) => img.is_primary)?.image_url || updatedImages[0]?.image_url
            : "",
      }
    })
  }

  const handleSetPrimaryImage = (imageId) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.map((img) => ({
        ...img,
        is_primary: img.id === imageId,
      })),
      imageUrl: prev.images.find((img) => img.id === imageId)?.image_url || prev.imageUrl,
    }))
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    console.log("[v0] Form submission started with data:", formData)

    setLoading(true)

    try {
      let primaryImageUrl = formData.imageUrl
      if (formData.images.length > 0) {
        const primaryImage = formData.images.find((img) => img.is_primary) || formData.images[0]
        primaryImageUrl = primaryImage.image_url || primaryImageUrl
      }

      const submitData = {
        product_name: formData.productName?.trim() || "",
        product_code: formData.productCode?.trim() || "",
        description: formData.description?.trim() || "",
        longer_description: formData.longerDescription?.trim() || "",
        category_name: formData.category?.trim() || "",
        subcategory_name: formData.subCategory?.trim() || null,
        cost_price: Math.max(0.01, Number.parseFloat(formData.costPrice) || 0.01), // Ensure minimum positive value
        vat_rate: Number.parseFloat(formData.vat) || 16,
        cashback_rate: Number.parseFloat(formData.cashbackRate) || 0,
        product_barcode: formData.productBarcode || null,
        etims_ref_code: formData.etimsRefCode || null,
        expiry_date: formData.expiryDate || null,
        class: formData.class || "Standard",
        image_url: primaryImageUrl || null,
        product_images: formData.images.map((img, index) => ({
          image_url: img.image_url,
          is_primary: img.is_primary || index === 0,
          url: img.image_url, // Fallback for compatibility
        })),
        pricing_tiers: [
          {
            tier: 1,
            min_quantity: Number.parseInt(formData.qty1Min) || 1,
            max_quantity: Number.parseInt(formData.qty1Max) || 3,
            selling_price: Number.parseFloat(formData.sellingPrice1) || 0,
          },
          {
            tier: 2,
            min_quantity: Number.parseInt(formData.qty2Min) || 4,
            max_quantity: Number.parseInt(formData.qty2Max) || 11,
            selling_price: Number.parseFloat(formData.sellingPrice2) || 0,
          },
          {
            tier: 3,
            min_quantity: Number.parseInt(formData.qty3Min) || 12,
            max_quantity: Number.parseInt(formData.qty3Max) || 999,
            selling_price: Number.parseFloat(formData.sellingPrice3) || 0,
          },
        ],
      }

      if (
        !submitData.product_name ||
        !submitData.product_code ||
        !submitData.category_name ||
        submitData.cost_price <= 0
      ) {
        console.log("[v0] Final validation failed - missing required fields:", {
          product_name: submitData.product_name,
          product_code: submitData.product_code,
          category_name: submitData.category_name,
          cost_price: submitData.cost_price,
        })
        setNotification({
          open: true,
          message: "Required fields are missing or invalid",
          severity: "error",
        })
        setLoading(false)
        return
      }

      console.log("[v0] Final submit data:", submitData)

      const response = await adminAPI.createProduct(submitData)

      console.log("[v0] Product creation response:", response)

      if (response.data && response.data.success) {
        setNotification({
          open: true,
          message: response.data.message || "Product created successfully!",
          severity: "success",
        })

        // Reset form
        setFormData({
          productName: "",
          productCode: "",
          description: "",
          longerDescription: "",
          category: "",
          subCategory: "",
          costPrice: "",
          vat: "16",
          cashbackRate: "0",
          productBarcode: "",
          etimsRefCode: "",
          expiryDate: "",
          class: "Standard",
          qty1Min: "1",
          qty1Max: "3",
          sellingPrice1: "",
          qty2Min: "4",
          qty2Max: "11",
          sellingPrice2: "",
          qty3Min: "12",
          qty3Max: "999",
          sellingPrice3: "",
          images: [],
          image: null,
          imagePreview: null,
          imageUrl: "",
        })

        if (onRefresh) {
          onRefresh()
        }

        if (onSave) {
          onSave(response.data.data)
        }
      } else {
        console.error("[v0] Product creation failed:", response)
        setNotification({
          open: true,
          message: response.data?.error || "Failed to create product",
          severity: "error",
        })
      }
    } catch (error) {
      console.error("[v0] Product creation error:", error)

      let errorMessage = "Failed to create product"
      if (error.response?.status === 403) {
        errorMessage = "Access denied. Please ensure you're logged in as an admin."
      } else if (error.response?.status === 401) {
        errorMessage = "Authentication required. Please log in again."
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error
      } else if (error.message) {
        errorMessage = error.message
      }

      setNotification({
        open: true,
        message: errorMessage,
        severity: "error",
      })
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData(initialFormState)
    setErrors({})
    setIsEditMode(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleReset = () => {
    resetForm()
  }

  return (
    <Box sx={{ maxWidth: "100%", mx: "auto", p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" color="#1976d2" gutterBottom>
          {editItem ? "Edit Product" : "Add New Product"}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {editItem ? "Update product information" : "Create a new product in your inventory"}
        </Typography>
      </Box>

      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          {/* SECTION 1: BASIC INFORMATION */}
          <Grid item xs={12}>
            <Accordion defaultExpanded sx={{ mb: 3, borderRadius: 2, boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
              <AccordionSummary expandIcon={<ExpandMore />} sx={{ bgcolor: "#f8f9fa", borderRadius: "8px 8px 0 0" }}>
                <Typography variant="h6" fontWeight="600" color="#1976d2">
                  📋 Basic Information
                </Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ p: 3 }}>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Product Name"
                      name="productName"
                      value={formData.productName}
                      onChange={handleChange}
                      required
                      placeholder="Enter product name"
                      variant="outlined"
                      error={!!errors.productName}
                      helperText={errors.productName}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Product Code"
                      name="productCode"
                      value={formData.productCode}
                      onChange={handleChange}
                      required
                      placeholder="Enter unique product code"
                      variant="outlined"
                      error={!!errors.productCode}
                      helperText={errors.productCode}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Typography variant="h6" fontWeight="600" color="#1976d2" gutterBottom>
                      Product Image
                    </Typography>
                    <Paper sx={{ p: 3, bgcolor: "#f8f9fa", borderRadius: 2 }}>
                      <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleImageSelect}
                              style={{ display: "none" }}
                              ref={fileInputRef}
                            />
                            <input
                              type="file"
                              accept="image/*"
                              multiple
                              onChange={handleMultipleImageSelect}
                              style={{ display: "none" }}
                              ref={multipleFileInputRef}
                            />

                            <Stack direction="row" spacing={1}>
                              <Button
                                variant="outlined"
                                startIcon={<PhotoCamera />}
                                onClick={() => fileInputRef.current?.click()}
                                sx={{ textTransform: "none" }}
                                disabled={imageUploading}
                              >
                                {imageUploading ? "Uploading..." : "Add Single Image"}
                              </Button>

                              <Button
                                variant="outlined"
                                startIcon={<PhotoCamera />}
                                onClick={() => multipleFileInputRef.current?.click()}
                                sx={{ textTransform: "none" }}
                                disabled={imageUploading}
                              >
                                Add Multiple Images
                              </Button>
                            </Stack>

                            <Typography variant="caption" color="text.secondary">
                              Supported formats: JPG, PNG, GIF (Max 5MB each, 5 images total)
                            </Typography>
                          </Box>
                        </Grid>

                        <Grid item xs={12} md={6}>
                          {formData.images.length > 0 && (
                            <Box>
                              <Typography variant="subtitle2" gutterBottom>
                                Product Images ({formData.images.length}/5)
                              </Typography>
                              <Grid container spacing={1}>
                                {formData.images.map((image, index) => (
                                  <Grid item xs={6} sm={4} key={image.id}>
                                    <Card sx={{ position: "relative" }}>
                                      <CardMedia
                                        component="img"
                                        height="100"
                                        image={image.image_url || image.preview}
                                        alt={`Product image ${index + 1}`}
                                        sx={{ objectFit: "cover" }}
                                      />

                                      {image.is_primary && (
                                        <Chip
                                          label="Primary"
                                          size="small"
                                          color="primary"
                                          sx={{
                                            position: "absolute",
                                            top: 4,
                                            left: 4,
                                            fontSize: "0.7rem",
                                          }}
                                        />
                                      )}

                                      <Box
                                        sx={{
                                          position: "absolute",
                                          top: 4,
                                          right: 4,
                                          display: "flex",
                                          flexDirection: "column",
                                          gap: 0.5,
                                        }}
                                      >
                                        {!image.is_primary && (
                                          <IconButton
                                            size="small"
                                            onClick={() => handleSetPrimaryImage(image.id)}
                                            sx={{
                                              bgcolor: "rgba(255,255,255,0.8)",
                                              "&:hover": { bgcolor: "rgba(255,255,255,0.9)" },
                                              width: 24,
                                              height: 24,
                                            }}
                                            title="Set as primary"
                                          >
                                            <StarIcon fontSize="small" />
                                          </IconButton>
                                        )}

                                        <IconButton
                                          size="small"
                                          onClick={() => handleImageRemove(image.id)}
                                          sx={{
                                            bgcolor: "rgba(255,255,255,0.8)",
                                            "&:hover": { bgcolor: "rgba(255,255,255,0.9)" },
                                            width: 24,
                                            height: 24,
                                          }}
                                          title="Remove image"
                                        >
                                          <DeleteIcon fontSize="small" />
                                        </IconButton>
                                      </Box>
                                    </Card>
                                  </Grid>
                                ))}
                              </Grid>
                            </Box>
                          )}
                        </Grid>
                      </Grid>
                    </Paper>
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Short Description"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      placeholder="Brief product description"
                      variant="outlined"
                      multiline
                      rows={2}
                    />
                  </Grid>

                  {/* Category and Subcategory Selection */}
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth required error={!!errors.category}>
                      <InputLabel>Category</InputLabel>
                      <Select name="category" value={formData.category} onChange={handleChange} label="Category">
                        {categories.map((category) => (
                          <MenuItem key={category.id} value={category.name}>
                            {category.name}
                          </MenuItem>
                        ))}
                      </Select>
                      {errors.category && (
                        <Typography variant="caption" color="error" sx={{ mt: 1, display: "block" }}>
                          {errors.category}
                        </Typography>
                      )}
                    </FormControl>
                    {categories.length === 0 && (
                      <Typography variant="caption" color="error" sx={{ mt: 1, display: "block" }}>
                        No categories available. Check your connection.
                      </Typography>
                    )}
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>Subcategory</InputLabel>
                      <Select
                        name="subCategory"
                        value={formData.subCategory}
                        onChange={handleChange}
                        label="Subcategory"
                        disabled={!formData.category}
                      >
                        {subcategories.map((subcategory) => (
                          <MenuItem key={subcategory.id} value={subcategory.name}>
                            {subcategory.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    {formData.category && subcategories.length === 0 && (
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block" }}>
                        No subcategories available for this category
                      </Typography>
                    )}
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>Shipping Class</InputLabel>
                      <Select name="class" value={formData.class} onChange={handleChange} label="Shipping Class">
                        <MenuItem value="Standard">Standard</MenuItem>
                        <MenuItem value="Small"></MenuItem>
                        <MenuItem value="Medium">Medium</MenuItem>
                        <MenuItem value="Large">Large</MenuItem>
                        <MenuItem value="Heavy">Heavy</MenuItem>
                        <MenuItem value="Fragile">Fragile</MenuItem>
                       
                      </Select>
                    </FormControl>
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block" }}>
                      Select the appropriate shipping class for this product
                    </Typography>
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Detailed Description"
                      name="longerDescription"
                      value={formData.longerDescription}
                      onChange={handleChange}
                      placeholder="Detailed product description"
                      variant="outlined"
                      multiline
                      rows={3}
                    />
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>
          </Grid>

          {/* SECTION 2: PRICING & COSTING */}
          <Grid item xs={12}>
            <Accordion defaultExpanded sx={{ mb: 3, borderRadius: 2, boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
              <AccordionSummary expandIcon={<ExpandMore />} sx={{ bgcolor: "#f8f9fa", borderRadius: "8px 8px 0 0" }}>
                <Typography variant="h6" fontWeight="600" color="#1976d2">
                  💰 Pricing & Costing
                </Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ p: 3 }}>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Cost Price"
                      name="costPrice"
                      type="number"
                      value={formData.costPrice}
                      onChange={handleChange}
                      InputProps={{
                        startAdornment: <InputAdornment position="start">KSH</InputAdornment>,
                      }}
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="VAT Rate"
                      name="vat"
                      type="number"
                      value={formData.vat}
                      onChange={handleChange}
                      InputProps={{
                        endAdornment: <InputAdornment position="end">%</InputAdornment>,
                      }}
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Customer Cashback Rate"
                      name="cashbackRate"
                      type="number"
                      value={formData.cashbackRate}
                      onChange={handleChange}
                      InputProps={{
                        endAdornment: <InputAdornment position="end">%</InputAdornment>,
                      }}
                      variant="outlined"
                      helperText="Cashback percentage for customers"
                    />
                  </Grid>
                </Grid>

                <Divider sx={{ my: 3 }} />

                {/* Pricing Tiers */}
                <Typography variant="h6" fontWeight="600" color="#1976d2" gutterBottom>
                  Pricing Tiers
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 2, bgcolor: "#f8f9fa" }}>
                      <Typography variant="subtitle2" fontWeight="600" gutterBottom>
                        Tier 1 (Small Orders)
                      </Typography>
                      <Stack spacing={2}>
                        <Box sx={{ display: "flex", gap: 1 }}>
                          <TextField
                            size="small"
                            label="Min Qty"
                            name="qty1Min"
                            type="number"
                            value={formData.qty1Min}
                            onChange={handleChange}
                          />
                          <TextField
                            size="small"
                            label="Max Qty"
                            name="qty1Max"
                            type="number"
                            value={formData.qty1Max}
                            onChange={handleChange}
                          />
                        </Box>
                        <TextField
                          fullWidth
                          label="Selling Price"
                          name="sellingPrice1"
                          type="number"
                          value={formData.sellingPrice1}
                          onChange={handleChange}
                          InputProps={{
                            startAdornment: <InputAdornment position="start">KSH</InputAdornment>,
                          }}
                        />
                      </Stack>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 2, bgcolor: "#f8f9fa" }}>
                      <Typography variant="subtitle2" fontWeight="600" gutterBottom>
                        Tier 2 (Medium Orders)
                      </Typography>
                      <Stack spacing={2}>
                        <Box sx={{ display: "flex", gap: 1 }}>
                          <TextField
                            size="small"
                            label="Min Qty"
                            name="qty2Min"
                            type="number"
                            value={formData.qty2Min}
                            onChange={handleChange}
                          />
                          <TextField
                            size="small"
                            label="Max Qty"
                            name="qty2Max"
                            type="number"
                            value={formData.qty2Max}
                            onChange={handleChange}
                          />
                        </Box>
                        <TextField
                          fullWidth
                          label="Selling Price"
                          name="sellingPrice2"
                          type="number"
                          value={formData.sellingPrice2}
                          onChange={handleChange}
                          InputProps={{
                            startAdornment: <InputAdornment position="start">KSH</InputAdornment>,
                          }}
                        />
                      </Stack>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 2, bgcolor: "#f8f9fa" }}>
                      <Typography variant="subtitle2" fontWeight="600" gutterBottom>
                        Tier 3 (Bulk Orders)
                      </Typography>
                      <Stack spacing={2}>
                        <Box sx={{ display: "flex", gap: 1 }}>
                          <TextField
                            size="small"
                            label="Min Qty"
                            name="qty3Min"
                            type="number"
                            value={formData.qty3Min}
                            onChange={handleChange}
                          />
                          <TextField
                            size="small"
                            label="Max Qty"
                            name="qty3Max"
                            type="number"
                            value={formData.qty3Max}
                            onChange={handleChange}
                            disabled
                            helperText="No limit"
                          />
                        </Box>
                        <TextField
                          fullWidth
                          label="Selling Price"
                          name="sellingPrice3"
                          type="number"
                          value={formData.sellingPrice3}
                          onChange={handleChange}
                          InputProps={{
                            startAdornment: <InputAdornment position="start">KSH</InputAdornment>,
                          }}
                        />
                      </Stack>
                    </Paper>
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>
          </Grid>

          {/* SECTION 3: INVENTORY & ADDITIONAL INFO */}
          <Grid item xs={12}>
            <Accordion defaultExpanded sx={{ mb: 3, borderRadius: 2, boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
              <AccordionSummary expandIcon={<ExpandMore />} sx={{ bgcolor: "#f8f9fa", borderRadius: "8px 8px 0 0" }}>
                <Typography variant="h6" fontWeight="600" color="#1976d2">
                  📦 Inventory & Additional Information
                </Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ p: 3 }}>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Product Barcode"
                      name="productBarcode"
                      value={formData.productBarcode}
                      onChange={handleChange}
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="eTIMS Reference Code"
                      name="etimsRefCode"
                      value={formData.etimsRefCode}
                      onChange={handleChange}
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Expiry Date"
                      name="expiryDate"
                      type="date"
                      value={formData.expiryDate}
                      onChange={handleChange}
                      InputLabelProps={{ shrink: true }}
                      variant="outlined"
                    />
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>
          </Grid>

          {/* Action Buttons */}
          <Grid item xs={12}>
            <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end", mt: 3 }}>
              <Button
                variant="outlined"
                startIcon={<Clear />}
                onClick={onCancel || handleReset}
                sx={{ textTransform: "none", fontWeight: 600 }}
              >
                {onCancel ? "Cancel" : "Reset"}
              </Button>
              <Button
                type="submit"
                variant="contained"
                startIcon={<Save />}
                disabled={loading || imageUploading}
                sx={{
                  bgcolor: "#1976d2",
                  "&:hover": { bgcolor: "#1565c0" },
                  textTransform: "none",
                  fontWeight: 600,
                  px: 4,
                }}
              >
                {loading ? "Saving..." : editItem ? "Update Product" : "Save Product"}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </form>

      {/* Notification Snackbar */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={() => setNotification({ ...notification, open: false })}
      >
        <Alert
          onClose={() => setNotification({ ...notification, open: false })}
          severity={notification.severity}
          sx={{ width: "100%" }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}

export default NewItemForm
