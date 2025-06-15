const { body, validationResult } = require("express-validator")

const invValidate = {}

// Add Classification Validation
invValidate.classificationRules = () => [
  body("classification_name")
    .trim()
    .isLength({ min: 1 })
    .withMessage("Classification name is required.")
    .matches(/^[A-Za-z0-9]+$/)
    .withMessage("No spaces or special characters allowed.")
]

// Add Inventory Validation
invValidate.inventoryRules = () => [
  body("classification_id").notEmpty().withMessage("Classification is required."),
  body("inv_make").trim().notEmpty().withMessage("Make is required."),
  body("inv_model").trim().notEmpty().withMessage("Model is required."),
  body("inv_year").isInt({ min: 1900, max: 2099 }).withMessage("Year must be between 1900 and 2099."),
  body("inv_description").trim().notEmpty().withMessage("Description is required."),
  body("inv_image").trim().notEmpty().withMessage("Image path is required."),
  body("inv_thumbnail").trim().notEmpty().withMessage("Thumbnail path is required."),
  body("inv_price").isFloat({ min: 0 }).withMessage("Price must be a positive number."),
  body("inv_miles").isInt({ min: 0 }).withMessage("Miles must be a positive number."),
  body("inv_color").trim().notEmpty().withMessage("Color is required.")
]

// Error checking middleware
invValidate.checkClassificationData = async (req, res, next) => {
  const errors = validationResult(req)
  let nav = await require("../utilities").getNav()
  if (!errors.isEmpty()) {
    return res.render("inventory/add-classification", {
      title: "Add Classification",
      nav,
      errors,
      classification_name: req.body.classification_name
    })
  }
  next()
}

invValidate.checkInventoryData = async (req, res, next) => {
  const errors = validationResult(req)
  let nav = await require("../utilities").getNav()
  const classificationList = await require("../utilities").buildClassificationList(req.body.classification_id)
  if (!errors.isEmpty()) {
    return res.render("inventory/add-inventory", {
      title: "Add Inventory",
      nav,
      classificationList,
      errors,
      ...req.body
    })
  }
  next()
}

module.exports = invValidate