const express = require("express");
const router = express.Router();
const Controllers = require("../controllers");
const Video = Controllers.Video;
const { VerifyToken } = require("../middleware");

router.get("/get-video/:id", VerifyToken, Video.sendVideo);
router.get("/get-video-info", VerifyToken, Video.sendVideoInfo);
router.get('/get-video-key', VerifyToken, Video.getVideoKey);

module.exports = router;