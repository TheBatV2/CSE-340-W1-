const reviewModel = require("../models/review-model")
const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")
const { body, validationResult } = require("express-validator")

/* ***************************
 *  Add Review (Process Form)
 * ************************** */
async function addReview(req, res) {
  let nav = await utilities.getNav()
  const { review_text, inv_id, account_id } = req.body
  
  // Validation
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    req.flash("notice", "Please provide a valid review.")
    return res.redirect(`/inv/detail/${inv_id}`)
  }

  try {
    const reviewResult = await reviewModel.addReview(review_text, inv_id, account_id)
    if (reviewResult) {
      req.flash("notice", "Review added successfully!")
    } else {
      req.flash("notice", "Sorry, adding the review failed.")
    }
  } catch (error) {
    req.flash("notice", "Sorry, there was an error adding the review.")
  }
  
  res.redirect(`/inv/detail/${inv_id}`)
}

/* ***************************
 *  Build Edit Review View
 * ************************** */
async function buildEditReview(req, res) {
  let nav = await utilities.getNav()
  const review_id = parseInt(req.params.review_id)
  
  try {
    const reviewData = await reviewModel.getReviewById(review_id)
    
    if (!reviewData) {
      req.flash("notice", "Review not found.")
      return res.redirect("/account/")
    }
    
    // Check if user owns this review
    if (reviewData.account_id !== req.accountData.account_id) {
      req.flash("notice", "Access denied.")
      return res.redirect("/account/")
    }
    
    res.render("reviews/edit-review", {
      title: "Edit Review",
      nav,
      messages: req.flash("notice"),
      errors: null,
      review_id: reviewData.review_id,
      review_text: reviewData.review_text,
      inv_make: reviewData.inv_make,
      inv_model: reviewData.inv_model,
      inv_year: reviewData.inv_year
    })
  } catch (error) {
    req.flash("notice", "Sorry, there was an error accessing the review.")
    res.redirect("/account/")
  }
}

/* ***************************
 *  Process Edit Review
 * ************************** */
async function editReview(req, res) {
  let nav = await utilities.getNav()
  const { review_id, review_text } = req.body
  
  // Validation
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    const reviewData = await reviewModel.getReviewById(review_id)
    req.flash("notice", "Please provide a valid review.")
    return res.render("reviews/edit-review", {
      title: "Edit Review",
      nav,
      messages: req.flash("notice"),
      errors: errors.array(),
      review_id,
      review_text,
      inv_make: reviewData.inv_make,
      inv_model: reviewData.inv_model,
      inv_year: reviewData.inv_year
    })
  }

  try {
    const updateResult = await reviewModel.updateReview(review_id, review_text)
    if (updateResult) {
      req.flash("notice", "Review updated successfully!")
    } else {
      req.flash("notice", "Sorry, updating the review failed.")
    }
  } catch (error) {
    req.flash("notice", "Sorry, there was an error updating the review.")
  }
  
  res.redirect("/account/")
}

/* ***************************
 *  Delete Review
 * ************************** */
async function deleteReview(req, res) {
  const review_id = parseInt(req.params.review_id)
  
  try {
    const reviewData = await reviewModel.getReviewById(review_id)
    
    if (!reviewData) {
      req.flash("notice", "Review not found.")
      return res.redirect("/account/")
    }
    
    // Check if user owns this review
    if (reviewData.account_id !== req.accountData.account_id) {
      req.flash("notice", "Access denied.")
      return res.redirect("/account/")
    }
    
    const deleteResult = await reviewModel.deleteReview(review_id)
    if (deleteResult) {
      req.flash("notice", "Review deleted successfully!")
    } else {
      req.flash("notice", "Sorry, deleting the review failed.")
    }
  } catch (error) {
    req.flash("notice", "Sorry, there was an error deleting the review.")
  }
  
  res.redirect("/account/")
}

/* ***************************
 *  Review Validation Rules
 * ************************** */
const reviewValidationRules = () => {
  return [
    body("review_text")
      .trim()
      .isLength({ min: 1 })
      .withMessage("Review text is required."),
  ]
}

module.exports = {
  addReview,
  buildEditReview,
  editReview,
  deleteReview,
  reviewValidationRules
}