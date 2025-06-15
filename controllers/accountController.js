const utilities = require("../utilities")
const accountModel = require("../models/account-model")
const bcrypt = require("bcryptjs")

/* ****************************************
*  Deliver account view
* *************************************** */
async function buildAccount(req, res) {
  let nav = await utilities.getNav()
  res.render("account/account", {
    title: "My Account",
    nav,
  })
}

/* ****************************************
*  Deliver login view
* *************************************** */
async function showLogin(req, res) {
  let nav = await utilities.getNav()
  res.render("account/login", {
    title: "Login",
    nav,
    errors: null,
  })
}

/* ****************************************
*  Process login
* *************************************** */
async function processLogin(req, res) {
  // ...your login logic...
  const loginSuccess = false // replace with your actual check

  if (!loginSuccess) {
    req.flash("notice", "Incorrect email or password.")
    let nav = await utilities.getNav()
    return res.status(401).render("account/login", {
      title: "Login",
      nav,
      errors: null,
    })
  }

 
}

/* ****************************************
*  Logout
* *************************************** */
async function logout(req, res) {
  // Placeholder: just redirect for now
  res.redirect("/")
}

/* ****************************************
*  Process Registration
* *************************************** */
async function registerAccount(req, res) {
  let nav = await utilities.getNav()
  const { account_firstname, account_lastname, account_email, account_password } = req.body

  // Hash the password before storing
  let hashedPassword
  try {
    // regular password and cost (salt is generated automatically)
    hashedPassword = await bcrypt.hashSync(account_password, 10)
  } catch (error) {
    req.flash("notice", 'Sorry, there was an error processing the registration.')
    return res.status(500).render("account/registration", {
      title: "Registration",
      nav,
      errors: null,
    })
  }

  const regResult = await accountModel.registerAccount(
    account_firstname,
    account_lastname,
    account_email,
    hashedPassword 
  )

  if (regResult) {
    req.flash(
      "notice",
      `Congratulations, you\'re registered ${account_firstname}. Please log in.`
    )
    res.status(201).render("account/login", {
      title: "Login",
      nav,
    })
  } else {
    req.flash("notice", "Sorry, the registration failed.")
    res.status(501).render("account/registration", {
      title: "Registration",
      nav,
    })
  }
}

/* ****************************************
*  Deliver registration view
* *************************************** */
async function buildRegister(req, res, next) {
  let nav = await utilities.getNav()
  res.render("account/registration", {
    title: "Register",
    nav,
    errors: null,
  })
}

// Add to your exports:
module.exports = { buildAccount, showLogin, processLogin, logout, buildRegister, registerAccount }