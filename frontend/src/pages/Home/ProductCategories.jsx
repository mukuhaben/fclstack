// import React, { useEffect, useState } from "react";
// import { Link } from "react-router-dom";
// import axios from "axios";

// // Base URL: fallback to localhost if env is not set
// const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

// /**
//  * Recursively render subcategories only (not root category)
//  */
// const SubCategoryList = ({ subCategories }) => {
//   if (!subCategories || subCategories.length === 0) return null;

//   return (
//     <ul className="ml-4 mt-1 list-disc">
//       {subCategories.map((sub) => (
//         <li key={sub.id} className="mb-1">
//           <Link
//             to={`/category/${sub.slug || sub.id}`}
//             className="text-blue-600 hover:underline"
//           >
//             {sub.name}
//           </Link>
//           {sub.subCategories && sub.subCategories.length > 0 && (
//             <SubCategoryList subCategories={sub.subCategories} />
//           )}
//         </li>
//       ))}
//     </ul>
//   );
// };

// /**
//  * Main component
//  */
// const ProductCategories = () => {
//   const [categories, setCategories] = useState([]);
//   const [loading, setLoading]       = useState(true);
//   const [error, setError]           = useState(null);

//   const fetchCategories = async () => {
//     setLoading(true);
//     setError(null);
//     try {
//       const { data } = await axios.get(`${API_URL}/api/categories`);
//       setCategories(data?.data?.categories || []);
//     } catch (err) {
//       console.error("Failed to fetch categories:", err);
//       setError("Unable to load categories. Please try again.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchCategories();
//   }, []);

//   if (loading) return <p className="p-4">Loading categories…</p>;

//   if (error)
//     return (
//       <div className="p-4 text-red-600 space-y-2">
//         <p>{error}</p>
//         <button
//           className="px-3 py-1 border rounded bg-white"
//           onClick={fetchCategories}
//         >
//           Retry
//         </button>
//       </div>
//     );

//   if (categories.length === 0)
//     return <p className="p-4">No categories found.</p>;

//   return (
//     <section className="p-4">
//       <h2 className="text-xl font-semibold mb-6">Product Categories</h2>
//       <div className="space-y-6">
//         {categories.map((cat) => (
//           <div key={cat.id}>
//             <h3 className="text-lg font-bold">{cat.name}</h3>
//             <SubCategoryList subCategories={cat.subCategories} />
//           </div>
//         ))}
//       </div>
//     </section>
//   );
// };

// export default ProductCategories;
"use client"
import { Link } from "react-router-dom"
import { Box, Typography, Alert, Button, Card, CardContent, Skeleton, Chip } from "@mui/material"
import { Refresh as RefreshIcon } from "@mui/icons-material"
import { useCategories } from "../../hooks/useApiData"

/**
 * CHANGE: Enhanced SubCategoryList with Material-UI components
 * Improved styling and accessibility
 */
const SubCategoryList = ({ subCategories, parentCategory }) => {
  if (!subCategories || subCategories.length === 0) return null

  return (
    <Box sx={{ ml: 2, mt: 1 }}>
      {subCategories.map((sub) => (
        <Box key={sub.id} sx={{ mb: 1 }}>
          <Link to={`/category/${sub.slug || sub.id}`} style={{ textDecoration: "none" }}>
            <Chip
              label={sub.name}
              variant="outlined"
              size="small"
              clickable
              sx={{
                mr: 1,
                mb: 0.5,
                "&:hover": {
                  backgroundColor: "primary.light",
                  color: "white",
                },
              }}
            />
          </Link>
          {sub.subCategories && sub.subCategories.length > 0 && (
            <SubCategoryList subCategories={sub.subCategories} parentCategory={parentCategory} />
          )}
        </Box>
      ))}
    </Box>
  )
}

/**
 * CHANGE: Enhanced loading skeleton component
 * Provides better user experience during data loading
 */
const CategorySkeleton = () => (
  <Box sx={{ mb: 3 }}>
    <Skeleton variant="text" width="30%" height={32} sx={{ mb: 1 }} />
    <Box sx={{ ml: 2 }}>
      <Skeleton variant="rectangular" width="20%" height={24} sx={{ mb: 0.5, borderRadius: 1 }} />
      <Skeleton variant="rectangular" width="25%" height={24} sx={{ mb: 0.5, borderRadius: 1 }} />
      <Skeleton variant="rectangular" width="18%" height={24} sx={{ borderRadius: 1 }} />
    </Box>
  </Box>
)

/**
 * CHANGE: Completely refactored main component with API integration
 * Uses custom hook for data fetching and provides comprehensive error handling
 */
const ProductCategories = () => {
  // CHANGE: Use custom hook instead of manual API calls
  const { data: categoriesResponse, loading, error, refetch } = useCategories()

  // CHANGE: Extract categories from API response structure
  const categories = categoriesResponse?.data?.categories || categoriesResponse?.categories || []

  // CHANGE: Enhanced loading state with skeleton components
  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h5" component="h2" gutterBottom>
          Product Categories
        </Typography>
        {[1, 2, 3].map((index) => (
          <CategorySkeleton key={index} />
        ))}
      </Box>
    )
  }

  // CHANGE: Enhanced error state with retry functionality
  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h5" component="h2" gutterBottom>
          Product Categories
        </Typography>
        <Alert
          severity="error"
          sx={{ mb: 2 }}
          action={
            <Button color="inherit" size="small" startIcon={<RefreshIcon />} onClick={refetch}>
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
      </Box>
    )
  }

  // CHANGE: Enhanced empty state
  if (categories.length === 0) {
    return (
      <Box sx={{ p: 3, textAlign: "center" }}>
        <Typography variant="h5" component="h2" gutterBottom>
          Product Categories
        </Typography>
        <Alert severity="info" sx={{ mb: 2 }}>
          No categories available at the moment.
        </Alert>
        <Button variant="outlined" startIcon={<RefreshIcon />} onClick={refetch}>
          Refresh Categories
        </Button>
      </Box>
    )
  }

  // CHANGE: Enhanced rendering with Material-UI components
  return (
    <Box component="section" sx={{ p: 3 }}>
      <Typography variant="h5" component="h2" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
        Product Categories
      </Typography>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
        {categories.map((category) => (
          <Card key={category.id} variant="outlined" sx={{ borderRadius: 2 }}>
            <CardContent>
              <Typography
                variant="h6"
                component="h3"
                sx={{
                  fontWeight: 600,
                  color: "primary.main",
                  mb: category.subCategories?.length > 0 ? 2 : 0,
                }}
              >
                <Link
                  to={`/category/${category.slug || category.id}`}
                  style={{
                    textDecoration: "none",
                    color: "inherit",
                    "&:hover": { textDecoration: "underline" },
                  }}
                >
                  {category.name}
                </Link>
              </Typography>

              {category.description && (
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {category.description}
                </Typography>
              )}

              <SubCategoryList subCategories={category.subCategories} parentCategory={category.name} />
            </CardContent>
          </Card>
        ))}
      </Box>

      {/* CHANGE: Add refresh button for manual data refresh */}
      <Box sx={{ mt: 3, textAlign: "center" }}>
        <Button variant="text" startIcon={<RefreshIcon />} onClick={refetch} size="small">
          Refresh Categories
        </Button>
      </Box>
    </Box>
  )
}

export default ProductCategories
