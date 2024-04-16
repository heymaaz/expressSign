import ytdl from 'youtube-dl-exec';
import fs from 'fs';
import path from 'path';
import pkg from 'webvtt-parser';
const { WebVTTParser } = pkg;
const parser = new WebVTTParser();


import { glob } from 'glob'; 

export async function downloadSubtitles(url) {
    const subtitleFilePath = path.resolve('subtitles');
    if (!fs.existsSync(subtitleFilePath)) {
        fs.mkdirSync(subtitleFilePath, { recursive: true });
        console.log('Created subtitle directory at:', subtitleFilePath);
    }

    try {
        const rawInfo = await ytdl(url, {
            dumpSingleJson: true,
            noWarnings: true,
            noCallHome: true,
            noCheckCertificate: true,
            preferFreeFormats: true,
            youtubeSkipDashManifest: true
        });

        const videoId = rawInfo.id;
        // Use glob to search for any English subtitle file variant
        const subtitleFilePattern = path.join(subtitleFilePath, `${videoId}.en*.vtt`);

        let files = glob.sync(subtitleFilePattern);
        if (files.length > 0) {
            //console.log('Subtitle file already exists:', files[0]);
            return files[0];
        } else {
            const commandOptions = {
                'sub-lang': 'en-US,en-GB,en',  // Attempt to download in this order of preference
                'write-sub': true,
                'write-auto-subs': true,
                'skip-download': true,
                'output': `${subtitleFilePath}/${videoId}.%(ext)s`
            };

            //console.log('Running yt-dlp with options:', commandOptions);
            await ytdl(url, commandOptions);

            // Check again after downloading
            files = glob.sync(subtitleFilePattern);
            if (files.length > 0) {
                //console.log('Subtitles downloaded:', files[0]);
                return files[0];
            }
            return null;
        }
    } catch (error) {
        console.error('Failed to download subtitles:', error);
        return null;
    }
}

const videoUrl = 'https://www.youtube.com/watch?v=cGzHrt7RcSg';
const sub_file_path = await downloadSubtitles(videoUrl);
if (sub_file_path) {
    console.log('Subtitles downloaded to:', sub_file_path);
    // Clean the subtitle file and make a json object with timestamps and text
    // For example, you can use the 'webvtt-parser' package
    // https://www.npmjs.com/package/webvtt-parser
    const subtitleData = fs.readFileSync(sub_file_path, 'utf8');
    
    const tree = parser.parse(subtitleData, 'descriptions');
    if(tree.cues) {
        console.log(tree.cues.slice(0, 10));
        // lets make a json object with the start times and text of the subtitles
        /*
        const subtitles = tree.cues.map(cue => {
            return {
                start: cue.startTime,
                end: cue.endTime,
                text: cue.text
            }
        });
        console.log(subtitles.slice(0, 5));
        */
        const subtitles = [];
        tree.cues.forEach(cue => {
            if (subtitles.length > 0 && subtitles[subtitles.length - 1].end === cue.startTime) {
                // If the current cue starts right when the last one ends, append the text
                subtitles[subtitles.length - 1].text += ' ' + cue.text;
                subtitles[subtitles.length - 1].end = cue.endTime;  // Update the end time to the current cue's end
            } else {
                // Otherwise, create a new subtitle object
                subtitles.push({
                    start: cue.startTime,
                    end: cue.endTime,
                    text: cue.text
                });
            }
        });
        
        // console.log(subtitles.slice(0, 50));
        // console.log('Total subtitles:', subtitles.length);
        
    }
    

    // now you can use the tree object to get the subtitles with the start times
    // 


}
else {
    console.error('Failed to download subtitles');
}
