const invModel = require("../models/inventory-model")
const utilities = require("../utilities")

const invController = {}

/* ***************************
 *  Build inventory management view
 * ************************** */
invController.buildManagement = async function(req, res) {
  let nav = await utilities.getNav()
  res.render("inventory/management", {
    title: "Inventory Management",
    nav,
    messages: req.flash("notice")
  })
}

/* ***************************
 *  Build add-classification view
 * ************************** */
invController.buildAddClassification = async function(req, res) {
  let nav = await utilities.getNav()
  res.render("inventory/add-classification", {
    title: "Add Classification",
    nav,
    errors: null,
    messages: req.flash("notice")
  })
}

/* ***************************
 *  Build add-inventory view
 * ************************** */
invController.buildAddInventory = async function(req, res) {
  let nav = await utilities.getNav()
  // Build the classification select list
  const classificationList = await utilities.buildClassificationList()
  res.render("inventory/add-inventory", {
    title: "Add Inventory",
    nav,
    classificationList,
    errors: null,
    messages: req.flash("notice")
  })
}

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invController.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId
  const data = await invModel.getInventoryByClassificationId(classification_id)
  const grid = await utilities.buildClassificationGrid(data)
  let nav = await utilities.getNav()
  const className = data[0].classification_name
  res.render("./inventory/classification", {
    title: className + " vehicles",
    nav,
    grid,
  })
}

/* ***************************
 *  Build inventory detail view
 * ************************** */
invController.buildDetail = async function(req, res) {
  const inv_id = req.params.inv_id
  const nav = await utilities.getNav()
  const data = await invModel.getInventoryById(inv_id)
  if (!data) {
    return res.status(404).render("errors/error", { title: "Vehicle Not Found", message: "Sorry, that vehicle does not exist.", nav })
  }
  const detail = utilities.buildDetailView(data)
  res.render("inventory/detail", {
    title: `${data.inv_make} ${data.inv_model}`,
    nav,
    detail
  })
}

/* ***************************
 *  Add inventory
 * ************************** */
invController.addInventory = async function(req, res) {
  let nav = await utilities.getNav()
  const {
    classification_id,
    inv_make,
    inv_model,
    inv_year,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_miles,
    inv_color
  } = req.body

  try {
    // Attempt to add the inventory item to the database
    const addResult = await invModel.addInventory(
      classification_id,
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_miles,
      inv_color
    )

    if (addResult) {
      req.flash("notice", "Inventory item successfully added!")
      // Rebuild nav to reflect new inventory if needed
      nav = await utilities.getNav()
      return res.redirect("/inv")
    } else {
      req.flash("notice", "Sorry, the inventory item could not be added.")
      const classificationList = await utilities.buildClassificationList(classification_id)
      return res.status(501).render("inventory/add-inventory", {
        title: "Add Inventory",
        nav,
        classificationList,
        errors: null,
        messages: req.flash("notice"),
        ...req.body // sticky form values
      })
    }
  } catch (error) {
    req.flash("notice", "An error occurred while adding the inventory item.")
    const classificationList = await utilities.buildClassificationList(classification_id)
    return res.status(500).render("inventory/add-inventory", {
      title: "Add Inventory",
      nav,
      classificationList,
      errors: null,
      messages: req.flash("notice"),
      ...req.body
    })
  }
}

/* ***************************
 *  Add classification
 * ************************** */
invController.addClassification = async function(req, res) {
  let nav = await utilities.getNav()
  const { classification_name } = req.body

  try {
    const addResult = await invModel.addClassification(classification_name)
    if (addResult) {
      req.flash("notice", "Classification successfully added!")
      nav = await utilities.getNav()
      return res.redirect("/inv")
    } else {
      req.flash("notice", "Sorry, the classification could not be added.")
      return res.status(501).render("inventory/add-classification", {
        title: "Add Classification",
        nav,
        errors: null,
        messages: req.flash("notice"),
        classification_name
      })
    }
  } catch (error) {
    req.flash("notice", "An error occurred while adding the classification.")
    return res.status(500).render("inventory/add-classification", {
      title: "Add Classification",
      nav,
      errors: null,
      messages: req.flash("notice"),
      classification_name
    })
  }
}

module.exports = invController