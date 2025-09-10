const { HandleServerError, HandleSuccess, HandleError, PasswordStrength, HashPasswords } = require('./Base.controller')
const models = require("../models")
const bcrypt = require('bcrypt');
const User = models.User
const Otp = models.Otp
const mailService = require('../services').Mail
const jwt = require('jsonwebtoken');


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
    },
    VerifyOtp: async (req, res) => {
        try {
            const { email, otp, ip } = req.body || {}
            if (!email || !otp || !ip) {
                return HandleError(res, "All fields are required")
            }
            //check if user already exists
            const findUserOTP = await Otp.find({ email: email.toLowerCase().trim() })

            if (!findUserOTP || findUserOTP.length === 0) {
                return HandleError(res, "OTP Expired.")
            }

            //check all otp and if any otp matches then we will allow user to login
            let otpMatched = false;
            findUserOTP.forEach((otpData) => {
                if (otpData.otp == otp) {
                    otpMatched = true;
                }
            });

            //Check if the User is Admin
            const findUser = await User.findOne({ email: email.toLowerCase().trim() })

            if (findUser.type !== "admin") {
                return HandleError(res, "You are not allowed to login.")
            }

            if (otpMatched) {
                //delete all otp for the email
                await Otp.deleteMany({ email: email.toLowerCase().trim() })
                // Generate JWT token and send to user
                const token = jwt.sign({ id: findUser._id, email: findUser.email, type: findUser.type, ip }, process.env.JWT_SECRET, { expiresIn: "24h" })
                HandleSuccess(res, { token }, "Success")
            } else {
                HandleError(res, "Invalid OTP.")
            }
        } catch (error) {
            HandleServerError(req, res, error)
        }
    },
    ResendOtp: async (req, res) => {
        try {
            const { email } = req.body || {}
            if (!email) {
                return HandleError(res, "Email is required")
            }

            //check otp exists for the email
            const findUserOTP = await Otp.find({ email: email.toLowerCase().trim() })

            if (!findUserOTP || findUserOTP.length === 0) {
                return HandleError(res, "OTP Expired Login again.")
            }

            //Get user details
            const findUser = await User.findOne({ email: email.toLowerCase().trim() })

            // Create a new OTP
            const otpValue = Math.floor(100000 + Math.random() * 900000);
            const otpData = new Otp({
                email: email.toLowerCase().trim(),
                otp: otpValue,
                type: "Login"
            })
            otpData.save().then(async (otp) => {
                //Send otp to user email
                const mailSent = await mailService.sendOtp(email, findUser.name, otpValue)
                if (mailSent) {
                    HandleSuccess(res, "OTP sent successfully to " + email, "Success")
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
