// Needed Resources 
const express = require("express")
const router = express.Router()

const utilities = require("../utilities")
const invController = require("../controllers/invController")
const invValidate = require("../utilities/inventory-validation")

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

router.get(
  "/",
  utilities.requireEmployeeOrAdmin,
  utilities.handleErrors(invController.buildManagement)
)

router.get(
  "/add-classification",
  utilities.requireEmployeeOrAdmin,
  utilities.handleErrors(invController.buildAddClassification)
)
router.get(
  "/add-inventory",
  utilities.requireEmployeeOrAdmin,
  utilities.handleErrors(invController.buildAddInventory)
)
// Add handleErrors to any other routes as needed

// POST route for adding a classification
router.post(
  "/add-classification",
  utilities.requireEmployeeOrAdmin,
  invValidate.classificationRules(),
  invValidate.checkClassificationData,
  utilities.handleErrors(invController.addClassification)
)

// POST route for adding inventory
router.post(
  "/add-inventory",
  invValidate.inventoryRules(),
  invValidate.checkInventoryData,
  utilities.handleErrors(invController.addInventory)
)

// Route to deliver the edit inventory item view
router.get(
  "/edit/:inv_id",
  utilities.handleErrors(invController.buildEditInventoryView)
)

// Route to handle updating inventory item
router.post(
  "/update",
  invValidate.inventoryRules(),
  invValidate.checkUpdateData,
  utilities.handleErrors(invController.updateInventory)
)

router.get(
  "/getInventory/:classification_id",
   utilities.handleErrors(invController.getInventoryJSON))

// Route to deliver the delete inventory item confirmation view
router.get(
  "/delete/:inv_id",
  utilities.handleErrors(invController.buildDeleteInventoryView)
)

// Route to handle deleting inventory item
router.post(
  "/delete",
  utilities.handleErrors(invController.deleteInventory)
)

module.exports = router