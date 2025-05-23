const invModel = require("../models/inventory-model")
const utilities = require("../utilities")

const invController = {}

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

module.exports = invController