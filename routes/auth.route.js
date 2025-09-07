const express = require("express");
const router = express.Router();
const Controllers = require("../controllers");
const Auth = Controllers.Auth;

router.get("/login", Auth.Login);

module.exports = router;