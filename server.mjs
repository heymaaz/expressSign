import express from 'express';
import cors from 'cors';
import { downloadSubtitles } from './ytdlp.mjs';
import { parseSubtitles } from './subtitleParser.mjs';
import { subToGloss } from './subToGloss.mjs';

// Create a new express application instance

const app = express();
app.use(cors());

app.get('/', (req, res) => {
    res.send('Hello World!');
    }
);

app.get('/subtitles/:videoID', async (req, res) => {
    // Set the response header to JSON
    res.setHeader('Content-Type', 'application/json');
    const errorDownload = { error: 'Failed to download subtitles' };
    const errorParse = { error: 'Failed to parse subtitles' };
    // Download the subtitles for the video
    const videoUrl = `https://www.youtube.com/watch?v=${req.params.videoID}`;
    const sub_file_path = await downloadSubtitles(videoUrl);
    if (!sub_file_path) {
        res.json(errorDownload);
        return;
    }
    const subtitles = await parseSubtitles(sub_file_path);
    if (!subtitles) {
        res.json(errorParse);
        return;
    }
    res.json(subtitles);
});

app.get('/gloss/:videoID', async (req, res) => {
    // Set the response header to JSON
    res.setHeader('Content-Type', 'application/json');
    const errorDownload = { error: 'Failed to download subtitles' };
    const errorParse = { error: 'Failed to parse subtitles' };
    // Download the subtitles for the video
    const videoUrl = `https://www.youtube.com/watch?v=${req.params.videoID}`;
    const sub_file_path = await downloadSubtitles(videoUrl);
    if (!sub_file_path) {
        res.json(errorDownload);
        return;
    }
    const subtitles = await parseSubtitles(sub_file_path);
    if (!subtitles) {
        res.json(errorParse);
        return;
    }
    // get the glosses json using subToGloss function
    const glosses = await subToGloss(subtitles, req.params.videoID);
    if (!glosses) {
        res.json({ error: 'Failed to get glosses' });
        return;
    }
    res.json(glosses);
});

// Start the Express server
const port = process.env.PORT || 3000;
app.listen(port, () => {
    // log the url
    const url = `http://localhost:${port}`;
    if (process.env.URL) {
        url = `https://${process.env.URL}`;
    }
    console.log(`Server running at ${url}`);
});
