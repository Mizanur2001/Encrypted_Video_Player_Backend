const { HandleServerError, HandleSuccess, HandleError, PasswordStrength, HashPasswords } = require('./Base.controller')
const models = require("../models")
const bcrypt = require('bcrypt');
const User = models.User
const Otp = models.Otp
const mailService = require('../services').Mail


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
            const { email, password } = req.body || {}

            if (!email || !password) {
                return HandleError(res, "All fields are required")
            }

            //check if user already exists
            const findUser = await User.findOne({ email: email.toLowerCase().trim() })
            if (!findUser) {
                return HandleError(res, "Invalid Credentials.")
            }

            //Match password
            const matchPassword = await bcrypt.compare(password.trim(), findUser.password)
            if (!matchPassword) {
                return HandleError(res, "Invalid Credentials.")
            }

            //Send OTP for 2FA verification
            // Create a unique otp
            const otpValue = Math.floor(100000 + Math.random() * 900000);
            const otpData = new Otp({
                email: findUser.email,
                otp: otpValue,
                type: "Login"
            })
            otpData.save().then(async (otp) => {
                //Send otp to user email
                const mailSent = await mailService.sendOtp(findUser.email, findUser.name, otpValue)
                if (mailSent) {
                    HandleSuccess(res, "OTP sent successfully to " + findUser.email, "Success")
                } else {
                    HandleError(res, "Failed to send OTP.")
                }
            }).catch((err) => {
                return HandleError(res, err)
            })
        } catch (error) {
            HandleServerError(req, res, error)
        }
    }
}
