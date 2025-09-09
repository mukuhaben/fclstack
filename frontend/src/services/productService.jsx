import { productsAPI } from "./interceptor.js"

class ProductService {
  // Get all products with proper parameter handling
  async getProducts(params = {}) {
    try {
      const response = await productsAPI.getAll({
        page: params.page || 1,
        limit: params.limit || 10,
        search: params.search || "",
        category: params.category || "",
        sortBy: params.sortBy || "created_at",
        sortOrder: params.sortOrder || "DESC",
      })
      return { success: true, data: response.data }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || "Failed to fetch products",
      }
    }
  }

  // Get single product
  async getProduct(id) {
    try {
      const response = await productsAPI.getById(id)
      return { success: true, data: response.data }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || "Failed to fetch product",
      }
    }
  }

  // Create product with proper field mapping
  async createProduct(productData) {
    try {
      // Format data to match backend expectations
      const formattedData = {
        productName: productData.productName,
        productCode: productData.productCode,
        description: productData.description || "",
        longerDescription: productData.longerDescription || "",
        category: productData.category,
        subCategory: productData.subCategory,
        costPrice: Number.parseFloat(productData.costPrice) || 0,
        vatRate: Number.parseFloat(productData.vat) || 16.0,
        productBarcode: productData.productBarcode || "",
        etimsRefCode: productData.etimsRefCode || "",
        expiryDate: productData.expiryDate || null,
        preferredVendor1: productData.preferredVendor1 || "",
        preferredVendor2: productData.preferredVendor2 || "",
        vendorItemCode: productData.vendorItemCode || "",
        cashbackRate: Number.parseFloat(productData.cashbackRate) || 0.0,
        saCashback1stPurchase: Number.parseFloat(productData.saCashback1stPurchase) || 6.0,
        saCashback2ndPurchase: Number.parseFloat(productData.saCashback2ndPurchase) || 4.0,
        saCashback3rdPurchase: Number.parseFloat(productData.saCashback3rdPurchase) || 3.0,
        saCashback4thPurchase: Number.parseFloat(productData.saCashback4thPurchase) || 2.0,
        pricingTiers: this.formatPricingTiers(productData),
      }

      const response = await productsAPI.create(formattedData)
      return { success: true, data: response.data }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || "Failed to create product",
      }
    }
  }

  // Format pricing tiers from form data
  formatPricingTiers(productData) {
    const tiers = []

    if (productData.sellingPrice1) {
      tiers.push({
        tierName: `Tier 1 (${productData.qty1Min || 1}-${productData.qty1Max || 3} PC)`,
        minQuantity: Number.parseInt(productData.qty1Min) || 1,
        maxQuantity: Number.parseInt(productData.qty1Max) || 3,
        sellingPrice: Number.parseFloat(productData.sellingPrice1),
      })
    }

    if (productData.sellingPrice2) {
      tiers.push({
        tierName: `Tier 2 (${productData.qty2Min || 4}-${productData.qty2Max || 11} PC)`,
        minQuantity: Number.parseInt(productData.qty2Min) || 4,
        maxQuantity: Number.parseInt(productData.qty2Max) || 11,
        sellingPrice: Number.parseFloat(productData.sellingPrice2),
      })
    }

    if (productData.sellingPrice3) {
      tiers.push({
        tierName: `Tier 3 (${productData.qty3Min || 12}+ PC)`,
        minQuantity: Number.parseInt(productData.qty3Min) || 12,
        maxQuantity: null,
        sellingPrice: Number.parseFloat(productData.sellingPrice3),
      })
    }

    return tiers
  }

  // Update product
  async updateProduct(id, productData) {
    try {
      const response = await productsAPI.update(id, productData)
      return { success: true, data: response.data }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || "Failed to update product",
      }
    }
  }

  // Delete product
  async deleteProduct(id) {
    try {
      await productsAPI.delete(id)
      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || "Failed to delete product",
      }
    }
  }

  // Bulk import products
  async bulkImportProducts(products) {
    try {
      const response = await productsAPI.bulkImport(products)
      return { success: true, data: response.data }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || "Failed to import products",
      }
    }
  }
}

export default new ProductService()
