"use client"

import { useState } from "react"
import { Box, Typography } from "@mui/material"
import { ImageNotSupportedRounded } from "@mui/icons-material"

const PlaceholderImage = ({
  src,
  alt = "Image",
  width = "100%",
  height = 200,
  fallbackText = "No Image Available",
  ...props
}) => {
  const [imageError, setImageError] = useState(false)
  const [imageLoading, setImageLoading] = useState(true)

  const handleImageError = () => {
    setImageError(true)
    setImageLoading(false)
  }

  const handleImageLoad = () => {
    setImageLoading(false)
  }

  if (imageError || !src) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        width={width}
        height={height}
        bgcolor="grey.100"
        color="grey.500"
        {...props}
      >
        <ImageNotSupportedRounded sx={{ fontSize: 48, mb: 1 }} />
        <Typography variant="caption" textAlign="center">
          {fallbackText}
        </Typography>
      </Box>
    )
  }

  return (
    <Box position="relative" width={width} height={height}>
      {imageLoading && (
        <Box
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          display="flex"
          alignItems="center"
          justifyContent="center"
          bgcolor="grey.100"
        >
          <Typography variant="caption" color="grey.500">
            Loading...
          </Typography>
        </Box>
      )}
      <img
        src={src || "/placeholder.svg"}
        alt={alt}
        onError={handleImageError}
        onLoad={handleImageLoad}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          display: imageLoading ? "none" : "block",
        }}
        {...props}
      />
    </Box>
  )
}

export default PlaceholderImage
