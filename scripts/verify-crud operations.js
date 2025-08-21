// CRUD Operations Verification Script
// This script tests all API endpoints to ensure they're working correctly

import axios from "axios"

const API_BASE_URL = process.env.API_URL || "http://localhost:3000/api"

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
})

// Test results storage
const testResults = {
  passed: 0,
  failed: 0,
  errors: [],
}

// Helper function to log test results
function logTest(testName, success, error = null) {
  if (success) {
    console.log(`✅ ${testName}`)
    testResults.passed++
  } else {
    console.log(`❌ ${testName}`)
    testResults.failed++
    if (error) {
      testResults.errors.push({ test: testName, error: error.message })
    }
  }
}

// Test Categories CRUD Operations
async function testCategoriesCRUD() {
  console.log("\n🔍 Testing Categories CRUD Operations...")

  let categoryId = null

  try {
    // Test GET all categories
    const getResponse = await api.get("/categories")
    logTest("GET /categories", getResponse.status === 200)

    // Test CREATE category
    const createData = {
      name: "Test Category",
      description: "Test category for CRUD verification",
    }
    const createResponse = await api.post("/categories", createData)
    logTest("POST /categories", createResponse.status === 201)
    categoryId = createResponse.data?.data?.id

    if (categoryId) {
      // Test GET single category
      const getSingleResponse = await api.get(`/categories/${categoryId}`)
      logTest("GET /categories/:id", getSingleResponse.status === 200)

      // Test UPDATE category
      const updateData = {
        name: "Updated Test Category",
        description: "Updated description",
      }
      const updateResponse = await api.put(`/categories/${categoryId}`, updateData)
      logTest("PUT /categories/:id", updateResponse.status === 200)

      // Test DELETE category
      const deleteResponse = await api.delete(`/categories/${categoryId}`)
      logTest("DELETE /categories/:id", deleteResponse.status === 200)
    }
  } catch (error) {
    logTest("Categories CRUD Operations", false, error)
  }
}

// Test Products CRUD Operations
async function testProductsCRUD() {
  console.log("\n🔍 Testing Products CRUD Operations...")

  let productId = null

  try {
    // Test GET all products
    const getResponse = await api.get("/products")
    logTest("GET /products", getResponse.status === 200)

    // First create a test category for the product
    const categoryData = {
      name: "Test Product Category",
      description: "Category for product testing",
    }
    const categoryResponse = await api.post("/categories", categoryData)
    const categoryName = categoryResponse.data?.data?.name

    if (categoryName) {
      // Test CREATE product
      const createData = {
        product_name: "Test Product",
        product_code: "TEST001",
        description: "Test product for CRUD verification",
        category_name: categoryName,
        cost_price: 100.0,
        vat_rate: 16,
        stock_units: 50,
        pricing_tiers: [
          {
            tier: 1,
            min_qty: 1,
            max_qty: 10,
            selling_price: 130.0,
          },
        ],
      }
      const createResponse = await api.post("/products", createData)
      logTest("POST /products", createResponse.status === 201)
      productId = createResponse.data?.data?.id

      if (productId) {
        // Test GET single product
        const getSingleResponse = await api.get(`/products/${productId}`)
        logTest("GET /products/:id", getSingleResponse.status === 200)

        // Test UPDATE product
        const updateData = {
          product_name: "Updated Test Product",
          description: "Updated description",
          cost_price: 120.0,
        }
        const updateResponse = await api.put(`/products/${productId}`, updateData)
        logTest("PUT /products/:id", updateResponse.status === 200)

        // Test DELETE product
        const deleteResponse = await api.delete(`/products/${productId}`)
        logTest("DELETE /products/:id", deleteResponse.status === 200)
      }

      // Clean up test category
      const categoryId = categoryResponse.data?.data?.id
      if (categoryId) {
        await api.delete(`/categories/${categoryId}`)
      }
    }
  } catch (error) {
    logTest("Products CRUD Operations", false, error)
  }
}

// Test API Endpoint Availability
async function testEndpointAvailability() {
  console.log("\n🔍 Testing API Endpoint Availability...")

  const endpoints = [
    { method: "GET", path: "/categories", description: "Categories list" },
    { method: "GET", path: "/products", description: "Products list" },
    { method: "GET", path: "/health", description: "Health check", baseUrl: "http://localhost:3000" },
  ]

  for (const endpoint of endpoints) {
    try {
      const url = endpoint.baseUrl ? `${endpoint.baseUrl}${endpoint.path}` : endpoint.path
      const response = await (endpoint.baseUrl ? axios.get(url) : api.get(endpoint.path))
      logTest(`${endpoint.method} ${endpoint.path} - ${endpoint.description}`, response.status === 200)
    } catch (error) {
      logTest(`${endpoint.method} ${endpoint.path} - ${endpoint.description}`, false, error)
    }
  }
}

// Test Data Relationships
async function testDataRelationships() {
  console.log("\n🔍 Testing Data Relationships...")

  try {
    // Create category with subcategories
    const categoryData = {
      name: "Office Supplies Test",
      description: "Test category with subcategories",
    }
    const categoryResponse = await api.post("/categories", categoryData)
    const categoryId = categoryResponse.data?.data?.id

    if (categoryId) {
      // Create product in this category
      const productData = {
        product_name: "Test Office Product",
        product_code: "OFF001",
        description: "Product in office supplies category",
        category_name: "Office Supplies Test",
        cost_price: 50.0,
        stock_units: 25,
      }
      const productResponse = await api.post("/products", productData)
      logTest("Product-Category Relationship", productResponse.status === 201)

      // Verify category shows up in product
      const productId = productResponse.data?.data?.id
      if (productId) {
        const productDetails = await api.get(`/products/${productId}`)
        const hasCategory = productDetails.data?.data?.category?.name === "Office Supplies Test"
        logTest("Category Reference in Product", hasCategory)

        // Clean up
        await api.delete(`/products/${productId}`)
      }

      // Clean up category
      await api.delete(`/categories/${categoryId}`)
    }
  } catch (error) {
    logTest("Data Relationships", false, error)
  }
}

// Main test runner
async function runAllTests() {
  console.log("🚀 Starting CRUD Operations Verification...")
  console.log(`📡 Testing API at: ${API_BASE_URL}`)

  await testEndpointAvailability()
  await testCategoriesCRUD()
  await testProductsCRUD()
  await testDataRelationships()

  // Print summary
  console.log("\n📊 Test Summary:")
  console.log(`✅ Passed: ${testResults.passed}`)
  console.log(`❌ Failed: ${testResults.failed}`)
  console.log(
    `📈 Success Rate: ${((testResults.passed / (testResults.passed + testResults.failed)) * 100).toFixed(1)}%`,
  )

  if (testResults.errors.length > 0) {
    console.log("\n🔍 Error Details:")
    testResults.errors.forEach(({ test, error }) => {
      console.log(`  • ${test}: ${error}`)
    })
  }

  if (testResults.failed === 0) {
    console.log("\n🎉 All CRUD operations are working correctly!")
  } else {
    console.log("\n⚠️  Some operations need attention. Check the errors above.")
  }
}

// Run tests
runAllTests().catch(console.error)
