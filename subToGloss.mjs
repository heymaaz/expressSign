import fs from 'fs';
import path from 'path';

import dotenv from 'dotenv';
import OpenAI from 'openai';

dotenv.config();

const openai = new OpenAI({
    key: process.env.OPENAI_API_KEY,
    organization: process.env.OPENAI_ORG_ID,
});




export async function subToGloss(subtitles, videoID) {
    if (!subtitles || subtitles.length === 0) {
        return null;
    }
    
    try {
        
        const glossFilePath = path.resolve('glosses');
        if (!fs.existsSync(glossFilePath)) {
            fs.mkdirSync(glossFilePath, { recursive: true });
            console.log('Created gloss directory at:', glossFilePath);
        }
        if (fs.existsSync(`${glossFilePath}/${videoID}.json`)) {
            console.log('Glosses already exist for video:', videoID);
            console.log('Returning glosses from file:', `${glossFilePath}/${videoID}.json`);
            return JSON.parse(fs.readFileSync(`${glossFilePath}/${videoID}.json`, 'utf8'));
        }
        
        // Helper function to chunk the array
        function chunkArray(array, size) {
            const result = [];
            for (let i = 0; i < array.length; i += size) {
                result.push(array.slice(i, i + size));
            }
            return result;
        }
        
        // Process subtitles in chunks of 25
        const chunks = chunkArray(subtitles, 25);
        const processChunk = async (chunk) => {
            const promises = chunk.map(subtitle =>
                openai.beta.threads.create({
                    messages: [{
                        role: "user",
                        content: subtitle.text,
                    }]
                }).then(thread =>
                    openai.beta.threads.runs.createAndPoll(thread.id, {
                        assistant_id: process.env.OPENAI_ASSISTANT_ID
                    }).then(run =>
                        run.status === 'completed' ?
                        openai.beta.threads.messages.list(run.thread_id).then(messages => ({
                            start: subtitle.start,
                            end: subtitle.end,
                            gloss: messages.data.reverse().find(message => message.role === 'assistant')?.content[0]?.text?.value || ""
                        })) :
                        { start: subtitle.start, end: subtitle.end, gloss: "" } // Default object in case of failure
                    ).catch(error => ({
                        start: subtitle.start, 
                        end: subtitle.end, 
                        gloss: "" // Error handling if thread fails
                    }))
                ).catch(error => ({
                    start: subtitle.start,
                    end: subtitle.end,
                    gloss: "" // Error handling if thread creation fails
                }))
            );
            
            return (await Promise.allSettled(promises)).map(result => result.status === 'fulfilled' ? result.value : {
                start: null,
                end: null,
                gloss: "" // Handle rejected promises
            }).filter(gloss => gloss.start !== null); // Filter out invalid entries
        };
        
        const allGlosses = [];
        for (let chunk of chunks) {
            const results = await processChunk(chunk);
            allGlosses.push(...results);
        }
        
        fs.writeFileSync(`${glossFilePath}/${videoID}.json`, JSON.stringify(allGlosses, null, 2));
        return allGlosses;
        
        
    } catch (error) {
        console.error('Failed to get glosses:', error);
        return null;
    }
}
