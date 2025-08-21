"use client"

import { useState, useEffect, useCallback, createContext, useContext } from "react"
import { auth_api } from "../services/interceptor.js"
import toast from "react-hot-toast"

import { productsAPI, categoriesAPI, cmsAPI } from '../services/interceptor.js'


const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // Check if user is logged in on app start
  useEffect(() => {
    const token = localStorage.getItem("token")
    const userData = localStorage.getItem("user")

    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData)
        setUser(parsedUser)
        setIsAuthenticated(true)
      } catch (error) {
        console.error("Error parsing user data:", error)
        localStorage.removeItem("token")
        localStorage.removeItem("user")
      }
    }
    setLoading(false)
  }, [])

  const login = async (credentials) => {
    try {
      setLoading(true)
      const response = await authAPI.login(credentials)
      const { token, data } = response.data

      localStorage.setItem("token", token)
      localStorage.setItem("user", JSON.stringify(data.user))

      setUser(data.user)
      setIsAuthenticated(true)

      toast.success("Login successful!")
      return { success: true, user: data.user }
    } catch (error) {
      const message = error.response?.data?.message || "Login failed"
      toast.error(message)
      return { success: false, error: message }
    } finally {
      setLoading(false)
    }
  }

  const register = async (userData) => {
    try {
      setLoading(true)
      const response = await authAPI.register(userData)
      const { token, data } = response.data

      localStorage.setItem("token", token)
      localStorage.setItem("user", JSON.stringify(data.user))

      setUser(data.user)
      setIsAuthenticated(true)

      toast.success("Registration successful!")
      return { success: true, user: data.user }
    } catch (error) {
      const message = error.response?.data?.message || "Registration failed"
      toast.error(message)
      return { success: false, error: message }
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    try {
      await authAPI.logout()
    } catch (error) {
      console.error("Logout error:", error)
    } finally {
      localStorage.removeItem("token")
      localStorage.removeItem("user")
      setUser(null)
      setIsAuthenticated(false)
      toast.success("Logged out successfully")
    }
  }

  const updateProfile = async (profileData) => {
    try {
      const response = await authAPI.updateProfile(profileData)
      const updatedUser = response.data.data.user

      localStorage.setItem("user", JSON.stringify(updatedUser))
      setUser(updatedUser)

      toast.success("Profile updated successfully!")
      return { success: true, user: updatedUser }
    } catch (error) {
      const message = error.response?.data?.message || "Profile update failed"
      toast.error(message)
      return { success: false, error: message }
    }
  }

  const forgotPassword = async (email) => {
    try {
      await authAPI.forgotPassword(email)
      toast.success("Password reset email sent!")
      return { success: true }
    } catch (error) {
      const message = error.response?.data?.message || "Failed to send reset email"
      toast.error(message)
      return { success: false, error: message }
    }
  }

  const resetPassword = async (token, password) => {
    try {
      const response = await authAPI.resetPassword(token, password)
      const { token: newToken, data } = response.data

      localStorage.setItem("token", newToken)
      localStorage.setItem("user", JSON.stringify(data.user))

      setUser(data.user)
      setIsAuthenticated(true)

      toast.success("Password reset successful!")
      return { success: true, user: data.user }
    } catch (error) {
      const message = error.response?.data?.message || "Password reset failed"
      toast.error(message)
      return { success: false, error: message }
    }
  }

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    updateProfile,
    forgotPassword,
    resetPassword,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// Custom hook for data fetching with error handling
export const useApiData = (apiCall, dependencies = []) => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await apiCall()
      setData(response.data)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch data')
      console.error('API Error:', err)
    } finally {
      setLoading(false)
    }
  }, dependencies)

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { data, loading, error, refetch: fetchData }
}

// Hook for products with caching
export const useProducts = (params = {}) => {
  return useApiData(() => productsAPI.getAll(params), [JSON.stringify(params)])
}

// Hook for categories
export const useCategories = () => {
  return useApiData(() => categoriesAPI.getAll())
}

// Hook for featured products
export const useFeaturedProducts = (section) => {
  return useApiData(() => cmsAPI.getFeaturedProducts({ section }), [section])
}

// Hook for CMS content
export const useCMSContent = (contentType) => {
  return useApiData(() => cmsAPI.getHomepageContent(), [contentType])
}

// Hook for navigation menus
export const useNavigationMenus = () => {
  return useApiData(() => cmsAPI.getNavigationMenus())
}