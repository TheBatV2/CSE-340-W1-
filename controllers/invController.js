const invModel = require("../models/inventory-model")
const utilities = require("../utilities")

const invController = {}

/* ***************************
 *  Build inventory management view
 * ************************** */
invController.buildManagement = async function(req, res) {
  let nav = await utilities.getNav()
  // Create the classification select list
  const classificationSelect = await utilities.buildClassificationList()

  res.render("./inventory/management", {
    title: "Inventory Management",
    nav,
    classificationSelect,
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

/* ***************************
 *  Build edit inventory view
 * ************************** */
invController.buildEditInventoryView = async function (req, res, next) {
  const inv_id = parseInt(req.params.inv_id)
  let nav = await utilities.getNav()
 

  // Get the inventory item data
  const itemData = await invModel.getInventoryById(inv_id)

  // Build the classification select list, pre-selecting the current classification
  const classificationSelect = await utilities.buildClassificationList(itemData.classification_id)

  // Create the item name for the title and heading
  const itemName = `${itemData.inv_make} ${itemData.inv_model}`

  res.render("./inventory/edit-inventory", {
    title: "Edit " + itemName,
    nav,
    classificationSelect: classificationSelect,
    errors: null,
    messages: req.flash("notice"),
    inv_id: itemData.inv_id,
    inv_make: itemData.inv_make,
    inv_model: itemData.inv_model,
    inv_year: itemData.inv_year,
    inv_description: itemData.inv_description,
    inv_image: itemData.inv_image,
    inv_thumbnail: itemData.inv_thumbnail,
    inv_price: itemData.inv_price,
    inv_miles: itemData.inv_miles,
    inv_color: itemData.inv_color,
    classification_id: itemData.classification_id
  })
}

/* ***************************
 *  Return Inventory by Classification As JSON
 * ************************** */
invController.getInventoryJSON = async (req, res, next) => {
  const classification_id = parseInt(req.params.classification_id)
  const invData = await invModel.getInventoryByClassificationId(classification_id)
  if (invData[0].inv_id) {
    return res.json(invData)
  } else {
    next(new Error("No data returned"))
  }
}

/* ***************************
 *  Update Inventory Data
 * ************************** */
invController.updateInventory = async function (req, res, next) {
  let nav = await utilities.getNav()
  const {
    inv_id,
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
    classification_id,
  } = req.body
  const updateResult = await invModel.updateInventory(
    inv_id,  
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
    classification_id
  )

  if (updateResult) {
    const itemName = updateResult.inv_make + " " + updateResult.inv_model
    req.flash("notice", `The ${itemName} was successfully updated.`)
    res.redirect("/inv/")
  } else {
    const classificationSelect = await utilities.buildClassificationList(classification_id)
    const itemName = `${inv_make} ${inv_model}`
    req.flash("notice", "Sorry, the update failed.")
    res.status(501).render("inventory/edit-inventory", {
      title: "Edit " + itemName,
      nav,
      classificationSelect: classificationSelect,
      errors: null,
      inv_id,
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_miles,
      inv_color,
      classification_id
    })
  }
}

/* ***************************
 *  Build delete inventory confirmation view
 * ************************** */
invController.buildDeleteInventoryView = async function (req, res, next) {
  const inv_id = parseInt(req.params.inv_id)
  let nav = await utilities.getNav()

  // Get the inventory item data
  const itemData = await invModel.getInventoryById(inv_id)

  // Create the item name for the title and heading
  const itemName = `${itemData.inv_make} ${itemData.inv_model}`

  res.render("./inventory/delete-confirm", {
    title: "Delete " + itemName,
    nav,
    errors: null,
    messages: req.flash("notice"),
    inv_id: itemData.inv_id,
    inv_make: itemData.inv_make,
    inv_model: itemData.inv_model,
    inv_year: itemData.inv_year,
    inv_price: itemData.inv_price
  })
}

/* ***************************
 *  Carry out inventory deletion
 * ************************** */
invController.deleteInventory = async function (req, res, next) {
  const inv_id = parseInt(req.body.inv_id)
  let nav = await utilities.getNav()

  // Attempt to delete the inventory item
  const deleteResult = await invModel.deleteInventory(inv_id)

  if (deleteResult) {
    req.flash("notice", "The inventory item was successfully deleted.")
    res.redirect("/inv/")
  } else {
    req.flash("notice", "Sorry, the delete failed.")
    res.redirect(`/inv/delete/${inv_id}`)
  }
}

module.exports = invController