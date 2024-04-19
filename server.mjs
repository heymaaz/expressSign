import express from 'express';
import cors from 'cors';
import { downloadSubtitles } from './ytdlp.mjs';
import { parseSubtitles } from './subtitleParser.mjs';
import { subToGloss } from './subToGloss.mjs';
import e from 'express';

// Create a new express application instance

const app = express();
app.use(cors());

// log the requests
app.use((req, res, next) => {
    // get current time
    const now = new Date();
    // log the request method and url
    console.log(`${now.toISOString()} ${req.method} ${req.url}`);
    next();
});

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
        console.log(errorDownload);
        res.json(errorDownload);
        return;
    }
    const subtitles = await parseSubtitles(sub_file_path);
    if (!subtitles) {
        console.log(errorParse);
        res.json(errorParse);
        return;
    }
    let now = new Date();
    console.log(`${now.toISOString()} ${req.method} ${req.url} ${subtitles.length} subtitles`);
    res.json(subtitles);
});

app.get('/gloss/:videoID', async (req, res) => {
    // Set the response header to JSON
    res.setHeader('Content-Type', 'application/json');
    const errorDownload = { error: 'Failed to download subtitles' };
    const errorParse = { error: 'Failed to parse subtitles' };
    const errorGloss = { error: 'Failed to get glosses' };
    // Download the subtitles for the video
    const videoUrl = `https://www.youtube.com/watch?v=${req.params.videoID}`;
    const sub_file_path = await downloadSubtitles(videoUrl);
    if (!sub_file_path) {
        console.log(errorDownload);
        res.json(errorDownload);
        return;
    }
    const subtitles = await parseSubtitles(sub_file_path);
    if (!subtitles) {
        console.log(errorParse);
        res.json(errorParse);
        return;
    }
    // get the glosses json using subToGloss function
    const glosses = await subToGloss(subtitles, req.params.videoID);
    if (!glosses) {
        console.log(errorGloss);
        res.json(errorGloss);
        return;
    }
    let now = new Date();
    console.log(`${now.toISOString()} ${req.method} ${req.url} ${glosses.length} glosses`);
    res.json(glosses);
});

// Start the Express server
const port = process.env.PORT || 8080;
app.listen(port, () => {
    // log the url
    let url = `http://localhost:${port}`;
    if (process.env.URL) {
        url = `http://${process.env.URL}:${port}`;
    }
    console.log(`Server running at ${url}`);
});
