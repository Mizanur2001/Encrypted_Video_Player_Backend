const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const ffmpeg = require("fluent-ffmpeg");
const ffprobe = require("ffprobe-static");
const { HandleServerError, HandleError, HandleSuccess } = require("./Base.controller");
const VIDEO_DIR = path.join(__dirname, "../private");


const ENCRYPTION_KEY = process.env.VIDEO_KEY ? Buffer.from(process.env.VIDEO_KEY, "hex") : null; // 32 bytes
const IV = process.env.VIDEO_IV ? Buffer.from(process.env.VIDEO_IV, "hex") : null; // 16 bytes

// Validate env lengths at startup (fail early if misconfigured)
if (process.env.VIDEO_KEY && (!ENCRYPTION_KEY || ENCRYPTION_KEY.length !== 32)) {
    console.error("VIDEO_KEY environment variable is present but not 32 bytes (hex). Exiting.");
    process.exit(1);
}
if (process.env.VIDEO_IV && (!IV || IV.length !== 16)) {
    console.error("VIDEO_IV environment variable is present but not 16 bytes (hex). Exiting.");
    process.exit(1);
}

// Helper: add block index to IV (big-endian) to derive per-range counter
function deriveCounterIV(baseIv, blockIndex) {
    if (!Buffer.isBuffer(baseIv)) throw new Error("IV must be a Buffer");
    const ctr = Buffer.from(baseIv); // copy
    let carry = BigInt(blockIndex);
    for (let i = ctr.length - 1; i >= 0 && carry > 0n; i--) {
        const sum = BigInt(ctr[i]) + (carry & 0xffn);
        ctr[i] = Number(sum & 0xffn);
        carry = (carry >> 8n) + (sum >> 8n);
    }
    return ctr;
}

function setCorsHeaders(res) {
    // Allow Authorization header and preflight; expose range headers used by clients
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "Authorization,Content-Type,Range");
    res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
    res.setHeader("Access-Control-Expose-Headers", "Content-Range,Accept-Ranges,Content-Length,Content-Type");
}

// add near top (after requires)
const fsp = fs.promises;
const VIDEO_EXTS = new Set([".mp4", ".mkv", ".mov"]);
const THUMB_DIR = path.join(__dirname, "../private/thumbnails");

// ensure ffprobe-static is actually used
ffmpeg.setFfprobePath(ffprobe.path);

// simple concurrency limiter
function createLimiter(max) {
  let active = 0;
  const queue = [];
  const next = () => {
    if (active >= max || queue.length === 0) return;
    active++;
    const { fn, resolve, reject } = queue.shift();
    Promise.resolve()
      .then(fn)
      .then(resolve, reject)
      .finally(() => {
        active--;
        next();
      });
  };
  return (fn) =>
    new Promise((resolve, reject) => {
      queue.push({ fn, resolve, reject });
      next();
    });
}

const probeLimit = createLimiter(4);
const thumbLimit = createLimiter(1);

// in-memory cache: filename -> { key, info }
const videoInfoCache = new Map();

function ffprobeAsync(filePath) {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(filePath, (err, metadata) => {
      if (err) return reject(err);
      resolve(metadata);
    });
  });
}

async function ensureThumbnail(videoPath, fileName) {
  await fsp.mkdir(THUMB_DIR, { recursive: true });

  const thumbFile = `${fileName}.png`;
  const thumbPath = path.join(THUMB_DIR, thumbFile);

  try {
    await fsp.access(thumbPath);
    return; // already exists
  } catch (_) {
    // missing -> generate
  }

  // swallow errors so API doesn’t break if ffmpeg fails for one video
  try {
    await new Promise((resolve) => {
      ffmpeg(videoPath)
        .on("end", resolve)
        .on("error", resolve)
        .screenshots({
          count: 1,
          folder: THUMB_DIR,
          filename: thumbFile,
          size: "320x240",
        });
    });
  } catch (_) {}
}

module.exports = {
    sendVideo: async (req, res) => {
        try {
            // Handle CORS preflight
            setCorsHeaders(res);
            if (req.method === "OPTIONS") {
                res.writeHead(204);
                return res.end();
            }

            const videoId = req.params.id;
            const videoPath = path.join(VIDEO_DIR, videoId);

            // Auth: require authenticated + authorized user to stream ranges
            const user = req.user;
            if (!user) return HandleError(res, "Authentication required");

            if (!fs.existsSync(videoPath)) {
                return HandleError(res, "Video not found");
            }

            let range = req.headers.range;
            if (!range) {
                // If no range header, default to first 1MB
                range = "bytes=0-";
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

            const headers = {
                "Content-Range": `bytes ${start}-${end}/${videoSize}`,
                "Accept-Ranges": "bytes",
                "Content-Length": contentLength,
                "Content-Type": "video/mp4",
            };
            // Set headers and also ensure CORS headers already set above
            Object.entries(headers).forEach(([k, v]) => res.setHeader(k, v));
            res.statusCode = 206;

            const stream = fs.createReadStream(videoPath, { start, end });

            if (!ENCRYPTION_KEY || !IV) {
                // If no key configured, send raw stream (not recommended for production)
                stream.pipe(res);
                return;
            }

            // Use AES-256-CTR (stream-friendly) and derive counter from base IV + block index
            // This avoids CBC padding issues for range requests.
            const blockIndex = Math.floor(start / 16);
            const counterIV = deriveCounterIV(IV, blockIndex);

            const cipher = crypto.createCipheriv("aes-256-ctr", ENCRYPTION_KEY, counterIV);

            // Pipe file-range -> cipher -> response
            stream.pipe(cipher).pipe(res);

        } catch (error) {
            return HandleServerError(req, res, error);
        }
    },
    getVideoKey: async (req, res) => {
        try {
            // CORS / preflight
            setCorsHeaders(res);
            if (req.method === "OPTIONS") {
                res.writeHead(204);
                return res.end();
            }

            // Expect req.user to be populated by authentication middleware
            const user = req.user;
            if (!user) return HandleError(res, "Authentication required");

            if (!ENCRYPTION_KEY || !IV) {
                return HandleServerError(req, res, new Error("Server encryption key not configured"));
            }

            const encKeyBase64 = ENCRYPTION_KEY.toString("base64");
            const ivBase64 = IV.toString("base64");

            // Optionally issue a short-lived expiration timestamp (client should enforce)
            const expiresAt = Date.now() + 60 * 1000; // 60 seconds from now

            return HandleSuccess(res, { encKeyBase64, ivBase64, expiresAt }, "Key issued");

        } catch (error) {
            return HandleServerError(req, res, error);
        }
    },
    sendVideoInfo: async (req, res) => {
        try {
            await fsp.mkdir(THUMB_DIR, { recursive: true });

            const dirents = await fsp.readdir(VIDEO_DIR, { withFileTypes: true });
            const files = dirents
              .filter((d) => d.isFile())
              .map((d) => d.name)
              .filter((name) => VIDEO_EXTS.has(path.extname(name).toLowerCase()));

            const videos = await Promise.all(
              files.map((file) =>
                probeLimit(async () => {
                  const videoPath = path.join(VIDEO_DIR, file);
                  const stat = await fsp.stat(videoPath);
                  const cacheKey = `${stat.size}:${stat.mtimeMs}`;

                  const cached = videoInfoCache.get(file);
                  if (cached && cached.key === cacheKey) return cached.info;

                  // probe (but don’t fail the whole request if one file is bad)
                  let metadata = null;
                  try {
                    metadata = await ffprobeAsync(videoPath);
                  } catch (_) {}

                  const tags = metadata?.format?.tags || {};
                  const id = path.parse(file).name;

                  const info = {
                    id,
                    title: tags.title || id,
                    description: tags.description || tags.comment || "",
                    videoPath: file,
                    duration: metadata?.format?.duration
                      ? parseFloat(metadata.format.duration).toFixed(2)
                      : "0.00",
                    thumbnail: `/thumbnails/${file}.png`,
                  };

                  // generate thumbnail in background (limited concurrency)
                  thumbLimit(() => ensureThumbnail(videoPath, file)).catch(() => {});

                  videoInfoCache.set(file, { key: cacheKey, info });
                  return info;
                })
              )
            );

            return HandleSuccess(res, { videos }, "Video info retrieved successfully");
          } catch (error) {
            return HandleServerError(req, res, error);
          }
    }
};
