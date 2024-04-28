import express from 'express';
import cors from 'cors';
import { downloadSubtitles } from './ytdlp.mjs';
import { parseSubtitles } from './subtitleParser.mjs';
import { subToGloss } from './subToGloss.mjs';
import { getSignVideosFromGlosses } from './getSignVideosFromGlosses.mjs';
import e from 'express';
import fs from 'fs';

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
    const errorDownload = 'Failed to download subtitles, as the video does not have any subtitles in English.';
    const errorParse = 'Failed to parse subtitles. The given subtitle is not in the correct webvtt format.';
    const errorGloss = 'Failed to get glosses from OpenAI API. Please try again later.';

    const videoUrl = `https://www.youtube.com/watch?v=${req.params.videoID}`;
    
    try {
        const sub_file_path = await downloadSubtitles(videoUrl);
        if (!sub_file_path) {
            throw new Error(errorDownload);
        }

        const subtitles = await parseSubtitles(sub_file_path);
        if (!subtitles) {
            throw new Error(errorParse);
        }

        const glosses = await subToGloss(subtitles, req.params.videoID);
        if (!glosses) {
            throw new Error(errorGloss);
        }

        let now = new Date();
        console.log(`${now.toISOString()} ${req.method} ${req.url} ${glosses.length} glosses`);
        res.json(glosses);  // Send glosses if everything was successful
    } catch (error) {
        console.error(error);  // Log the error
        res.status(500).json({ error: error.message });  // Send error message and status code
    }
});

app.get('/signed/:videoID', async (req, res) => {
    // Set the response header to JSON
    res.setHeader('Content-Type', 'application/json');
    const errorDownload = 'Failed to download subtitles, as the video does not have any subtitles in English.';
    const errorParse = 'Failed to parse subtitles. The given subtitle is not in the correct webvtt format.';
    const errorGloss = 'Failed to get glosses from OpenAI API. Please try again later.';

    const videoUrl = `https://www.youtube.com/watch?v=${req.params.videoID}`;
    
    try {
        const sub_file_path = await downloadSubtitles(videoUrl);
        if (!sub_file_path) {
            throw new Error(errorDownload);
        }

        const subtitles = await parseSubtitles(sub_file_path);
        if (!subtitles) {
            throw new Error(errorParse);
        }

        const glosses = await subToGloss(subtitles, req.params.videoID);
        if (!glosses) {
            throw new Error(errorGloss);
        }

        const queue = await getSignVideosFromGlosses(glosses);
        res.json(queue);

        // let now = new Date();
        // console.log(`${now.toISOString()} ${req.method} ${req.url} ${glosses.length} glosses`);
        // let signVideosDictionary = {};
        // fs.readFile('Sign Mappings/updated_mappings.json', 'utf8', (err, signs) => {
        //     if (err) {
        //       console.error(err);
        //       return;
        //     }
        //     signVideosDictionary = JSON.parse(signs);
        //     let queue = {};
        //     glosses.forEach(item => {
        //         let start = item.start;
        //         let end = item.end;
        //         let gloss = item.gloss.replaceAll(/[^a-zA-Z0-9 ]/g, "");
        //         const words = gloss.split(" ");
        //         let videos = words.map(word => signVideosDictionary[word.toLowerCase()] || word);
        //         for(let i=0; i<videos.length; i++){
        //             if(videos[i] === words[i]){
        //                 //finger spell the word
        //                 const chars = videos[i].split("");
        //                 videos[i] = chars.map(char => signVideosDictionary[char.toLowerCase()] || char);
        //             }
        //         }
        //         videos = videos.flat();//flatten the array
        //         queue[start] = videos;
        //     });
        //     res.json(queue);  
        // });
        
    } catch (error) {
        console.error(error);  // Log the error
        res.status(500).json({ error: error.message });  // Send error message and status code
    }
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
