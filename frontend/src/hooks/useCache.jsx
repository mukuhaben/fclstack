"use client"

import { useState, useEffect, useRef } from "react"

const cache = new Map()
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

export const useCache = (key, fetcher, options = {}) => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const abortControllerRef = useRef(null)

  const { cacheDuration = CACHE_DURATION, forceRefresh = false, dependencies = [] } = options

  useEffect(() => {
    const fetchData = async () => {
      // Cancel previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }

      // Create new abort controller
      abortControllerRef.current = new AbortController()

      try {
        setLoading(true)
        setError(null)

        // Check cache first
        const cacheKey = `${key}_${JSON.stringify(dependencies)}`
        const cached = cache.get(cacheKey)

        if (cached && !forceRefresh && Date.now() - cached.timestamp < cacheDuration) {
          setData(cached.data)
          setLoading(false)
          return
        }

        // Fetch fresh data
        const result = await fetcher({ signal: abortControllerRef.current.signal })

        // Cache the result
        cache.set(cacheKey, {
          data: result,
          timestamp: Date.now(),
        })

        setData(result)
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(err.message || "Failed to fetch data")
        }
      } finally {
        setLoading(false)
      }
    }

    fetchData()

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [key, forceRefresh, cacheDuration, ...dependencies])

  return { data, loading, error }
}
