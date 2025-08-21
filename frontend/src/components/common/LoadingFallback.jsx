import { Box, CircularProgress, Typography, Skeleton } from "@mui/material"

export const LoadingSpinner = ({ size = 40, message = "Loading..." }) => (
  <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" p={4}>
    <CircularProgress size={size} />
    {message && (
      <Typography variant="body2" color="text.secondary" mt={2}>
        {message}
      </Typography>
    )}
  </Box>
)

export const ProductCardSkeleton = () => (
  <Box p={2}>
    <Skeleton variant="rectangular" height={200} />
    <Skeleton variant="text" height={32} sx={{ mt: 1 }} />
    <Skeleton variant="text" height={24} />
    <Skeleton variant="text" height={28} width="60%" />
  </Box>
)

export const CategorySkeleton = () => (
  <Box display="flex" alignItems="center" p={2}>
    <Skeleton variant="circular" width={60} height={60} />
    <Box ml={2} flex={1}>
      <Skeleton variant="text" height={24} width="80%" />
      <Skeleton variant="text" height={20} width="60%" />
    </Box>
  </Box>
)

export const NavigationSkeleton = () => (
  <Box display="flex" gap={2}>
    {[1, 2, 3, 4, 5].map((item) => (
      <Skeleton key={item} variant="text" width={80} height={24} />
    ))}
  </Box>
)

const LoadingFallback = () => null

export default LoadingFallback
