const express = require("express");
const router = express.Router();
const Controllers = require("../controllers");
const Video = Controllers.Video;
const { VerifyToken } = require("../middleware");

router.get("/get-video", VerifyToken, Video.sendVideo);

module.exports = router;