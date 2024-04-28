import fs from 'fs';
import pkg from 'webvtt-parser';
const { WebVTTParser } = pkg;
const parser = new WebVTTParser();



export async function parseSubtitles(sub_file_path) {
    try {
        // This function cleans the subtitle file and make a json object with timestamps and text
        // It uses 'webvtt-parser' package https://www.npmjs.com/package/webvtt-parser
        
        // Read the subtitle file
        const subtitleData = fs.readFileSync(sub_file_path, 'utf8');
        
        // Parse the subtitle data
        const tree = parser.parse(subtitleData, 'descriptions');
        
        // If the tree has cues
        // cues are the subtitle objects
        // https://developer.mozilla.org/en-US/docs/Web/API/VTTCue
        if(tree.cues) {
            
            // Create an array of subtitle objects
            const subtitles = [];
            
            // Loop through each cue in the tree
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
            // return the subtitles array
            console.log("Number of subtitles: "+subtitles.length);
            return subtitles;
        }
    } catch (error) {
        // otherwise, log the error and return null
        console.error('Failed to parse subtitles:', error);
        return null;
    }
}