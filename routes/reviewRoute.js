// Needed Resources 
const express = require("express")
const router = new express.Router() 
const reviewController = require("../controllers/reviewController")
const utilities = require("../utilities/")

// Route to add a review (POST)
router.post(
  "/add",
  utilities.checkJWTToken,
  utilities.checkLogin,
  reviewController.reviewValidationRules(),
  utilities.handleErrors(reviewController.addReview)
)

// Route to build edit review view (GET)
router.get(
  "/edit/:review_id",
  utilities.checkJWTToken,
  utilities.checkLogin,
  utilities.handleErrors(reviewController.buildEditReview)
)

// Route to process edit review (POST)
router.post(
  "/edit",
  utilities.checkJWTToken,
  utilities.checkLogin,
  reviewController.reviewValidationRules(),
  utilities.handleErrors(reviewController.editReview)
)

// Route to delete review (GET)
router.get(
  "/delete/:review_id",
  utilities.checkJWTToken,
  utilities.checkLogin,
  utilities.handleErrors(reviewController.deleteReview)
)

module.exports = router