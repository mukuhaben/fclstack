"use client"

import { useState, useEffect } from "react"
import { Box, Card, Typography, TextField, Button, Grid, Alert, Tabs, Tab } from "@mui/material"
import { SaveRounded } from "@mui/icons-material"
import { cmsAPI } from "../../services/api"

const ContentManager = () => {
  const [activeTab, setActiveTab] = useState(0)
  const [content, setContent] = useState({
    homepage: {},
    navigation: [],
    banners: [],
    featured: [],
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")

  useEffect(() => {
    loadContent()
  }, [])

  const loadContent = async () => {
    try {
      setLoading(true)
      const [homepage, navigation, banners, featured] = await Promise.all([
        cmsAPI.getHomepageContent(),
        cmsAPI.getNavigationMenus(),
        cmsAPI.getBanners(),
        cmsAPI.getFeaturedProducts(),
      ])

      setContent({
        homepage: homepage.data,
        navigation: navigation.data,
        banners: banners.data,
        featured: featured.data,
      })
    } catch (error) {
      setMessage("Failed to load content")
    } finally {
      setLoading(false)
    }
  }

  const saveContent = async (type, data) => {
    try {
      setLoading(true)
      await cmsAPI.updateContent(type, data)
      setMessage("Content saved successfully")
      setTimeout(() => setMessage(""), 3000)
    } catch (error) {
      setMessage("Failed to save content")
    } finally {
      setLoading(false)
    }
  }

  const TabPanel = ({ children, value, index }) => (
    <div hidden={value !== index}>{value === index && <Box p={3}>{children}</Box>}</div>
  )

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Content Management System
      </Typography>

      {message && (
        <Alert severity={message.includes("Failed") ? "error" : "success"} sx={{ mb: 2 }}>
          {message}
        </Alert>
      )}

      <Card>
        <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
          <Tab label="Homepage" />
          <Tab label="Navigation" />
          <Tab label="Banners" />
          <Tab label="Featured Products" />
        </Tabs>

        <TabPanel value={activeTab} index={0}>
          <HomepageEditor
            content={content.homepage}
            onSave={(data) => saveContent("homepage", data)}
            loading={loading}
          />
        </TabPanel>

        <TabPanel value={activeTab} index={1}>
          <NavigationEditor
            content={content.navigation}
            onSave={(data) => saveContent("navigation", data)}
            loading={loading}
          />
        </TabPanel>

        <TabPanel value={activeTab} index={2}>
          <BannerEditor content={content.banners} onSave={(data) => saveContent("banners", data)} loading={loading} />
        </TabPanel>

        <TabPanel value={activeTab} index={3}>
          <FeaturedProductsEditor
            content={content.featured}
            onSave={(data) => saveContent("featured", data)}
            loading={loading}
          />
        </TabPanel>
      </Card>
    </Box>
  )
}

const HomepageEditor = ({ content, onSave, loading }) => {
  const [formData, setFormData] = useState({
    hero_title: "",
    hero_subtitle: "",
    hero_cta_text: "",
    hero_cta_link: "",
    about_section: "",
    ...content,
  })

  const handleSave = () => {
    onSave(formData)
  }

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h6" gutterBottom>
          Hero Section
        </Typography>
      </Grid>

      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Hero Title"
          value={formData.hero_title}
          onChange={(e) => setFormData({ ...formData, hero_title: e.target.value })}
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Hero Subtitle"
          value={formData.hero_subtitle}
          onChange={(e) => setFormData({ ...formData, hero_subtitle: e.target.value })}
        />
      </Grid>

      <Grid item xs={12}>
        <TextField
          fullWidth
          multiline
          rows={4}
          label="About Section"
          value={formData.about_section}
          onChange={(e) => setFormData({ ...formData, about_section: e.target.value })}
        />
      </Grid>

      <Grid item xs={12}>
        <Button variant="contained" startIcon={<SaveRounded />} onClick={handleSave} disabled={loading}>
          Save Homepage Content
        </Button>
      </Grid>
    </Grid>
  )
}

const NavigationEditor = ({ content, onSave, loading }) => {
  // Navigation editor implementation
  return <Typography>Navigation Editor - Implementation needed</Typography>
}

const BannerEditor = ({ content, onSave, loading }) => {
  // Banner editor implementation
  return <Typography>Banner Editor - Implementation needed</Typography>
}

const FeaturedProductsEditor = ({ content, onSave, loading }) => {
  // Featured products editor implementation
  return <Typography>Featured Products Editor - Implementation needed</Typography>
}

export default ContentManager
