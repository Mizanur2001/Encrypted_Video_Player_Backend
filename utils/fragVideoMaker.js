const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const baseDir = path.join(__dirname, '..', 'private');
const inputDir = path.join(baseDir, 'originalvideo');
const outputDir = baseDir;

// ensure input exists
if (!fs.existsSync(inputDir)) {
    console.error('Input folder does not exist:', inputDir);
    process.exit(1);
}

// ensure output exists
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

const videoExts = ['.mp4', '.mkv']; // adjust if you want more types

async function fragmentVideos() {
    const files = fs.readdirSync(inputDir)
        .filter(f => videoExts.includes(path.extname(f).toLowerCase()))
        .filter(f => !f.includes('-frag')); // skip already-fragmented names

    if (files.length === 0) {
        console.log('No videos to process in', inputDir);
        return;
    }

    for (const file of files) {
        const input = path.join(inputDir, file);
        const baseName = path.parse(file).name;
        const output = path.join(outputDir, `${baseName}-frag.mp4`);

        console.log(`Fragmenting "${file}" -> "${path.relative(process.cwd(), output)}"`);

        // ffmpeg args: overwrite, input, copy streams, set fragmented mp4 flags
        const args = [
            '-y',
            '-i', input,
            '-c', 'copy',
            '-movflags', '+frag_keyframe+empty_moov+default_base_moof',
            output
        ];

        await new Promise((resolve, reject) => {
            const p = spawn('ffmpeg', args, { stdio: 'inherit' });

            p.on('error', err => {
                console.error('Failed to start ffmpeg for', file, err);
                reject(err);
            });

            p.on('close', code => {
                if (code === 0) {
                    console.log(file, '-> fragmented successfully');
                    resolve();
                } else {
                    console.error(file, 'ffmpeg exited with code', code);
                    // continue to next file rather than aborting all
                    resolve();
                }
            });
        });
    }
}

fragmentVideos().catch(err => {
    console.error('Error during fragmentation:', err);
    process.exit(1);
});
