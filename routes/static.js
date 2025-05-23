const express = require("express")
const router = express.Router()
const baseController = require("../controllers/baseController")
const utilities = require("../utilities")

// Static Routes
// Set up "public" folder / subfolders for static files
router.use(express.static("public"))
router.use("/css", express.static(__dirname + "public/css"))
router.use("/js", express.static(__dirname + "public/js"))
router.use("/images", express.static(__dirname + "public/images"))

router.get(
  "/",
  utilities.handleErrors(baseController.buildHome)
)

// Intentional 500 error route
router.get(
  "/cause-error",
  utilities.handleErrors((req, res) => {
    throw new Error("This is an intentional server error for testing purposes.")
  })
)

module.exports = router



