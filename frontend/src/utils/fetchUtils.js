import { appConfig } from '../../../../frontend/src/config/appConfig';

/**
 * Enhanced fetch utility with error handling, retries, and fallbacks
 * 
 * @param {string} url - The URL to fetch
 * @param {Object} options - Fetch options
 * @param {Object} [fallbackData=null] - Data to return if fetch fails
 * @param {number} [timeout=null] - Custom timeout in milliseconds
 * @param {number} [retries=null] - Number of retry attempts
 * @returns {Promise<Object>} - The response data or fallback
 */
export const fetchWithFallback = async (
  url,
  options = {},
  fallbackData = null,
  timeout = null,
  retries = null
) => {
  // Use config values or provided overrides
  const timeoutValue = timeout || appConfig.api.timeout;
  const maxRetries = retries !== null ? retries : appConfig.api.retryAttempts;
  const retryDelay = appConfig.api.retryDelay;
  
  // Add base URL if relative path is provided
  const fullUrl = url.startsWith('http') ? url : `${appConfig.api.baseUrl}${url}`;
  
  // Default headers
  const defaultHeaders = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };
  
  // Merge options with defaults
  const fetchOptions = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };
  
  // Create abort controller for timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutValue);
  fetchOptions.signal = controller.signal;
  
  // Retry logic
  let lastError = null;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      // If not first attempt, wait before retrying
      if (attempt > 0) {
        await new Promise(resolve => setTimeout(resolve, retryDelay * attempt));
        console.log(`Retry attempt ${attempt} for ${url}`);
      }
      
      // Perform fetch
      const response = await fetch(fullUrl, fetchOptions);
      clearTimeout(timeoutId);
      
      // Handle HTTP errors
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || 
          `HTTP error ${response.status}: ${response.statusText}`
        );
      }
      
      // Parse and return successful response
      const data = await response.json();
      return data;
      
    } catch (error) {
      lastError = error;
      
      // Don't retry if it was a timeout or user abort
      if (error.name === 'AbortError') {
        console.error(`Request timeout for ${url}`);
        break;
      }
      
      // Don't retry on final attempt
      if (attempt === maxRetries) {
        console.error(`All retry attempts failed for ${url}`, error);
        break;
      }
    }
  }
  
  // Log the error before returning fallback
  console.error(`Fetch failed for ${url}:`, lastError);
  
  // Return fallback data if provided
  if (fallbackData !== null) {
    console.info(`Using fallback data for ${url}`);
    return fallbackData;
  }
  
  // Re-throw the last error if no fallback
  throw lastError;
};

/**
 * Fetch data with automatic loading state management
 * 
 * @param {Function} setData - State setter for data
 * @param {Function} setLoading - State setter for loading
 * @param {Function} setError - State setter for error
 * @param {string} url - URL to fetch
 * @param {Object} options - Fetch options
 * @param {Object} fallbackData - Data to use if fetch fails
 * @returns {Promise<void>}
 */
export const fetchWithState = async (
  setData,
  setLoading,
  setError,
  url,
  options = {},
  fallbackData = null
) => {
  setLoading(true);
  setError(null);
  
  try {
    const data = await fetchWithFallback(url, options, fallbackData);
    setData(data);
  } catch (error) {
    setError(error.message || appConfig.errorMessages.general);
    if (fallbackData !== null) {
      setData(fallbackData);
    }
  } finally {
    setLoading(false);
  }
};

/**
 * Debounced fetch - useful for search inputs
 * 
 * @param {Function} callback - Function to call with fetched data
 * @param {number} delay - Debounce delay in milliseconds
 * @returns {Function} - Debounced function
 */
export const debouncedFetch = (callback, delay = 300) => {
  let timeoutId;
  
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      callback(...args);
    }, delay);
  };
};

export default {
  fetchWithFallback,
  fetchWithState,
  debouncedFetch
};