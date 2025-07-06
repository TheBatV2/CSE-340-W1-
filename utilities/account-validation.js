const utilities = require(".")
  const { body, validationResult } = require("express-validator")
  const validate = {}
  const accountModel = require("../models/account-model")



  /*  **********************************
  *  Registration Data Validation Rules
  * ********************************* */
  validate.registrationRules = () => {
    return [
      // firstname is required and must be string
      body("account_firstname")
        .trim()
        .escape()
        .notEmpty()
        .isLength({ min: 1 })
        .withMessage("Please provide a first name."), // on error this message is sent.
  
      // lastname is required and must be string
      body("account_lastname")
        .trim()
        .escape()
        .notEmpty()
        .isLength({ min: 2 })
        .withMessage("Please provide a last name."), // on error this message is sent.
  
     // valid email is required and cannot already exist in the database
        body("account_email")
        .trim()
        .isEmail()
        .normalizeEmail() // refer to validator.js docs
        .withMessage("A valid email is required.")
        .custom(async (account_email) => {
          const emailExists = await accountModel.checkExistingEmail(account_email)
          if (emailExists) {
            throw new Error("Email exists. Please log in or use different email")
            }
        }),
  
      // password is required and must be strong password
      body("account_password")
        .trim()
        .notEmpty()
        .isStrongPassword({
          minLength: 12,
          minLowercase: 1,
          minUppercase: 1,
          minNumbers: 1,
          minSymbols: 1,
        })
        .withMessage("Password does not meet requirements."),
    ]
  }



  /* ******************************
 * Check data and return errors or continue to registration
 * ***************************** */
validate.checkRegData = async (req, res, next) => {
  const { account_firstname, account_lastname, account_email } = req.body
  let errors = []
  errors = validationResult(req)
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    res.render("account/registration", {
      errors,
      title: "Registration",
      nav,
      messages: req.flash("notice"),
      account_firstname,
      account_lastname,
      account_email,
    })
    return
  }
  next()
}

/* **********************************
*  Login Data Validation Rules
* ********************************* */
validate.loginRules = () => {
  return [
    body("account_email")
      .trim()
      .isEmail()
      .withMessage("A valid email is required."),
    body("account_password")
      .trim()
      .notEmpty()
      .withMessage("Password is required.")
  ]
}

/* ******************************
* Check login data and return errors or continue
* ***************************** */
validate.checkLoginData = async (req, res, next) => {
  const { email } = req.body
  let errors = validationResult(req)
  if (!errors.isEmpty()) {
    let nav = await require("../utilities").getNav()
    res.render("account/login", {
      errors,
      title: "Login",
      nav,
      messages: req.flash("notice"),
      email
    })
    return
  }
  next()
}

/* **********************************
*  Account Update Validation Rules
* ********************************* */
validate.updateAccountRules = () => [
  body("account_firstname")
    .trim().notEmpty().withMessage("First name is required."),
  body("account_lastname")
    .trim().notEmpty().withMessage("Last name is required."),
  body("account_email")
    .trim().isEmail().withMessage("A valid email is required.")
    .custom(async (email, { req }) => {
      // Only check for duplicate if email is changed
      const existing = await accountModel.getAccountByEmail(email)
      if (existing && existing.account_id != req.body.account_id) {
        throw new Error("Email already exists. Please use a different email.")
      }
      return true
    }),
]

/* **********************************
*  Password Validation Rules
* ********************************* */
validate.passwordRules = () => [
  body("account_password")
    .trim()
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{12,}$/)
    .withMessage("Password must be at least 12 characters and include uppercase, lowercase, number, and special character."),
]

/* ******************************
* Check account update data and return errors or continue
* ***************************** */
validate.checkUpdateAccountData = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    req.flash("notice", errors.array().map(e => e.msg))
    return res.render("account/update", {
      title: "Update Account",
      messages: req.flash("notice"),
      errors: errors.array(),
      account_firstname: req.body.account_firstname,
      account_lastname: req.body.account_lastname,
      account_email: req.body.account_email,
      account_id: req.body.account_id,
    })
  }
  next()
}

/* ******************************
* Check password data and return errors or continue
* ***************************** */
validate.checkPasswordData = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    req.flash("notice", errors.array().map(e => e.msg))
    return res.render("account/update", {
      title: "Update Account",
      messages: req.flash("notice"),
      errors: errors.array(),
      account_id: req.body.account_id,
    })
  }
  next()
}

module.exports = validate