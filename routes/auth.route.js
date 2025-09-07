const express = require("express");
const router = express.Router();
const Controllers = require("../controllers");
const Auth = Controllers.Auth;

router.post("/login", Auth.Login);
router.post("/register", Auth.Register);

module.exports = router;