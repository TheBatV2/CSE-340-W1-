// Needed Resources 
const express = require("express")
const router = express.Router()
const invController = require("../controllers/invController")
const utilities = require("../utilities")

// Route to build inventory by classification view
router.get(
  "/type/:classificationId",
  utilities.handleErrors(invController.buildByClassificationId)
);

// Route for vehicle detail view
router.get(
  "/detail/:inv_id",
  utilities.handleErrors(invController.buildDetail)
)

// Add handleErrors to any other routes as needed

module.exports = router