import { Pool } from "pg"
import dotenv from "dotenv"

// Load environment variables from .env file
dotenv.config()

let pool

export const getPool = () => {
  if (!pool) {
    // Use local DB in development, production DB in production
    const connectionString =
      process.env.NODE_ENV === "production" ? process.env.DATABASE_URL : process.env.DATABASE_LOCAL_URL

    if (!connectionString) {
      throw new Error(
        `Database connection string is missing. Please set ${
          process.env.NODE_ENV === "production" ? "DATABASE_URL" : "DATABASE_LOCAL_URL"
        } in your .env file.`,
      )
    }

    pool = new Pool({
      connectionString,
      ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
      maxUses: 7500,
    })

    pool.on("error", (err) => {
      console.error("Unexpected error on idle client", err)
      process.exit(-1)
    })

    pool.on("connect", () => {
      console.log(`Connected to PostgreSQL database (${process.env.NODE_ENV})`)
    })
  }
  return pool
}

export const query = async (text, params = []) => {
  const pool = getPool()
  const start = Date.now()

  try {
    const result = await pool.query(text, params)
    const duration = Date.now() - start

    if (process.env.NODE_ENV === "development") {
      console.log("Executed query", { text, duration, rows: result.rowCount })
    }

    return result
  } catch (error) {
    console.error("Database query error:", { text, params, error: error.message })
    throw error
  }
}

export const transaction = async (callback) => {
  const pool = getPool()
  const client = await pool.connect()

  try {
    await client.query("BEGIN")
    const result = await callback(client)
    await client.query("COMMIT")
    return result
  } catch (error) {
    await client.query("ROLLBACK")
    console.error("Transaction error:", error.message)
    throw error
  } finally {
    client.release()
  }
}

export const paginatedQuery = async (baseQuery, params = [], page = 1, limit = 10) => {
  const offset = (page - 1) * limit
  const countQuery = `SELECT COUNT(*) FROM (${baseQuery}) as count_query`

  const countResult = await query(countQuery, params)

  if (!countResult.rows || countResult.rows.length === 0) {
    throw new Error("Failed to get count from paginated query")
  }

  const total = Number.parseInt(countResult.rows[0].count)

  const paginatedQueryText = `${baseQuery} LIMIT $${params.length + 1} OFFSET $${params.length + 2}`
  const result = await query(paginatedQueryText, [...params, limit, offset])

  return {
    data: result.rows,
    pagination: {
      page: Number.parseInt(page),
      limit: Number.parseInt(limit),
      total,
      totalPages: Math.ceil(total / limit),
      hasNext: page * limit < total,
      hasPrev: page > 1,
    },
  }
}

export const bulkInsert = async (tableName, columns, values) => {
  if (!values.length) return { rowCount: 0 }

  const placeholders = values
    .map(
      (_, rowIndex) => `(${columns.map((_, colIndex) => `$${rowIndex * columns.length + colIndex + 1}`).join(", ")})`,
    )
    .join(", ")

  const queryText = `INSERT INTO ${tableName} (${columns.join(", ")}) VALUES ${placeholders}`
  const flatValues = values.flat()

  return await query(queryText, flatValues)
}

export const safeUpdate = async (tableName, updates, conditions) => {
  const updateClauses = Object.keys(updates).map((key, index) => `${key} = $${index + 1}`)
  const conditionClauses = Object.keys(conditions).map(
    (key, index) => `${key} = $${Object.keys(updates).length + index + 1}`,
  )

  const queryText = `
    UPDATE ${tableName} 
    SET ${updateClauses.join(", ")} 
    WHERE ${conditionClauses.join(" AND ")} 
    RETURNING *
  `

  const params = [...Object.values(updates), ...Object.values(conditions)]
  return await query(queryText, params)
}

export const healthCheck = async () => {
  try {
    const result = await query("SELECT NOW() as current_time, version() as version")

    if (!result.rows || result.rows.length === 0) {
      return {
        status: "unhealthy",
        error: "No data returned from health check query",
      }
    }

    return {
      status: "healthy",
      timestamp: result.rows[0].current_time,
      version: result.rows[0].version,
    }
  } catch (error) {
    return {
      status: "unhealthy",
      error: error.message,
    }
  }
}

export const closePool = async () => {
  if (pool) {
    await pool.end()
    console.log("Database pool closed")
  }
}

process.on("SIGINT", async () => {
  console.log("Received SIGINT, closing database connections...")
  await closePool()
  process.exit(0)
})

process.on("SIGTERM", async () => {
  console.log("Received SIGTERM, closing database connections...")
  await closePool()
  process.exit(0)
})
