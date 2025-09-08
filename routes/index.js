const express = require('express')
const router = express.Router()
const path = require("path");


//Server Test API
router.get("/", (req, res) => {
    res.status(200).sendFile(path.join(__dirname, '..', "public", "index.html"));
});

// uptime endpoint (returns server start time + uptime in seconds)
router.get('/uptime', (req, res) => {
    const uptimeSeconds = process.uptime()
    const startedAt = new Date(Date.now() - uptimeSeconds * 1000).toISOString()
    res.json({ uptime: uptimeSeconds, startedAt })
})

//all other routes
router.use("/api/v1/auth", require("./auth.route"));
router.use("/api/v1/video", require("./video.route"));


// No router found
router.use((req, res) => {
    res.status(404);
    res.json({ status: "failed", error: "Router not found." });
});


module.exports = router