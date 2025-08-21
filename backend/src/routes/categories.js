import express from "express"
import { query } from "../utils/database.js"
import { requireRole } from "../middleware/auth.js"

const router = express.Router()

// GET /api/categories - Get all categories with subcategories
router.get("/", async (req, res) => {
  try {
    const { includeInactive = false } = req.query

    const whereClause = includeInactive ? "WHERE 1=1" : "WHERE c.is_active = true"

    const result = await query(`SELECT c.id, c.name, c.description, c.image, c.slug, c.is_active, c.created_at,
             array_agg(
               CASE WHEN sc.id IS NOT NULL 
               THEN json_build_object('id', sc.id, 'name', sc.name, 'description', sc.description, 'slug', sc.slug, 'isActive', sc.is_active)
               ELSE NULL END
             ) FILTER (WHERE sc.id IS NOT NULL) as subcategories
      FROM categories c
      LEFT JOIN subcategories sc ON c.id = sc.category_id ${includeInactive ? "" : "AND sc.is_active = true"}
      ${whereClause}
      GROUP BY c.id, c.name, c.description, c.image, c.slug, c.is_active, c.created_at
      ORDER BY c.name
    `)

    res.json({
      success: true,
      data: {
        categories: result.rows.map((category) => ({
          id: category.id,
          name: category.name,
          description: category.description,
          image: category.image,
          slug: category.slug,
          isActive: category.is_active,
          subCategories: category.subcategories || [], // Use subCategories for consistency
          createdAt: category.created_at,
        })),
      },
      message: "Categories loaded successfully for navigation menu",
    })
  } catch (error) {
    console.error("Categories fetch error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

// GET /api/categories/by-slug/:slug - Get category by slug
router.get("/by-slug/:slug", async (req, res) => {
  try {
    const { slug } = req.params

    const result = await query(
      `SELECT c.id, c.name, c.description, c.image, c.slug, c.is_active, c.created_at,
             array_agg(
               CASE WHEN sc.id IS NOT NULL 
               THEN json_build_object('id', sc.id, 'name', sc.name, 'description', sc.description, 'slug', sc.slug, 'isActive', sc.is_active)
               ELSE NULL END
             ) FILTER (WHERE sc.id IS NOT NULL) as subcategories
      FROM categories c
      LEFT JOIN subcategories sc ON c.id = sc.category_id AND sc.is_active = true
      WHERE c.slug = $1 AND c.is_active = true
      GROUP BY c.id, c.name, c.description, c.image, c.slug, c.is_active, c.created_at`,
      [slug],
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Category not found" })
    }

    const category = result.rows[0]

    res.json({
      success: true,
      category: {
        id: category.id,
        name: category.name,
        description: category.description,
        image: category.image,
        slug: category.slug,
        isActive: category.is_active,
        subcategories: category.subcategories || [],
        createdAt: category.created_at,
      },
    })
  } catch (error) {
    console.error("Category fetch by slug error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

// GET /api/categories/:categorySlug/subcategories/:subcategorySlug - Get subcategory by slug
router.get("/:categorySlug/subcategories/:subcategorySlug", async (req, res) => {
  try {
    const { categorySlug, subcategorySlug } = req.params

    const result = await query(
      `SELECT sc.id, sc.name, sc.description, sc.slug, sc.is_active, sc.created_at,
             c.id as category_id, c.name as category_name, c.slug as category_slug
      FROM subcategories sc
      JOIN categories c ON sc.category_id = c.id
      WHERE c.slug = $1 AND sc.slug = $2 AND sc.is_active = true AND c.is_active = true`,
      [categorySlug, subcategorySlug],
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Subcategory not found" })
    }

    const subcategory = result.rows[0]

    res.json({
      success: true,
      subcategory: {
        id: subcategory.id,
        name: subcategory.name,
        description: subcategory.description,
        slug: subcategory.slug,
        isActive: subcategory.is_active,
        category: {
          id: subcategory.category_id,
          name: subcategory.category_name,
          slug: subcategory.category_slug,
        },
        createdAt: subcategory.created_at,
      },
    })
  } catch (error) {
    console.error("Subcategory fetch by slug error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

// GET /api/categories/:id - Get single category
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params

    const result = await query(
      `SELECT c.id, c.name, c.description, c.image, c.slug, c.is_active, c.created_at,
             array_agg(
               CASE WHEN sc.id IS NOT NULL 
               THEN json_build_object('id', sc.id, 'name', sc.name, 'description', sc.description, 'slug', sc.slug, 'isActive', sc.is_active)
               ELSE NULL END
             ) FILTER (WHERE sc.id IS NOT NULL) as subcategories
      FROM categories c
      LEFT JOIN subcategories sc ON c.id = sc.category_id AND sc.is_active = true
      WHERE c.id = $1 AND c.is_active = true
      GROUP BY c.id, c.name, c.description, c.image, c.slug, c.is_active, c.created_at`,
      [id],
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Category not found" })
    }

    const category = result.rows[0]

    res.json({
      success: true,
      category: {
        id: category.id,
        name: category.name,
        description: category.description,
        image: category.image,
        slug: category.slug,
        isActive: category.is_active,
        subcategories: category.subcategories || [],
        createdAt: category.created_at,
      },
    })
  } catch (error) {
    console.error("Category fetch error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

// POST /api/categories - Create new category (Admin only)
router.post("/", requireRole(["admin"]), async (req, res) => {
  try {
    const { name, description, image } = req.body

    if (!name) {
      return res.status(400).json({ error: "Category name is required" })
    }

    const existingCategory = await query("SELECT id FROM categories WHERE name ILIKE $1", [name])
    if (existingCategory.rows.length > 0) {
      return res.status(409).json({ error: "Category with this name already exists" })
    }

    const result = await query(
      "INSERT INTO categories (name, description, image) VALUES ($1, $2, $3) RETURNING id, name, description, image, slug, is_active, created_at",
      [name, description || null, image || null],
    )

    const category = result.rows[0]

    res.status(201).json({
      success: true,
      data: {
        id: category.id,
        name: category.name,
        description: category.description,
        image: category.image,
        slug: category.slug,
        isActive: category.is_active,
        createdAt: category.created_at,
      },
      message: "Category created successfully and will appear in navigation menu",
    })
  } catch (error) {
    console.error("Category creation error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

// PUT /api/categories/:id - Update category (Admin only)
router.put("/:id", requireRole(["admin"]), async (req, res) => {
  try {
    const { id } = req.params
    const { name, description, image, is_active } = req.body

    const result = await query(
      `UPDATE categories 
       SET name = COALESCE($1, name), 
           description = COALESCE($2, description), 
           image = COALESCE($3, image),
           is_active = COALESCE($4, is_active)
       WHERE id = $5 
       RETURNING id, name, description, image, slug, is_active, created_at`,
      [name, description, image, is_active, id],
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Category not found" })
    }

    const category = result.rows[0]

    res.json({
      success: true,
      category: {
        id: category.id,
        name: category.name,
        description: category.description,
        image: category.image,
        slug: category.slug,
        isActive: category.is_active,
        createdAt: category.created_at,
      },
      message: "Category updated successfully",
    })
  } catch (error) {
    console.error("Category update error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

// DELETE /api/categories/:id - Delete category (Admin only)
router.delete("/:id", requireRole(["admin"]), async (req, res) => {
  try {
    const { id } = req.params

    const productsResult = await query("SELECT COUNT(*) as count FROM products WHERE category_id = $1", [id])
    const productCount = Number.parseInt(productsResult.rows[0].count)

    if (productCount > 0) {
      return res.status(400).json({
        error: "Cannot delete category with existing products",
        productCount,
      })
    }

    await query("DELETE FROM subcategories WHERE category_id = $1", [id])

    const result = await query("DELETE FROM categories WHERE id = $1 RETURNING name", [id])

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Category not found" })
    }

    res.json({
      success: true,
      message: "Category deleted successfully",
    })
  } catch (error) {
    console.error("Category deletion error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

// POST /api/categories/subcategories - Create new subcategory (Admin only)
router.post("/subcategories", requireRole(["admin"]), async (req, res) => {
  try {
    const { name, description, category_id } = req.body

    if (!name || !category_id) {
      return res.status(400).json({ error: "Subcategory name and category ID are required" })
    }

    const categoryResult = await query("SELECT id FROM categories WHERE id = $1", [category_id])
    if (categoryResult.rows.length === 0) {
      return res.status(404).json({ error: "Category not found" })
    }

    const existingSubcategory = await query("SELECT id FROM subcategories WHERE name ILIKE $1 AND category_id = $2", [
      name,
      category_id,
    ])
    if (existingSubcategory.rows.length > 0) {
      return res.status(409).json({ error: "Subcategory with this name already exists in this category" })
    }

    const result = await query(
      "INSERT INTO subcategories (name, description, category_id) VALUES ($1, $2, $3) RETURNING id, name, description, category_id, slug, is_active, created_at",
      [name, description || null, category_id],
    )

    const subcategory = result.rows[0]

    res.status(201).json({
      success: true,
      data: {
        id: subcategory.id,
        name: subcategory.name,
        description: subcategory.description,
        categoryId: subcategory.category_id,
        slug: subcategory.slug,
        isActive: subcategory.is_active,
        createdAt: subcategory.created_at,
      },
      message: "Subcategory created successfully",
    })
  } catch (error) {
    console.error("Subcategory creation error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

// PUT /api/categories/subcategories/:id - Update subcategory (Admin only)
router.put("/subcategories/:id", requireRole(["admin"]), async (req, res) => {
  try {
    const { id } = req.params
    const { name, description, is_active } = req.body

    const result = await query(
      `UPDATE subcategories 
       SET name = COALESCE($1, name), 
           description = COALESCE($2, description), 
           is_active = COALESCE($3, is_active)
       WHERE id = $4 
       RETURNING id, name, description, category_id, slug, is_active, created_at`,
      [name, description, is_active, id],
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Subcategory not found" })
    }

    const subcategory = result.rows[0]

    res.json({
      success: true,
      subcategory: {
        id: subcategory.id,
        name: subcategory.name,
        description: subcategory.description,
        categoryId: subcategory.category_id,
        slug: subcategory.slug,
        isActive: subcategory.is_active,
        createdAt: subcategory.created_at,
      },
      message: "Subcategory updated successfully",
    })
  } catch (error) {
    console.error("Subcategory update error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

// DELETE /api/categories/subcategories/:id - Delete subcategory (Admin only)
router.delete("/subcategories/:id", requireRole(["admin"]), async (req, res) => {
  try {
    const { id } = req.params

    const productsResult = await query("SELECT COUNT(*) as count FROM products WHERE subcategory_id = $1", [id])
    const productCount = Number.parseInt(productsResult.rows[0].count)

    if (productCount > 0) {
      return res.status(400).json({
        error: "Cannot delete subcategory with existing products",
        productCount,
      })
    }

    const result = await query("DELETE FROM subcategories WHERE id = $1 RETURNING name", [id])

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Subcategory not found" })
    }

    res.json({
      success: true,
      message: "Subcategory deleted successfully",
    })
  } catch (error) {
    console.error("Subcategory deletion error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

export default router
