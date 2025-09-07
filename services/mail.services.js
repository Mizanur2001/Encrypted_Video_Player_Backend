require("dotenv").config();
const nodemailer = require("nodemailer");
const { otpMailTemplate } = require("../public/template/mail/otp.template");

const transpoter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },
});


module.exports = {
    sendOtp: async (to, name, otpValue) => {
        try {
            const option = {
                from: "Encrypted Video Player <" + process.env.EMAIL_USER + ">",
                to: to,
                subject: "OTP Verification",
                html: otpMailTemplate(name, otpValue),
            };
            const info = await transpoter.sendMail(option);
            return true;
        } catch (e) {
            console.log(e);
            return false;
        }
    },
};
