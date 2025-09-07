const { HandleServerError, HandleSuccess, HandleError, PasswordStrength, HashPasswords } = require('./Base.controller')
const models = require("../models")
const User = models.User
const Otp = models.Otp


module.exports = {
    Register: async (req, res) => {
        try {
            const { name, email, password } = req.body || {}

            if (!name || !email || !password) {
                return HandleError(res, "All fields are required")
            }

            //check if user already exists
            const findEmail = await User.findOne({ email: email.toLowerCase().trim() })
            if (findEmail) {
                return HandleError(res, "User already exists with this email.")
            }


            //Strong password validation
            const passwordTest = PasswordStrength(password)
            if (passwordTest !== true) {
                return HandleError(res, "Choose a stronger password.")
            }

            //Hash password
            const hashedPassword = await HashPasswords(password.trim())
          
            //Create new user
            const newUser = new User({
                name: name.trim(),
                email: email.toLowerCase().trim(),
                password: hashedPassword,
            })
            newUser.save().then((user) => {
                HandleSuccess(res, "User Added Successfully", "Success")
            }).catch((err) => {
                return HandleError(res, err)
            })

        } catch (error) {
            HandleServerError(req, res, error)
        }
    },
    Login: async (req, res) => {
        try {
            HandleSuccess(res, "Hello", "Success")
        } catch (error) {
            HandleServerError(req, res, error)
        }
    }
}
