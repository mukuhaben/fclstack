// Re-export database utilities for backward compatibility
export {
  getPool,
  query, // Now properly exported
  transaction,
  paginatedQuery,
  bulkInsert,
  safeUpdate,
  healthCheck,
  closePool,
} from "../config/database.js"

// Additional database helper functions
export const exists = async (tableName, conditions) => {
  const { query } = await import("../config/database.js")
  const conditionClauses = Object.keys(conditions).map((key, index) => `${key} = $${index + 1}`)
  const queryText = `SELECT EXISTS(SELECT 1 FROM ${tableName} WHERE ${conditionClauses.join(" AND ")})`

  const result = await query(queryText, Object.values(conditions))
  return result.rows[0].exists
}

export const findById = async (tableName, id, columns = "*") => {
  const { query } = await import("../config/database.js")
  const queryText = `SELECT ${columns} FROM ${tableName} WHERE id = $1`
  const result = await query(queryText, [id])
  return result.rows[0] || null
}

export const findOne = async (tableName, conditions, columns = "*") => {
  const { query } = await import("../config/database.js")
  const conditionClauses = Object.keys(conditions).map((key, index) => `${key} = $${index + 1}`)
  const queryText = `SELECT ${columns} FROM ${tableName} WHERE ${conditionClauses.join(" AND ")} LIMIT 1`

  const result = await query(queryText, Object.values(conditions))
  return result.rows[0] || null
}

export const findMany = async (tableName, conditions = {}, options = {}) => {
  const { query } = await import("../config/database.js")
  const { orderBy = "id", order = "ASC", limit, offset } = options

  let queryText = `SELECT * FROM ${tableName}`
  const params = []

  if (Object.keys(conditions).length > 0) {
    const conditionClauses = Object.keys(conditions).map((key, index) => `${key} = $${index + 1}`)
    queryText += ` WHERE ${conditionClauses.join(" AND ")}`
    params.push(...Object.values(conditions))
  }

  queryText += ` ORDER BY ${orderBy} ${order}`

  if (limit) {
    queryText += ` LIMIT $${params.length + 1}`
    params.push(limit)
  }

  if (offset) {
    queryText += ` OFFSET $${params.length + 1}`
    params.push(offset)
  }

  const result = await query(queryText, params)
  return result.rows
}

export const insertOne = async (tableName, data) => {
  const { query } = await import("../config/database.js")
  const columns = Object.keys(data)
  const values = Object.values(data)
  const placeholders = columns.map((_, index) => `$${index + 1}`)

  const queryText = `INSERT INTO ${tableName} (${columns.join(", ")}) VALUES (${placeholders.join(", ")}) RETURNING *`

  const result = await query(queryText, values)
  return result.rows[0]
}

export const updateById = async (tableName, id, data) => {
  const { query } = await import("../config/database.js")
  const updates = Object.keys(data).map((key, index) => `${key} = $${index + 1}`)
  const queryText = `UPDATE ${tableName} SET ${updates.join(", ")} WHERE id = $${updates.length + 1} RETURNING *`

  const result = await query(queryText, [...Object.values(data), id])
  return result.rows[0] || null
}

export const deleteById = async (tableName, id) => {
  const { query } = await import("../config/database.js")
  const queryText = `DELETE FROM ${tableName} WHERE id = $1 RETURNING *`
  const result = await query(queryText, [id])
  return result.rows[0] || null
}

export const softDeleteById = async (tableName, id) => {
  const { query } = await import("../config/database.js")
  const queryText = `UPDATE ${tableName} SET is_active = false, deleted_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *`
  const result = await query(queryText, [id])
  return result.rows[0] || null
}
