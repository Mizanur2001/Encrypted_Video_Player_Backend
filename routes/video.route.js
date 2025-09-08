const express = require("express");
const router = express.Router();
const Controllers = require("../controllers");
const Video = Controllers.Video;

router.get("/send-video", Video.sendVideo);

module.exports = router;