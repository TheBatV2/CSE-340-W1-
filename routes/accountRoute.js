// Needed Resources 
const express = require("express")
const router = express.Router()
const accountController = require("../controllers/accountController")
const utilities = require("../utilities")
const regValidate = require('../utilities/account-validation')


/* ***********************
 * Routes
 *************************/
// Route for "My Account" main page
router.get(
  "/", 
  utilities.handleErrors(accountController.buildAccount)
)

// Login route
router.get( 
     "/login",  
      utilities.handleErrors(accountController.showLogin)
)

//router.post(  "/login",   utilities.handleErrors(accountController.processLogin))
router.get(
  "/logout", 
  utilities.handleErrors(accountController.logout)
)

// Registration route
router.get(
  "/register",
  utilities.handleErrors(accountController.buildRegister)
)

// Process the registration data
router.post(
  "/register",
  regValidate.registrationRules(),
  regValidate.checkRegData,
  utilities.handleErrors(accountController.registerAccount)
)


// Process the login attempt
router.post(
  "/login",
  regValidate.loginRules(),
  regValidate.checkLoginData,
  utilities.handleErrors(accountController.processLogin)
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