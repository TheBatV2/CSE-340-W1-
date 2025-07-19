const bcrypt = require("bcryptjs")
const accountModel = require("../models/account-model")
const utilities = require("../utilities")
const jwt = require("jsonwebtoken")

/* ****************************************
*  Deliver account view
* *************************************** */
async function buildAccount(req, res) {
  let nav = await utilities.getNav()
  const accountData = req.accountData || {}
  
  // Get user's reviews
  let userReviews = []
  if (accountData.account_id) {
    const reviewModel = require("../models/review-model")
    userReviews = await reviewModel.getReviewsByAccountId(accountData.account_id)
  }
  
  res.render("account/management", {
    title: "Account Management",
    nav,
    messages: req.flash("notice"),
    errors: null,
    accountFirstName: accountData.account_firstname,
    accountType: accountData.account_type,
    accountId: accountData.account_id,
    userReviews: userReviews,
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
    messages: req.flash("notice"),
    errors: null,
  })
}

/* ****************************************
*  Process login
* *************************************** */
async function processLogin(req, res) {
 
  const loginSuccess = false // replace with actual check

  if (!loginSuccess) {
    req.flash("notice", "Incorrect email or password.")
    let nav = await utilities.getNav()
    return res.status(401).render("account/login", {
      title: "Login",
      nav,
      messages: req.flash("notice"),
      errors: null,
    })
  }

 
}

/* ****************************************
 *  Process login request
 * ************************************ */
async function accountLogin(req, res) {
  const { account_email, account_password } = req.body
  let nav = await utilities.getNav()
  const accountData = await accountModel.getAccountByEmail(account_email)
  if (!accountData) {
    req.flash("notice", "Please check your credentials and try again.")
    return res.status(400).render("account/login", {
      title: "Login",
      nav,
      messages: req.flash("notice"),
      errors: null,
      account_email,
    })
  }
  try {
    console.log("accountData:", accountData)
    if (await bcrypt.compare(account_password, accountData.account_password)) {
      delete accountData.account_password
      const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 * 1000 })
      res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 })
      return res.redirect("/account/")
    } else {
      req.flash("notice", "Please check your credentials and try again.")
      return res.status(400).render("account/login", {
        title: "Login",
        nav,
        messages: req.flash("notice"),
        errors: null,
        account_email,
      })
    }
  } catch (error) {
    console.error("bcrypt error:", error)
    req.flash("notice", "An error occurred during login.")
    return res.status(500).render("account/login", {
      title: "Login",
      nav,
      messages: req.flash("notice"),
      errors: null,
      account_email,
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
    hashedPassword = await bcrypt.hashSync(account_password, 10)
  } catch (error) {
    req.flash("notice", 'Sorry, there was an error processing the registration.')
    const messages = req.flash("notice")
    return res.status(500).render("account/registration", {
      title: "Registration",
      nav,
      messages,
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
      `Congratulations, you're registered ${account_firstname}. Please log in.`
    )
    // Only call req.flash("notice") ONCE and pass it to the view
    const messages = req.flash("notice")
    res.status(201).render("account/login", {
      title: "Login",
      nav,
      messages,
    })
  } else {
    req.flash("notice", "Sorry, the registration failed.")
    const messages = req.flash("notice")
    res.status(501).render("account/registration", {
      title: "Registration",
      nav,
      messages,
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
    messages: req.flash("notice"),
    errors: null,
  })
}

/* ****************************************
*  Deliver account update view
* *************************************** */
async function buildUpdateAccount(req, res) {
  let nav = await utilities.getNav()
  const account_id = req.params.account_id
  const accountData = await accountModel.getAccountById(account_id)
  res.render("account/update", {
    title: "Update Account",
    nav,
    messages: req.flash("notice"),
    errors: null,
    account_firstname: accountData.account_firstname,
    account_lastname: accountData.account_lastname,
    account_email: accountData.account_email,
    account_id: accountData.account_id,
  })
}

/* ****************************************
*  Handle account info update
* *************************************** */
async function updateAccount(req, res) {
  let nav = await utilities.getNav()
  const { account_firstname, account_lastname, account_email, account_id } = req.body
  const updateResult = await accountModel.updateAccount(
    account_firstname,
    account_lastname,
    account_email,
    account_id
  )
  if (updateResult) {
    req.flash("notice", "Account information updated successfully.")
    // Get updated data for management view
    const accountData = await accountModel.getAccountById(account_id)
    res.render("account/management", {
      title: "Account Management",
      nav,
      messages: req.flash("notice"),
      accountFirstName: accountData.account_firstname,
      accountType: accountData.account_type,
      accountId: accountData.account_id,
    })
  } else {
    req.flash("notice", "Account update failed. Please try again.")
    res.redirect(`/account/update/${account_id}`)
  }
}

/* ****************************************
*  Handle password update
* *************************************** */
async function updatePassword(req, res) {
  let nav = await utilities.getNav()
  const { account_password, account_id } = req.body
  try {
    const hashedPassword = await bcrypt.hash(account_password, 10)
    const updateResult = await accountModel.updatePassword(hashedPassword, account_id)
    if (updateResult) {
      req.flash("notice", "Password updated successfully.")
    } else {
      req.flash("notice", "Password update failed. Please try again.")
    }
    // Get updated data for management view
    const accountData = await accountModel.getAccountById(account_id)
    res.render("account/management", {
      title: "Account Management",
      nav,
      messages: req.flash("notice"),
      accountFirstName: accountData.account_firstname,
      accountType: accountData.account_type,
      accountId: accountData.account_id,
    })
  } catch (error) {
    req.flash("notice", "Password update failed. Please try again.")
    res.redirect(`/account/update/${account_id}`)
  }
}

// Add to your exports:
module.exports = { showLogin, processLogin, logout, buildRegister, registerAccount, accountLogin, buildAccount, buildUpdateAccount, updateAccount, updatePassword }