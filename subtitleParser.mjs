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
        
        if(tree.cues) {
            //console.log(tree.cues.slice(0, 10));
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
            return subtitles;
        }
    } catch (error) {
        console.error('Failed to parse subtitles:', error);
        return null;
    }
}