const pool = require("../database/")

/* ***************************
 *  Get all reviews for a specific inventory item
 * ************************** */
async function getReviewsByInventoryId(inv_id) {
  try {
    const sql = `
      SELECT 
        r.review_id,
        r.review_text,
        r.review_date,
        r.inv_id,
        r.account_id,
        CONCAT(LEFT(a.account_firstname, 1), a.account_lastname) AS screen_name
      FROM review r
      JOIN account a ON r.account_id = a.account_id
      WHERE r.inv_id = $1
      ORDER BY r.review_date DESC
    `
    const result = await pool.query(sql, [inv_id])
    return result.rows
  } catch (error) {
    console.error("getReviewsByInventoryId error: ", error)
    throw error
  }
}

/* ***************************
 *  Add a new review
 * ************************** */
async function addReview(review_text, inv_id, account_id) {
  try {
    const sql = `
      INSERT INTO review (review_text, inv_id, account_id)
      VALUES ($1, $2, $3)
      RETURNING *
    `
    const result = await pool.query(sql, [review_text, inv_id, account_id])
    return result.rows[0]
  } catch (error) {
    console.error("addReview error: ", error)
    throw error
  }
}

/* ***************************
 *  Get reviews by account (for account management)
 * ************************** */
async function getReviewsByAccountId(account_id) {
  try {
    const sql = `
      SELECT 
        r.review_id,
        r.review_text,
        r.review_date,
        r.inv_id,
        i.inv_make,
        i.inv_model,
        i.inv_year
      FROM review r
      JOIN inventory i ON r.inv_id = i.inv_id
      WHERE r.account_id = $1
      ORDER BY r.review_date DESC
    `
    const result = await pool.query(sql, [account_id])
    return result.rows
  } catch (error) {
    console.error("getReviewsByAccountId error: ", error)
    throw error
  }
}

/* ***************************
 *  Get a single review by ID
 * ************************** */
async function getReviewById(review_id) {
  try {
    const sql = `
      SELECT 
        r.review_id,
        r.review_text,
        r.review_date,
        r.inv_id,
        r.account_id,
        i.inv_make,
        i.inv_model,
        i.inv_year
      FROM review r
      JOIN inventory i ON r.inv_id = i.inv_id
      WHERE r.review_id = $1
    `
    const result = await pool.query(sql, [review_id])
    return result.rows[0]
  } catch (error) {
    console.error("getReviewById error: ", error)
    throw error
  }
}

/* ***************************
 *  Update a review
 * ************************** */
async function updateReview(review_id, review_text) {
  try {
    const sql = `
      UPDATE review
      SET review_text = $1
      WHERE review_id = $2
      RETURNING *
    `
    const result = await pool.query(sql, [review_text, review_id])
    return result.rows[0]
  } catch (error) {
    console.error("updateReview error: ", error)
    throw error
  }
}

/* ***************************
 *  Delete a review
 * ************************** */
async function deleteReview(review_id) {
  try {
    const sql = `
      DELETE FROM review
      WHERE review_id = $1
    `
    const result = await pool.query(sql, [review_id])
    return result.rowCount > 0
  } catch (error) {
    console.error("deleteReview error: ", error)
    throw error
  }
}

module.exports = {
  getReviewsByInventoryId,
  addReview,
  getReviewsByAccountId,
  getReviewById,
  updateReview,
  deleteReview
}