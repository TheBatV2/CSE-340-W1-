// Needed Resources 
const express = require("express")
const router = express.Router()
const accountController = require("../controllers/accountController")
const accountValidate = require("../utilities/account-validation")
const utilities = require("../utilities")
require("dotenv").config()


/* ***********************
 * Routes
 *************************/
// Default account management view (after login)
router.get(
  "/",
  utilities.checkJWTToken,
  utilities.checkLogin, 
  utilities.handleErrors(accountController.buildAccount)
)

// Login route
router.get( 
     "/login",  
      utilities.handleErrors(accountController.showLogin)
)

//router.post(  "/login",   utilities.handleErrors(accountController.processLogin))
router.get(
  "/logout", (req, res) => {
  res.clearCookie("jwt")
  req.flash("notice", "You have been logged out.")
  res.redirect("/")
})

router.get(
  "/register",
  utilities.handleErrors(accountController.buildRegister)
)

// Process the registration data
router.post(
  "/register",
  accountValidate.registrationRules(),
  accountValidate.checkRegData,
  utilities.handleErrors(accountController.registerAccount)
)


// Process the login request
router.post(
  "/login",
  accountValidate.loginRules(),
  accountValidate.checkLoginData,
  utilities.handleErrors(accountController.accountLogin)
)

// GET: Deliver account update view
router.get(
  "/update/:account_id",
  utilities.checkLogin,
  utilities.handleErrors(accountController.buildUpdateAccount)
)

// POST: Handle account info update
router.post(
  "/update",
  accountValidate.updateAccountRules(),
  accountValidate.checkUpdateAccountData,
  utilities.handleErrors(accountController.updateAccount)
)

// POST: Handle password update
router.post(
  "/update-password",
  accountValidate.passwordRules(),
  accountValidate.checkPasswordData,
  utilities.handleErrors(accountController.updatePassword)
)

//Middleware to handle errors   
router.use((err, req, res, next) => {
    console.error(err.stack)
    res.status(err.status || 500)
    res.render("errors/error", {
        title: "Error",
        message: err.message || "An unexpected error occurred.",
        nav: utilities.getNav()
    })
})

module.exports = router