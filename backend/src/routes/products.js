import express from "express"
import { query, transaction } from "../utils/database.js"
import { requireRole } from "../middleware/auth.js"

const router = express.Router()

// GET /api/products - Get all products with filtering
router.get("/", async (req, res) => {
  try {
    console.log("[v0] Products API called with query:", req.query)

    const {
      page = 1,
      limit = 12,
      search = "",
      categoryId,
      categoryName,
      categorySlug, // Added categorySlug parameter
      subcategoryName,
      subcategorySlug, // Added subcategorySlug parameter
      minPrice,
      maxPrice,
      sortBy = "created_at",
      sortOrder = "desc",
      includeInactive = false,
    } = req.query

    const offset = (page - 1) * limit
    let whereClause = includeInactive ? "WHERE 1=1" : "WHERE p.is_active = true"
    const queryParams = []
    let paramCount = 0

    // Add search filters
    if (search) {
      paramCount++
      whereClause += ` AND (p.name ILIKE $${paramCount} OR p.description ILIKE $${paramCount})`
      queryParams.push(`%${search}%`)
    }

    if (categoryId) {
      paramCount++
      whereClause += ` AND p.category_id = $${paramCount}`
      queryParams.push(categoryId)
    }

    if (categorySlug && subcategorySlug) {
      // Case 1: Both categorySlug and subcategorySlug present - require exact match for both
      paramCount++
      whereClause += ` AND c.slug = $${paramCount}`
      queryParams.push(categorySlug)
      paramCount++
      whereClause += ` AND sc.slug = $${paramCount}`
      queryParams.push(subcategorySlug)
      console.log("[v0] Filtering by both categorySlug and subcategorySlug:", { categorySlug, subcategorySlug })
    } else if (subcategorySlug) {
      // Case 2: Only subcategorySlug present - exact match on subcategory
      paramCount++
      whereClause += ` AND sc.slug = $${paramCount}`
      queryParams.push(subcategorySlug)
      console.log("[v0] Filtering by subcategorySlug only:", subcategorySlug)
    } else if (categorySlug) {
      // Case 3: Only categorySlug present - exact match on category
      paramCount++
      whereClause += ` AND c.slug = $${paramCount}`
      queryParams.push(categorySlug)
      console.log("[v0] Filtering by categorySlug only:", categorySlug)
    } else if (categoryName) {
      // Legacy support: Try to match categoryName as subcategory slug first, then category slug
      paramCount++
      const slugifiedName = categoryName.toLowerCase().replace(/\s+/g, "-")
      whereClause += ` AND (sc.slug = $${paramCount} OR c.slug = $${paramCount})`
      queryParams.push(slugifiedName)
      queryParams.push(slugifiedName)
      paramCount++ // We added 2 parameters but only increment by 1 more
      console.log("[v0] Legacy categoryName filtering with slugified name:", slugifiedName)
    } else if (subcategoryName) {
      // Legacy support: Match subcategoryName as slug
      paramCount++
      const slugifiedName = subcategoryName.toLowerCase().replace(/\s+/g, "-")
      whereClause += ` AND sc.slug = $${paramCount}`
      queryParams.push(slugifiedName)
      console.log("[v0] Legacy subcategoryName filtering with slugified name:", slugifiedName)
    }

    // Add price filters
    if (minPrice) {
      paramCount++
      whereClause += ` AND COALESCE(p.price, p.cost_price, 0) >= $${paramCount}`
      queryParams.push(minPrice)
    }

    if (maxPrice) {
      paramCount++
      whereClause += ` AND COALESCE(p.price, p.cost_price, 0) <= $${paramCount}`
      queryParams.push(maxPrice)
    }

    console.log("[v0] Final query parameters:", { whereClause, queryParams, paramCount })

    try {
      const result = await query(
        `SELECT p.id, 
                COALESCE(p.name, '') as name, 
                COALESCE(p.description, '') as description,
                COALESCE(p.longer_description, '') as longer_description,
                COALESCE(p.price, p.cost_price, 0) as price, 
                COALESCE(p.sku, p.product_code, '') as sku, 
                COALESCE(p.product_code, '') as item_code,
                COALESCE(p.is_active, true) as is_active, 
                p.created_at,
                COALESCE(p.image_url, '') as image_url, 
                COALESCE(p.cost_price, 0) as cost_price, 
                COALESCE(p.vat_rate, 16) as vat_rate, 
                COALESCE(p.cashback_rate, 0) as cashback_rate,
                COALESCE(p.class, 'Standard') as class,
                COALESCE(c.name, 'Uncategorized') as category_name, 
                COALESCE(c.slug, '') as category_slug,
                p.category_id,
                COALESCE(sc.name, '') as subcategory_name, 
                COALESCE(sc.slug, '') as subcategory_slug,
                p.subcategory_id,
                COALESCE(pi_primary.image_url, pi_first.image_url, p.image_url, '') as primary_image,
                array_agg(
                  jsonb_build_object(
                    'tier', ppt.id,
                    'min_quantity', ppt.min_quantity,
                    'minQuantity', ppt.min_quantity,
                    'max_quantity', ppt.max_quantity,
                    'maxQuantity', ppt.max_quantity,
                    'selling_price', ppt.selling_price,
                    'sellingPrice', ppt.selling_price
                  ) ORDER BY ppt.min_quantity ASC
                ) FILTER (WHERE ppt.id IS NOT NULL) as pricing_tiers,
               array_agg(
  jsonb_build_object(
    'id', pv.id,
    'variant_type', pv.variant_type,
    'variantType', pv.variant_type,
    'variant_value', pv.variant_value,
    'variantValue', pv.variant_value,
    'price_adjustment', COALESCE(pv.price_adjustment, 0),
    'priceAdjustment', COALESCE(pv.price_adjustment, 0),
    'stock_quantity', COALESCE(pv.stock_quantity, 0),
    'stockQuantity', COALESCE(pv.stock_quantity, 0)
  ) ORDER BY pv.variant_type, pv.variant_value
) FILTER (WHERE pv.id IS NOT NULL) as variants

         FROM products p
         LEFT JOIN categories c ON p.category_id = c.id
         LEFT JOIN subcategories sc ON p.subcategory_id = sc.id AND sc.category_id = c.id
         LEFT JOIN product_images pi_primary ON p.id = pi_primary.product_id AND pi_primary.is_primary = true
         LEFT JOIN product_images pi_first ON p.id = pi_first.product_id AND pi_first.id = (
           SELECT MIN(id) FROM product_images WHERE product_id = p.id
         )
         LEFT JOIN product_pricing_tiers ppt ON p.id = ppt.product_id
         LEFT JOIN product_variants pv ON p.id = pv.product_id
         ${whereClause}
         GROUP BY p.id, p.name, p.description, p.longer_description, p.price, p.sku, p.product_code, p.is_active, p.created_at, 
                  p.image_url, p.cost_price, p.vat_rate, p.cashback_rate, p.class, c.name, c.slug, p.category_id, 
                  sc.name, sc.slug, p.subcategory_id, pi_primary.image_url, pi_first.image_url
         ORDER BY p.${sortBy === "name" ? "name" : "created_at"} ${sortOrder.toUpperCase()}
         LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`,
        [...queryParams, limit, offset],
      )

      // Get total count for pagination
      const countResult = await query(
        `SELECT COUNT(DISTINCT p.id) as count
         FROM products p
         LEFT JOIN categories c ON p.category_id = c.id
         LEFT JOIN subcategories sc ON p.subcategory_id = sc.id AND sc.category_id = c.id
         ${whereClause}`,
        queryParams,
      )

      const totalProducts = Number.parseInt(countResult.rows[0]?.count || 0)
      console.log("[v0] Main query returned:", result.rows.length, "products, total:", totalProducts)

      res.json({
        success: true,
        data: result.rows.map((product) => ({
          id: product.id,
          name: product.name || "Unnamed Product",
          description: product.description || "",
          longer_description: product.longer_description || "",
          longerDescription: product.longer_description || "", // camelCase alias
          price: Number.parseFloat(product.price || 0),
          sku: product.sku || "",
          item_code: product.item_code || "", // snake_case for consistency with cart/orders
          itemCode: product.item_code || "", // camelCase alias
          product_code: product.item_code || "", // alias for backward compatibility
          productCode: product.item_code || "", // camelCase alias
          isActive: product.is_active !== false,
          imageUrl: product.primary_image || product.image_url || "",
          image: product.primary_image || product.image_url || "", // alias for frontend
          primaryImage: product.primary_image || product.image_url || "", // explicit primary image
          costPrice: Number.parseFloat(product.cost_price || 0),
          vatRate: Number.parseFloat(product.vat_rate || 16),
          cashbackRate: Number.parseFloat(product.cashback_rate || 0),
          cashback_rate: Number.parseFloat(product.cashback_rate || 0), // snake_case alias
          class: product.class || "Standard", // Added shipping class field
          shippingClass: product.class || "Standard", // camelCase alias
          category: {
            id: product.category_id,
            name: product.category_name || "Uncategorized",
            slug: product.category_slug || "", // Added category slug to response
          },
          subcategory: product.subcategory_id
            ? {
                id: product.subcategory_id,
                name: product.subcategory_name || "Unknown Subcategory",
                slug: product.subcategory_slug || "", // Added subcategory slug to response
              }
            : null,
          pricing_tiers: product.pricing_tiers || [], // snake_case for consistency
          pricingTiers: product.pricing_tiers || [], // camelCase alias
          variants: product.variants || [], // Added variants support
          stockQuantity: 0, // placeholder - add stock logic if needed
          stock: 0, // alias for frontend
          createdAt: product.created_at,
        })),
        pagination: {
          page: Number.parseInt(page),
          limit: Number.parseInt(limit),
          total: totalProducts,
          totalPages: Math.ceil(totalProducts / limit),
        },
      })
    } catch (dbError) {
      console.error("[v0] Database query error:", dbError)

      if (categorySlug || subcategorySlug || categoryName || subcategoryName) {
        console.error("[v0] Filtered query failed - not using fallback to expose the issue")
        res.status(500).json({
          error: "Database query failed for filtered products",
          details: dbError.message,
          success: false,
          data: [],
        })
        return
      }

      // Only use fallback for unfiltered requests
      try {
        console.log("[v0] Attempting fallback query for unfiltered products...")
        const fallbackResult = await query(
          `SELECT id, 
                  COALESCE(name, '') as name,
                  COALESCE(description, '') as description,
                  COALESCE(longer_description, '') as longer_description,
                  COALESCE(price, cost_price, 0) as price,
                  COALESCE(image_url, '') as image_url,
                  COALESCE(product_code, '') as item_code,
                  COALESCE(is_active, true) as is_active,
                  COALESCE(cashback_rate, 0) as cashback_rate,
                  created_at,
                  category_id,
                  subcategory_id
           FROM products 
           WHERE ${includeInactive ? "1=1" : "COALESCE(is_active, true) = true"}
           ORDER BY created_at DESC 
           LIMIT $1 OFFSET $2`,
          [limit, offset],
        )

        console.log(`[v0] Fallback query returned ${fallbackResult.rows.length} products`)

        res.json({
          success: true,
          data: fallbackResult.rows.map((product) => ({
            id: product.id,
            name: product.name || "Unnamed Product",
            description: product.description || "",
            longer_description: product.longer_description || "",
            longerDescription: product.longer_description || "",
            price: Number.parseFloat(product.price || 0),
            sku: "",
            item_code: product.item_code || "",
            itemCode: product.item_code || "",
            product_code: product.item_code || "",
            productCode: product.item_code || "",
            isActive: product.is_active !== false,
            imageUrl: product.image_url || "",
            image: product.image_url || "",
            primaryImage: product.image_url || "",
            image_url: product.image_url || "",
            costPrice: Number.parseFloat(product.price || 0),
            vatRate: 16,
            cashbackRate: Number.parseFloat(product.cashback_rate || 0),
            cashback_rate: Number.parseFloat(product.cashback_rate || 0),
            category: {
              id: product.category_id,
              name: "Unknown Category",
            },
            subcategory: null,
            pricing_tiers: [],
            pricingTiers: [],
            stockQuantity: 0,
            stock: 0,
            createdAt: product.created_at,
          })),
          pagination: {
            page: Number.parseInt(page),
            limit: Number.parseInt(limit),
            total: fallbackResult.rows.length,
            totalPages: Math.ceil(fallbackResult.rows.length / limit),
          },
          message: "Products loaded with basic information (some details may be missing due to database schema issues)",
        })
      } catch (fallbackError) {
        console.error("[v0] Fallback query also failed:", fallbackError)
        res.json({
          success: true,
          data: [],
          pagination: {
            page: Number.parseInt(page),
            limit: Number.parseInt(limit),
            total: 0,
            totalPages: 0,
          },
          message: "No products found - database may need schema updates",
        })
      }
    }
  } catch (error) {
    console.error("[v0] Products fetch error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

// GET /api/products/top - Get top products
router.get("/top", async (req, res) => {
  try {
    const { limit = 10, period = "30" } = req.query

    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - Number.parseInt(period))

    const result = await query(
      `SELECT p.id, p.name, p.price,
             COALESCE(pi_primary.image_url, pi_first.image_url, p.image_url) as image_url,
             COUNT(oi.id) as sales_count,
             SUM(oi.quantity * oi.price) as total_revenue,
             AVG(oi.price) as avg_price
      FROM products p
      LEFT JOIN product_images pi_primary ON p.id = pi_primary.product_id AND pi_primary.is_primary = true
      LEFT JOIN product_images pi_first ON p.id = pi_first.product_id AND pi_first.id = (
        SELECT MIN(id) FROM product_images WHERE product_id = p.id
      )
      LEFT JOIN order_items oi ON p.id = oi.product_id
      LEFT JOIN orders o ON oi.order_id = o.id AND o.created_at >= $1 AND o.status = 'delivered'
      WHERE p.is_active = true
      GROUP BY p.id, p.name, p.price, pi_primary.image_url, pi_first.image_url
      HAVING COUNT(oi.id) > 0
      ORDER BY sales_count DESC, total_revenue DESC
      LIMIT $2`,
      [startDate, limit],
    )

    res.json({
      success: true,
      products: result.rows.map((product) => ({
        id: product.id,
        name: product.name,
        imageUrl: product.image_url,
        sales: Number.parseInt(product.sales_count || 0),
        revenue: `KSh ${Number.parseFloat(product.total_revenue || 0).toLocaleString()}`,
        trend: "up", // Default trend, could be calculated based on historical data
        growth: "+15%", // Default growth, could be calculated based on historical data
      })),
    })
  } catch (error) {
    console.error("Top products fetch error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

// GET /api/products/:id - Get single product
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params

    const result = await query(
      `SELECT p.*, c.name as category_name, sc.name as subcategory_name,
              COALESCE(pi_primary.image_url, pi_first.image_url, p.image_url) as primary_image_url,
              array_agg(DISTINCT jsonb_build_object(
                'id', pi.id,
                'image_url', pi.image_url,
                'is_primary', pi.is_primary
              ) ORDER BY pi.is_primary DESC, pi.created_at ASC) FILTER (WHERE pi.id IS NOT NULL) as images,
              array_agg(DISTINCT jsonb_build_object(
                'tier', ppt.id,
                'min_quantity', ppt.min_quantity,
                'minQuantity', ppt.min_quantity,
                'max_quantity', ppt.max_quantity,
                'maxQuantity', ppt.max_quantity,
                'selling_price', ppt.selling_price,
                'sellingPrice', ppt.selling_price
              ) ORDER BY ppt.min_quantity ASC) FILTER (WHERE ppt.id IS NOT NULL) as pricing_tiers,
              array_agg(DISTINCT jsonb_build_object(
                'id', pv.id,
                'variant_type', pv.variant_type,
                'variantType', pv.variant_type,
                'variant_value', pv.variant_value,
                'variantValue', pv.variant_value,
                'price_adjustment', COALESCE(pv.price_adjustment, 0),
                'priceAdjustment', COALESCE(pv.price_adjustment, 0),
                'stock_quantity', COALESCE(pv.stock_quantity, 0),
                'stockQuantity', COALESCE(pv.stock_quantity, 0)
              ) ORDER BY pv.variant_type, pv.variant_value) FILTER (WHERE pv.id IS NOT NULL) as variants
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       LEFT JOIN subcategories sc ON p.subcategory_id = sc.id
       LEFT JOIN product_images pi ON p.id = pi.product_id
       LEFT JOIN product_images pi_primary ON p.id = pi_primary.product_id AND pi_primary.is_primary = true
       LEFT JOIN product_images pi_first ON p.id = pi_first.product_id AND pi_first.id = (
         SELECT MIN(id) FROM product_images WHERE product_id = p.id
       )
       LEFT JOIN product_pricing_tiers ppt ON p.id = ppt.product_id
       LEFT JOIN product_variants pv ON p.id = pv.product_id
       WHERE p.id = $1 AND p.is_active = true
       GROUP BY p.id, c.name, sc.name, pi_primary.image_url, pi_first.image_url`,
      [id],
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Product not found" })
    }

    const product = result.rows[0]

    const images = product.images || []
    const primaryImage = images.find((img) => img.is_primary)
    const allImageUrls = images.map((img) => img.image_url)

    res.json({
      success: true,
      data: {
        id: product.id,
        name: product.name,
        description: product.description,
        longer_description: product.longer_description,
        longerDescription: product.longer_description,
        price: Number.parseFloat(product.price),
        sku: product.sku,
        itemCode: product.product_code, // Added product code support
        product_code: product.product_code,
        productCode: product.product_code,
        imageUrl: product.primary_image_url || product.image_url || "",
        image: product.primary_image_url || product.image_url || "",
        primaryImage: product.primary_image_url || product.image_url || "",
        image_url: product.primary_image_url || product.image_url || "",
        costPrice: product.cost_price,
        vatRate: product.vat_rate,
        cashbackRate: product.cashback_rate,
        cashback_rate: product.cashback_rate,
        class: product.class || "Standard", // Added shipping class field
        shippingClass: product.class || "Standard", // camelCase alias
        category: {
          id: product.category_id,
          name: product.category_name,
        },
        subcategory: product.subcategory_id
          ? {
              id: product.subcategory_id,
              name: product.subcategory_name,
            }
          : null,
        images: allImageUrls,
        productImages: images,
        pricingTiers: product.pricing_tiers || [], // Added pricing tiers support
        pricing_tiers: product.pricing_tiers || [],
        variants: product.variants || [], // Added variants support
        stockQuantity: 0,
        stock: 0,
        createdAt: product.created_at,
      },
    })
  } catch (error) {
    console.error("Product fetch error:", error)
    res.status(500).json({ error: "Failed to fetch product" })
  }
})

// GET /api/products/subcategory/:subcategorySlug - Get products by subcategory slug
router.get("/subcategory/:subcategorySlug", async (req, res) => {
  try {
    const { subcategorySlug } = req.params
    const {
      page = 1,
      limit = 12,
      search = "",
      minPrice,
      maxPrice,
      sortBy = "created_at",
      sortOrder = "desc",
      includeInactive = false,
    } = req.query

    console.log("[v0] Subcategory products API called with slug:", subcategorySlug)

    const offset = (page - 1) * limit
    let whereClause = includeInactive ? "WHERE sc.slug = $1" : "WHERE sc.slug = $1 AND p.is_active = true"
    const queryParams = [subcategorySlug]
    let paramCount = 1

    // Add search filters
    if (search) {
      paramCount++
      whereClause += ` AND (p.name ILIKE $${paramCount} OR p.description ILIKE $${paramCount})`
      queryParams.push(`%${search}%`)
    }

    if (minPrice) {
      paramCount++
      whereClause += ` AND COALESCE(p.price, p.cost_price, 0) >= $${paramCount}`
      queryParams.push(minPrice)
    }

    if (maxPrice) {
      paramCount++
      whereClause += ` AND COALESCE(p.price, p.cost_price, 0) <= $${paramCount}`
      queryParams.push(maxPrice)
    }

    console.log("[v0] Subcategory query parameters:", { whereClause, queryParams, paramCount })

    const result = await query(
      `SELECT p.id, 
              COALESCE(p.name, '') as name, 
              COALESCE(p.description, '') as description,
              COALESCE(p.longer_description, '') as longer_description,
              COALESCE(p.price, p.cost_price, 0) as price, 
              COALESCE(p.sku, p.product_code, '') as sku, 
              COALESCE(p.product_code, '') as item_code,
              COALESCE(p.is_active, true) as is_active, 
              p.created_at,
              COALESCE(p.image_url, '') as image_url, 
              COALESCE(p.cost_price, 0) as cost_price, 
              COALESCE(p.vat_rate, 16) as vat_rate, 
              COALESCE(p.cashback_rate, 0) as cashback_rate,
              COALESCE(c.name, 'Uncategorized') as category_name, 
              p.category_id,
              COALESCE(sc.name, '') as subcategory_name, 
              p.subcategory_id,
              COALESCE(pi_primary.image_url, pi_first.image_url, p.image_url, '') as primary_image,
              array_agg(
                jsonb_build_object(
                  'tier', ppt.id,
                  'min_quantity', ppt.min_quantity,
                  'minQuantity', ppt.min_quantity,
                  'max_quantity', ppt.max_quantity,
                  'maxQuantity', ppt.max_quantity,
                  'selling_price', ppt.selling_price,
                  'sellingPrice', ppt.selling_price
                ) ORDER BY ppt.min_quantity ASC
              ) FILTER (WHERE ppt.id IS NOT NULL) as pricing_tiers
       FROM products p
       INNER JOIN subcategories sc ON p.subcategory_id = sc.id
       LEFT JOIN categories c ON p.category_id = c.id
       LEFT JOIN product_images pi_primary ON p.id = pi_primary.product_id AND pi_primary.is_primary = true
       LEFT JOIN product_images pi_first ON p.id = pi_first.product_id AND pi_first.id = (
         SELECT MIN(id) FROM product_images WHERE product_id = p.id
       )
       LEFT JOIN product_pricing_tiers ppt ON p.id = ppt.product_id
       ${whereClause}
       GROUP BY p.id, p.name, p.description, p.longer_description, p.price, p.sku, p.product_code, p.is_active, p.created_at, 
                p.image_url, p.cost_price, p.vat_rate, p.cashback_rate, c.name, p.category_id, 
                sc.name, p.subcategory_id, pi_primary.image_url, pi_first.image_url
       ORDER BY p.${sortBy === "name" ? "name" : "created_at"} ${sortOrder.toUpperCase()}
       LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`,
      [...queryParams, limit, offset],
    )

    // Get total count for pagination
    const countResult = await query(
      `SELECT COUNT(DISTINCT p.id) as count
       FROM products p
       INNER JOIN subcategories sc ON p.subcategory_id = sc.id
       LEFT JOIN categories c ON p.category_id = c.id
       ${whereClause}`,
      queryParams,
    )

    const totalProducts = Number.parseInt(countResult.rows[0]?.count || 0)
    console.log("[v0] Subcategory query returned:", result.rows.length, "products, total:", totalProducts)

    // Get subcategory info for response
    const subcategoryInfo = await query(
      `SELECT sc.id, sc.name, sc.description, sc.slug,
              c.id as category_id, c.name as category_name, c.slug as category_slug
       FROM subcategories sc
       LEFT JOIN categories c ON sc.category_id = c.id
       WHERE sc.slug = $1`,
      [subcategorySlug],
    )

    const subcategory = subcategoryInfo.rows[0] || null

    res.json({
      success: true,
      data: result.rows.map((product) => ({
        id: product.id,
        name: product.name || "Unnamed Product",
        description: product.description || "",
        longer_description: product.longer_description || "",
        longerDescription: product.longer_description || "",
        price: Number.parseFloat(product.price || 0),
        sku: product.sku || "",
        item_code: product.item_code || "",
        itemCode: product.item_code || "",
        product_code: product.item_code || "",
        productCode: product.item_code || "",
        isActive: product.is_active !== false,
        imageUrl: product.primary_image || product.image_url || "",
        image: product.primary_image || product.image_url || "",
        primaryImage: product.primary_image || product.image_url || "",
        image_url: product.primary_image || product.image_url || "",
        costPrice: Number.parseFloat(product.cost_price || 0),
        vatRate: Number.parseFloat(product.vat_rate || 16),
        cashbackRate: Number.parseFloat(product.cashback_rate || 0),
        cashback_rate: Number.parseFloat(product.cashback_rate || 0),
        category: {
          id: product.category_id,
          name: product.category_name || "Uncategorized",
        },
        subcategory: product.subcategory_id
          ? {
              id: product.subcategory_id,
              name: product.subcategory_name || "Unknown Subcategory",
            }
          : null,
        pricing_tiers: product.pricing_tiers || [],
        pricingTiers: product.pricing_tiers || [],
        stockQuantity: 0,
        stock: 0,
        createdAt: product.created_at,
      })),
      subcategory: subcategory,
      pagination: {
        page: Number.parseInt(page),
        limit: Number.parseInt(limit),
        total: totalProducts,
        totalPages: Math.ceil(totalProducts / limit),
      },
      message: `Products loaded for subcategory: ${subcategory?.name || subcategorySlug}`,
    })
  } catch (error) {
    console.error("[v0] Subcategory products fetch error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

// POST /api/products - Create new product (Admin only)
router.post("/", requireRole(["admin"]), async (req, res) => {
  try {
    console.log("[v0] Creating new product with data:", req.body)

    const result = await transaction(async (client) => {
      const {
        product_name,
        product_code,
        description,
        longer_description,
        category_name,
        subcategory_name,
        cost_price,
        vat_rate = 16,
        cashback_rate = 0,
        class: shippingClass = "Standard", // Added class field support
        reorder_level,
        order_level,
        alert_quantity,
        reorder_active = true,
        uom = "PC",
        pack_size,
        product_barcode,
        etims_ref_code,
        expiry_date,
        image_url,
        pricing_tiers = [],
        product_images = [],
        variants = [], // Added variants support
      } = req.body

      if (!product_name || !product_code || !category_name || !cost_price) {
        throw new Error("Product name, code, category, and cost price are required")
      }

      // Find category
      const categoryResult = await client.query("SELECT id FROM categories WHERE name ILIKE $1", [category_name])
      if (categoryResult.rows.length === 0) {
        throw new Error("Category not found. Please create the category first.")
      }
      const categoryId = categoryResult.rows[0].id

      // Find subcategory if provided
      let subcategoryId = null
      if (subcategory_name) {
        const subcategoryResult = await client.query(
          "SELECT id FROM subcategories WHERE name ILIKE $1 AND category_id = $2",
          [subcategory_name, categoryId],
        )
        if (subcategoryResult.rows.length > 0) {
          subcategoryId = subcategoryResult.rows[0].id
        }
      }

      // Calculate default price from first pricing tier or cost price + 30%
      const defaultPrice = pricing_tiers.length > 0 ? pricing_tiers[0].selling_price : cost_price * 1.3

      let primaryImageUrl = image_url
      if (product_images && Array.isArray(product_images) && product_images.length > 0) {
        const primaryImage = product_images.find((img) => img.is_primary) || product_images[0]
        primaryImageUrl = primaryImage.image_url || primaryImage.url || image_url
      }

      console.log("[v0] Creating product with primary image URL:", primaryImageUrl)
      console.log("[v0] Product images array:", product_images)

      const productResult = await client.query(
        `INSERT INTO products (
          name, product_code, description, longer_description, category_id, subcategory_id, 
          cost_price, vat_rate, cashback_rate, class, reorder_level, order_level, 
          alert_quantity, reorder_active, uom, pack_size, product_barcode, etims_ref_code, 
          expiry_date, image_url, price
        ) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21) 
         RETURNING *`,
        [
          product_name,
          product_code,
          description || null,
          longer_description || null,
          categoryId,
          subcategoryId,
          cost_price,
          vat_rate,
          cashback_rate,
          shippingClass, // Added class field to insert
          reorder_level || null,
          order_level || null,
          alert_quantity || null,
          reorder_active,
          uom,
          pack_size || null,
          product_barcode || null,
          etims_ref_code || null,
          expiry_date || null,
          primaryImageUrl,
          defaultPrice,
        ],
      )

      const product = productResult.rows[0]
      console.log("[v0] Product created with ID:", product.id)

      if (product_images && Array.isArray(product_images) && product_images.length > 0) {
        let hasPrimary = false

        for (let i = 0; i < product_images.length; i++) {
          const imageData = product_images[i]
          const imageUrl = imageData.image_url || imageData.url
          const isPrimary = imageData.is_primary || (!hasPrimary && i === 0)

          if (isPrimary) {
            hasPrimary = true
          }

          if (imageUrl) {
            console.log("[v0] Adding product image:", { imageUrl, isPrimary, productId: product.id })
            await client.query("INSERT INTO product_images (product_id, image_url, is_primary) VALUES ($1, $2, $3)", [
              product.id,
              imageUrl,
              isPrimary,
            ])
          }
        }

        // Update product with primary image URL if not already set
        if (!primaryImageUrl && product_images.length > 0) {
          const firstImage = product_images[0]
          const firstImageUrl = firstImage.image_url || firstImage.url
          if (firstImageUrl) {
            console.log("[v0] Updating product with first image URL:", firstImageUrl)
            await client.query("UPDATE products SET image_url = $1 WHERE id = $2", [firstImageUrl, product.id])
            product.image_url = firstImageUrl
          }
        }
      }

      if (pricing_tiers && Array.isArray(pricing_tiers) && pricing_tiers.length > 0) {
        for (const tier of pricing_tiers) {
          const minQuantity = tier.min_quantity || tier.min_qty || tier.minQuantity
          const maxQuantity = tier.max_quantity || tier.max_qty || tier.maxQuantity
          const sellingPrice = tier.selling_price || tier.sellingPrice

          if (minQuantity !== undefined && sellingPrice) {
            await client.query(
              `INSERT INTO product_pricing_tiers (product_id, min_quantity, max_quantity, selling_price) 
               VALUES ($1, $2, $3, $4)`,
              [product.id, minQuantity, maxQuantity, sellingPrice],
            )
          }
        }
      }

      if (variants && Array.isArray(variants) && variants.length > 0) {
        for (const variant of variants) {
          const variantType = variant.variant_type || variant.variantType
          const variantValue = variant.variant_value || variant.variantValue
          const priceAdjustment = variant.price_adjustment || variant.priceAdjustment || 0
          const stockQuantity = variant.stock_quantity || variant.stockQuantity || 0

          if (variantType && variantValue) {
            await client.query(
              `INSERT INTO product_variants (product_id, variant_type, variant_value, price_adjustment, stock_quantity) 
               VALUES ($1, $2, $3, $4, $5)`,
              [product.id, variantType, variantValue, priceAdjustment, stockQuantity],
            )
          }
        }
      }

      return product
    })

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: result,
    })
  } catch (error) {
    console.error("Product creation error:", error)
    res.status(500).json({ error: error.message || "Failed to create product" })
  }
})

// PUT /api/products/:id - Update product (Admin only)
router.put("/:id", requireRole(["admin"]), async (req, res) => {
  try {
    const { id } = req.params
    const {
      product_name,
      description,
      longer_description,
      category_name,
      subcategory_name,
      cost_price,
      vat_rate,
      cashback_rate,
      image_url,
      is_active,
      pricing_tiers,
      product_images,
    } = req.body

    const result = await transaction(async (client) => {
      // Find category if category_name is provided
      let categoryId = null
      if (category_name) {
        const categoryResult = await client.query("SELECT id FROM categories WHERE name ILIKE $1", [category_name])
        if (categoryResult.rows.length === 0) {
          throw new Error("Category not found")
        }
        categoryId = categoryResult.rows[0].id
      }

      // Find subcategory if provided
      let subcategoryId = null
      if (subcategory_name && categoryId) {
        const subcategoryResult = await client.query(
          "SELECT id FROM subcategories WHERE name ILIKE $1 AND category_id = $2",
          [subcategory_name, categoryId],
        )
        if (subcategoryResult.rows.length > 0) {
          subcategoryId = subcategoryResult.rows[0].id
        }
      }

      const updateResult = await client.query(
        `UPDATE products 
         SET name = COALESCE($1, name), 
             description = COALESCE($2, description),
             longer_description = COALESCE($3, longer_description),
             category_id = COALESCE($4, category_id),
             subcategory_id = COALESCE($5, subcategory_id),
             cost_price = COALESCE($6, cost_price),
             vat_rate = COALESCE($7, vat_rate),
             cashback_rate = COALESCE($8, cashback_rate),
             image_url = COALESCE($9, image_url),
             is_active = COALESCE($10, is_active),
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $11 
         RETURNING *`,
        [
          product_name,
          description,
          longer_description,
          categoryId,
          subcategoryId,
          cost_price,
          vat_rate,
          cashback_rate,
          image_url,
          is_active,
          id,
        ],
      )

      if (updateResult.rows.length === 0) {
        throw new Error("Product not found")
      }

      if (product_images && Array.isArray(product_images)) {
        // Get existing images
        const existingImages = await client.query("SELECT id, image_url FROM product_images WHERE product_id = $1", [
          id,
        ])

        // Delete images that are no longer in the update
        const newImageUrls = product_images.map((img) => img.image_url || img.url)
        for (const existingImage of existingImages.rows) {
          if (!newImageUrls.includes(existingImage.image_url)) {
            await client.query("DELETE FROM product_images WHERE id = $1", [existingImage.id])
          }
        }

        // Reset all images to non-primary first
        await client.query("UPDATE product_images SET is_primary = false WHERE product_id = $1", [id])

        let hasPrimary = false
        // Update or insert images
        for (let i = 0; i < product_images.length; i++) {
          const imageData = product_images[i]
          const imageUrl = imageData.image_url || imageData.url
          const isPrimary = imageData.is_primary || (!hasPrimary && i === 0)

          if (isPrimary) {
            hasPrimary = true
          }

          if (imageUrl) {
            // Check if image already exists
            const existingImage = await client.query(
              "SELECT id FROM product_images WHERE product_id = $1 AND image_url = $2",
              [id, imageUrl],
            )

            if (existingImage.rows.length === 0) {
              // Insert new image
              await client.query("INSERT INTO product_images (product_id, image_url, is_primary) VALUES ($1, $2, $3)", [
                id,
                imageUrl,
                isPrimary,
              ])
            } else {
              // Update existing image
              await client.query("UPDATE product_images SET is_primary = $1 WHERE id = $2", [
                isPrimary,
                existingImage.rows[0].id,
              ])
            }
          }
        }

        // Update product's main image_url with primary image
        const primaryImageData = product_images.find((img) => img.is_primary) || product_images[0]
        if (primaryImageData && (primaryImageData.image_url || primaryImageData.url)) {
          await client.query("UPDATE products SET image_url = $1 WHERE id = $2", [
            primaryImageData.image_url || primaryImageData.url,
            id,
          ])
        }
      }

      if (pricing_tiers && Array.isArray(pricing_tiers)) {
        // Delete existing pricing tiers
        await client.query("DELETE FROM product_pricing_tiers WHERE product_id = $1", [id])

        // Insert new pricing tiers
        for (const tier of pricing_tiers) {
          const minQuantity = tier.min_quantity || tier.min_qty
          const maxQuantity = tier.max_quantity || tier.max_qty
          const sellingPrice = tier.selling_price

          if (minQuantity !== undefined && maxQuantity !== undefined && sellingPrice) {
            await client.query(
              `INSERT INTO product_pricing_tiers (product_id, min_quantity, max_quantity, selling_price) 
               VALUES ($1, $2, $3, $4)`,
              [id, minQuantity, maxQuantity, sellingPrice],
            )
          }
        }
      }

      return updateResult.rows[0]
    })

    res.json({
      success: true,
      data: result,
      message: "Product updated successfully",
    })
  } catch (error) {
    console.error("Product update error:", error)
    if (error.message === "Category not found") {
      res.status(404).json({ error: error.message })
    } else if (error.message === "Product not found") {
      res.status(404).json({ error: error.message })
    } else {
      res.status(500).json({ error: "Internal server error" })
    }
  }
})

// DELETE /api/products/:id - Delete product (Admin only)
router.delete("/:id", requireRole(["admin"]), async (req, res) => {
  try {
    const { id } = req.params

    // Check if product exists
    const productResult = await query("SELECT id, name FROM products WHERE id = $1", [id])
    if (productResult.rows.length === 0) {
      return res.status(404).json({ error: "Product not found" })
    }

    // Delete product images first
    await query("DELETE FROM product_images WHERE product_id = $1", [id])

    // Delete pricing tiers
    await query("DELETE FROM product_pricing_tiers WHERE product_id = $1", [id])

    // Delete product
    await query("DELETE FROM products WHERE id = $1", [id])

    res.json({
      success: true,
      message: "Product deleted successfully",
    })
  } catch (error) {
    console.error("Product deletion error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

export default router
  



