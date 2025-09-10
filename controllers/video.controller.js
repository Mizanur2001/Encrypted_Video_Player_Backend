const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const ffmpeg = require("fluent-ffmpeg");
const ffprobe = require("ffprobe-static");
const { HandleServerError, HandleError, HandleSuccess } = require("./Base.controller");
const VIDEO_DIR = path.join(__dirname, "../private");

// AES Key + IV
// (must be securely generated, stored in env, and shared with frontend securely)
const ENCRYPTION_KEY = Buffer.from(process.env.VIDEO_KEY, "hex"); // 32 bytes
const IV = Buffer.from(process.env.VIDEO_IV, "hex"); // 16 bytes

module.exports = {
    sendVideo: async (req, res) => {
        try {
            const videoId = req.params.id;
            const videoPath = path.join(VIDEO_DIR, videoId);

            if (!fs.existsSync(videoPath)) {
                return HandleError(res, "Video not found");
            }

            const range = req.headers.range;
            if (!range) {
                return HandleError(res, "Range header required");
            }

            const videoSize = fs.statSync(videoPath).size;

            // Parse range
            const parts = range.replace(/bytes=/, "").split("-");
            let start = parseInt(parts[0], 10);
            let end = parts[1] ? parseInt(parts[1], 10) : start + 10 ** 6;

            // Clamp values to file size
            if (isNaN(start)) start = 0;
            if (isNaN(end)) end = Math.min(start + 10 ** 6, videoSize - 1);
            if (start >= videoSize) start = videoSize - 1;
            if (end >= videoSize) end = videoSize - 1;

            // Ensure start <= end
            if (start > end) {
                return HandleError(res, "Requested range not satisfiable");
            }

            const contentLength = end - start + 1;

            res.writeHead(206, {
                "Content-Range": `bytes ${start}-${end}/${videoSize}`,
                "Accept-Ranges": "bytes",
                "Content-Length": contentLength,
                "Content-Type": "video/mp4",
            });

            const stream = fs.createReadStream(videoPath, { start, end });
            const cipher = crypto.createCipheriv("aes-256-cbc", ENCRYPTION_KEY, IV);

            stream.pipe(cipher).pipe(res);

        } catch (error) {
            return HandleServerError(req, res, error);
        }
    },
    sendVideoInfo: async (req, res) => {
        try {
            const files = fs.readdirSync(VIDEO_DIR).filter(file => {
                return file.endsWith(".mp4") || file.endsWith(".mkv") || file.endsWith(".mov");
            });

            const thumbDir = path.join(__dirname, "../private/thumbnails");
            if (!fs.existsSync(thumbDir)) fs.mkdirSync(thumbDir, { recursive: true });

            let videoInfos = [];

            for (const file of files) {
                const videoPath = path.join(VIDEO_DIR, file);

                const info = await new Promise((resolve, reject) => {
                    ffmpeg.ffprobe(videoPath, (err, metadata) => {
                        if (err) return reject(err);

                        const tags = (metadata && metadata.format && metadata.format.tags) ? metadata.format.tags : {};
                        const id = path.parse(file).name;
                        const title = tags.title || id;
                        const description = tags.description || tags.comment || "";

                        // generate thumbnail
                        const thumbPath = path.join(thumbDir, `${file}.png`);
                        ffmpeg(videoPath)
                            .on("end", () => {
                                resolve({
                                    id,
                                    title,
                                    description,
                                    videoPath: file,
                                    duration: metadata && metadata.format && metadata.format.duration ? parseFloat(metadata.format.duration).toFixed(2) : "0.00",
                                    thumbnail: `/private/thumbnails/${file}.png`,
                                });
                            })
                            .on("error", reject)
                            .screenshots({
                                count: 1,
                                folder: thumbDir,
                                filename: `${file}.png`,
                                size: "320x240",
                            });
                    });
                });

                videoInfos.push(info);
            }

            HandleSuccess(res, { videos: videoInfos }, "Video info retrieved successfully");
        } catch (error) {
            return HandleServerError(req, res, error);
        }
    }
};
