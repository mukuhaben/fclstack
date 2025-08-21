"use client"

import { useState, useEffect } from "react"
import {
  Box,
  Typography,
  Paper,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Collapse,
  FormControl,
  Select,
  MenuItem,
  Grid,
  Chip,
  CircularProgress,
} from "@mui/material"
import { Edit, Delete, Visibility, Add } from "@mui/icons-material"
import { categoriesAPI } from "../../services/interceptor.js"

export default function CategoryManagement({ onCategoriesChange }) {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [categoryDialog, setCategoryDialog] = useState(false)
  const [subCategoryDialog, setSubCategoryDialog] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [selectedSubCategory, setSelectedSubCategory] = useState(null)
  const [formData, setFormData] = useState({ name: "", description: "", parentCategory: "" })
  const [successMessage, setSuccessMessage] = useState("")
  const [errorMessage, setErrorMessage] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [viewCategoryDialog, setViewCategoryDialog] = useState(false)

  const loadCategories = async () => {
    try {
      setLoading(true)
      console.log("[v0] Loading categories...")
      const response = await categoriesAPI.getAll()
      console.log("[v0] Categories API response:", response.data)

      if (response.data && response.data.success) {
        const categoriesData = response.data.data?.categories || response.data.categories || response.data.data || []
        console.log("[v0] Setting categories:", categoriesData)
        setCategories(Array.isArray(categoriesData) ? categoriesData : [])

        if (onCategoriesChange) {
          onCategoriesChange(Array.isArray(categoriesData) ? categoriesData : [])
        }
      } else {
        console.warn("[v0] API response not successful:", response.data)
        setCategories([])
        setErrorMessage("Failed to load categories. API response was not successful.")
      }
    } catch (error) {
      console.error("Error loading categories:", error)
      setCategories([])
      setErrorMessage("Failed to load categories. Please check your connection and try again.")
      setTimeout(() => setErrorMessage(""), 5000)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCategories()
  }, [])

  useEffect(() => {
    if (onCategoriesChange && categories.length > 0) {
      onCategoriesChange(categories)
    }
  }, [categories, onCategoriesChange])

  const handleOpenCategoryDialog = (category = null) => {
    setEditMode(!!category)
    setSelectedCategory(category)
    setFormData({
      name: category ? category.name : "",
      description: category ? category.description : "",
      parentCategory: "",
    })
    setCategoryDialog(true)
  }

  const handleOpenSubCategoryDialog = (categoryId = null, subCategory = null) => {
    const category = categoryId ? categories.find((cat) => cat.id === categoryId) : null
    setEditMode(!!subCategory)
    setSelectedCategory(category)
    setSelectedSubCategory(subCategory)
    setFormData({
      name: subCategory ? subCategory.name : "",
      description: subCategory ? subCategory.description : "",
      parentCategory: category ? category.id : "",
    })
    setSubCategoryDialog(true)
  }

  const handleCloseDialog = () => {
    setCategoryDialog(false)
    setSubCategoryDialog(false)
    setFormData({ name: "", description: "", parentCategory: "" })
    setSelectedCategory(null)
    setSelectedSubCategory(null)
    setEditMode(false)
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  const handleSaveCategory = async () => {
    if (!formData.name.trim()) {
      setErrorMessage("Category name is required")
      setTimeout(() => setErrorMessage(""), 3000)
      return
    }

    setSubmitting(true)
    try {
      if (editMode) {
        const response = await categoriesAPI.update(selectedCategory.id, {
          name: formData.name,
          description: formData.description,
        })

        if (response.data && response.data.success) {
          setSuccessMessage("Category updated successfully")
          await loadCategories()
        }
      } else {
        const response = await categoriesAPI.create({
          name: formData.name,
          description: formData.description,
        })

        if (response.data && response.data.success) {
          setSuccessMessage("Category added successfully")
          await loadCategories()
        }
      }

      handleCloseDialog()
      setTimeout(() => setSuccessMessage(""), 3000)
    } catch (error) {
      console.error("Error saving category:", error)
      const errorMsg = error.response?.data?.error || "Error saving category"
      setErrorMessage(errorMsg)
      setTimeout(() => setErrorMessage(""), 5000)
    } finally {
      setSubmitting(false)
    }
  }

  const handleSaveSubCategory = async () => {
    if (!formData.name.trim()) {
      setErrorMessage("Subcategory name is required")
      setTimeout(() => setErrorMessage(""), 3000)
      return
    }

    if (!formData.parentCategory) {
      setErrorMessage("Parent category is required")
      setTimeout(() => setErrorMessage(""), 3000)
      return
    }

    setSubmitting(true)
    try {
      if (editMode && selectedSubCategory) {
        const response = await categoriesAPI.updateSubcategory(selectedSubCategory.id, {
          name: formData.name,
          description: formData.description,
          category_id: formData.parentCategory,
        })

        if (response.data && response.data.success) {
          setSuccessMessage("Subcategory updated successfully")
          await loadCategories()
        }
      } else {
        const response = await categoriesAPI.createSubcategory({
          name: formData.name,
          description: formData.description,
          category_id: formData.parentCategory,
        })

        if (response.data && response.data.success) {
          setSuccessMessage("Subcategory added successfully")
          await loadCategories()
        }
      }

      handleCloseDialog()
      setTimeout(() => setSuccessMessage(""), 3000)
    } catch (error) {
      console.error("Error saving subcategory:", error)
      const errorMsg = error.response?.data?.error || "Error saving subcategory"
      setErrorMessage(errorMsg)
      setTimeout(() => setErrorMessage(""), 5000)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteCategory = async (categoryId) => {
    if (!window.confirm("Are you sure you want to delete this category? This action cannot be undone.")) {
      return
    }

    try {
      const response = await categoriesAPI.delete(categoryId)
      if (response.data && response.data.success) {
        setSuccessMessage("Category deleted successfully")
        await loadCategories()
        setTimeout(() => setSuccessMessage(""), 3000)
      }
    } catch (error) {
      console.error("Error deleting category:", error)
      const errorMsg = error.response?.data?.error || "Error deleting category"
      setErrorMessage(errorMsg)
      setTimeout(() => setErrorMessage(""), 5000)
    }
  }

  const handleViewCategory = (category) => {
    setSelectedCategory(category)
    setViewCategoryDialog(true)
  }

  const handleCloseViewDialog = () => {
    setViewCategoryDialog(false)
    setSelectedCategory(null)
  }

  const handleNavigateToCategory = (category) => {
    const categorySlug = category.name
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "")
    window.open(`/category/${categorySlug}`, "_blank")
  }

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "400px" }}>
        <CircularProgress />
        <Typography variant="body1" sx={{ ml: 2 }}>
          Loading categories...
        </Typography>
      </Box>
    )
  }

  return (
    <Box sx={{ maxWidth: 1200, mx: "auto" }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" color="#1976d2" gutterBottom>
          Product Categories
        </Typography>
        <Typography variant="body1" color="text.secondary" gutterBottom sx={{ mb: 3 }}>
          Manage your product categories and subcategories for better organization
        </Typography>
        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => handleOpenCategoryDialog()}
            disabled={submitting}
            sx={{
              bgcolor: "#1976d2",
              "&:hover": { bgcolor: "#1565c0" },
              textTransform: "none",
              fontWeight: 600,
              px: 3,
              py: 1.5,
              borderRadius: 2,
            }}
          >
            Add New Category
          </Button>
          <Button
            variant="outlined"
            startIcon={<Add />}
            onClick={() => handleOpenSubCategoryDialog()}
            disabled={submitting || categories.length === 0}
            sx={{
              borderColor: "#1976d2",
              color: "#1976d2",
              "&:hover": {
                borderColor: "#1565c0",
                bgcolor: "rgba(25, 118, 210, 0.04)",
              },
              textTransform: "none",
              fontWeight: 600,
              px: 3,
              py: 1.5,
              borderRadius: 2,
            }}
          >
            Add New SubCategory
          </Button>
        </Box>
      </Box>

      <Collapse in={!!successMessage}>
        <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setSuccessMessage("")}>
          {successMessage}
        </Alert>
      </Collapse>

      <Collapse in={!!errorMessage}>
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setErrorMessage("")}>
          {errorMessage}
        </Alert>
      </Collapse>

      <Paper sx={{ overflow: "hidden", borderRadius: 2, boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)" }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: "#f8f9fa" }}>
                <TableCell sx={{ fontWeight: 700, fontSize: "0.95rem", color: "#333", width: "5%" }}>#</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: "0.95rem", color: "#333", width: "30%" }}>
                  Category Name
                </TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: "0.95rem", color: "#333", width: "15%" }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: "0.95rem", color: "#333", width: "20%" }}>
                  Subcategories
                </TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: "0.95rem", color: "#333", width: "15%" }}>
                  Created
                </TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: "0.95rem", color: "#333", width: "15%" }}>
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {!Array.isArray(categories) || categories.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    <Typography variant="body1" color="text.secondary">
                      {!Array.isArray(categories)
                        ? "No data in database - categories could not be loaded."
                        : "No categories found. Create your first category to get started."}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                categories.map((category, index) => (
                  <TableRow key={category.id} hover sx={{ "&:hover": { bgcolor: "#f8f9fa" } }}>
                    <TableCell sx={{ fontWeight: 500 }}>{index + 1}</TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body1" sx={{ color: "#1976d2", fontWeight: 600, mb: 0.5 }}>
                          {category.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {category.description || "No description"}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={category.isActive ? "Active" : "Inactive"}
                        size="small"
                        sx={{
                          bgcolor: category.isActive ? "#e8f5e8" : "#ffebee",
                          color: category.isActive ? "#2e7d32" : "#d32f2f",
                          fontWeight: 600,
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {category.subcategories?.length || 0} subcategories
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {category.createdAt ? new Date(category.createdAt).toLocaleDateString() : "N/A"}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: "flex", gap: 1 }}>
                        <Button
                          size="small"
                          variant="contained"
                          onClick={() => handleViewCategory(category)}
                          sx={{
                            bgcolor: "#4caf50",
                            "&:hover": { bgcolor: "#45a049" },
                            minWidth: "auto",
                            px: 1.5,
                            py: 0.5,
                            fontSize: "0.75rem",
                            textTransform: "none",
                          }}
                          startIcon={<Visibility sx={{ fontSize: "14px" }} />}
                        >
                          View
                        </Button>
                        <Button
                          size="small"
                          variant="contained"
                          onClick={() => handleOpenCategoryDialog(category)}
                          disabled={submitting}
                          sx={{
                            bgcolor: "#ff9800",
                            "&:hover": { bgcolor: "#f57c00" },
                            minWidth: "auto",
                            px: 1.5,
                            py: 0.5,
                            fontSize: "0.75rem",
                            textTransform: "none",
                          }}
                          startIcon={<Edit sx={{ fontSize: "14px" }} />}
                        >
                          Edit
                        </Button>
                        <Button
                          size="small"
                          variant="contained"
                          onClick={() => handleDeleteCategory(category.id)}
                          disabled={submitting}
                          sx={{
                            bgcolor: "#f44336",
                            "&:hover": { bgcolor: "#d32f2f" },
                            minWidth: "auto",
                            px: 1,
                            py: 0.5,
                            fontSize: "0.75rem",
                          }}
                        >
                          <Delete sx={{ fontSize: "14px" }} />
                        </Button>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Dialog open={categoryDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ pb: 2 }}>
          <Typography variant="h6" fontWeight="bold">
            {editMode ? "Edit Category" : "Add New Product Category"}
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Category Name"
                name="name"
                placeholder="Enter category name"
                variant="outlined"
                value={formData.name}
                onChange={handleInputChange}
                required
                disabled={submitting}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                  },
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                name="description"
                placeholder="Enter category description"
                variant="outlined"
                value={formData.description}
                onChange={handleInputChange}
                multiline
                rows={3}
                disabled={submitting}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                  },
                }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 2 }}>
          <Button
            onClick={handleCloseDialog}
            disabled={submitting}
            sx={{
              textTransform: "none",
              color: "#666",
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSaveCategory}
            variant="contained"
            disabled={submitting}
            sx={{
              bgcolor: "#1976d2",
              "&:hover": { bgcolor: "#1565c0" },
              textTransform: "none",
              px: 4,
              fontWeight: 600,
            }}
          >
            {submitting ? "Saving..." : editMode ? "Update Category" : "Add Category"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={subCategoryDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ pb: 2 }}>
          <Typography variant="h6" fontWeight="bold">
            {editMode ? "Edit Subcategory" : "Add New SubCategory"}
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="SubCategory Name"
                name="name"
                placeholder="Enter subcategory name"
                variant="outlined"
                value={formData.name}
                onChange={handleInputChange}
                required
                disabled={submitting}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                  },
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                name="description"
                placeholder="Enter subcategory description"
                variant="outlined"
                value={formData.description}
                onChange={handleInputChange}
                multiline
                rows={3}
                disabled={submitting}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                  },
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth required>
                <Select
                  name="parentCategory"
                  value={formData.parentCategory}
                  onChange={handleInputChange}
                  displayEmpty
                  disabled={submitting}
                  sx={{
                    borderRadius: 2,
                  }}
                >
                  <MenuItem value="">
                    <em>Select Parent Category</em>
                  </MenuItem>
                  {Array.isArray(categories) &&
                    categories.map((category) => (
                      <MenuItem key={category.id} value={category.id}>
                        {category.name}
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 2 }}>
          <Button
            onClick={handleCloseDialog}
            disabled={submitting}
            sx={{
              textTransform: "none",
              color: "#666",
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSaveSubCategory}
            variant="contained"
            disabled={submitting}
            sx={{
              bgcolor: "#1976d2",
              "&:hover": { bgcolor: "#1565c0" },
              textTransform: "none",
              px: 4,
              fontWeight: 600,
            }}
          >
            {submitting ? "Saving..." : editMode ? "Update SubCategory" : "Add SubCategory"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={viewCategoryDialog} onClose={handleCloseViewDialog} maxWidth="md" fullWidth>
        <DialogTitle sx={{ pb: 2 }}>
          <Typography variant="h6" fontWeight="bold">
            Category Details
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          {selectedCategory && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="h5" fontWeight="bold" gutterBottom>
                  {selectedCategory.name}
                </Typography>
                <Typography variant="body1" color="text.secondary" gutterBottom sx={{ mb: 2 }}>
                  {selectedCategory.description || "No description provided"}
                </Typography>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle1" fontWeight="600" gutterBottom>
                    Status:
                  </Typography>
                  <Chip
                    label={selectedCategory.isActive ? "Active" : "Inactive"}
                    size="small"
                    sx={{
                      bgcolor: selectedCategory.isActive ? "#e8f5e8" : "#ffebee",
                      color: selectedCategory.isActive ? "#2e7d32" : "#d32f2f",
                      fontWeight: 600,
                    }}
                  />
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle1" fontWeight="600" gutterBottom>
                    Created:
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedCategory.createdAt ? new Date(selectedCategory.createdAt).toLocaleDateString() : "N/A"}
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" fontWeight="600" gutterBottom>
                  Subcategories ({selectedCategory.subcategories?.length || 0}):
                </Typography>
                {selectedCategory.subcategories && selectedCategory.subcategories.length > 0 ? (
                  <Box sx={{ maxHeight: 200, overflowY: "auto" }}>
                    {selectedCategory.subcategories.map((subcategory, index) => (
                      <Box key={subcategory.id} sx={{ mb: 1, p: 1, bgcolor: "#f8f9fa", borderRadius: 1 }}>
                        <Typography variant="body2" fontWeight="500">
                          {subcategory.name}
                        </Typography>
                        {subcategory.description && (
                          <Typography variant="caption" color="text.secondary">
                            {subcategory.description}
                          </Typography>
                        )}
                      </Box>
                    ))}
                  </Box>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No subcategories found
                  </Typography>
                )}
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 2 }}>
          <Button
            onClick={handleCloseViewDialog}
            sx={{
              textTransform: "none",
              color: "#666",
            }}
          >
            Close
          </Button>
          <Button
            onClick={() => handleNavigateToCategory(selectedCategory)}
            variant="outlined"
            sx={{
              textTransform: "none",
              borderColor: "#1976d2",
              color: "#1976d2",
              "&:hover": {
                borderColor: "#1565c0",
                bgcolor: "rgba(25, 118, 210, 0.04)",
              },
            }}
          >
            View on Website
          </Button>
          <Button
            onClick={() => {
              handleCloseViewDialog()
              handleOpenCategoryDialog(selectedCategory)
            }}
            variant="contained"
            sx={{
              bgcolor: "#1976d2",
              "&:hover": { bgcolor: "#1565c0" },
              textTransform: "none",
              px: 4,
              fontWeight: 600,
            }}
          >
            Edit Category
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
