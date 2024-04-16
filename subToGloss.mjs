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
    try{

        
        const glossFilePath = path.resolve('glosses');
        if (!fs.existsSync(glossFilePath)) {
            fs.mkdirSync(glossFilePath, { recursive: true });
            console.log('Created subtitle directory at:', glossFilePath);
        }
        if(fs.existsSync(`${glossFilePath}/${videoID}.json`)){
            return JSON.parse(fs.readFileSync(`${glossFilePath}/${videoID}.json`, 'utf8'));//return glosses from file
        }
        const glosses = [];
        for (const subtitle of subtitles) {
            const thread = await openai.beta.threads.create({
                messages: [
                {
                    "role": "user",
                    "content": subtitle.text,
                }
                ]
            });
        
            const run = await openai.beta.threads.runs.createAndPoll(
                thread.id,
                {
                    assistant_id: process.env.OPENAI_ASSISTANT_ID
                }
            );
        
            if (run.status === 'completed') {
                const messages = await openai.beta.threads.messages.list(
                    run.thread_id
                );
                for (const message of messages.data.reverse()) {
                    if(message.role === 'assistant'){
                        glosses.push({
                            start: subtitle.start,
                            end: subtitle.end,
                            gloss: message.content[0].text.value || ""
                        });
                    }
                }
            } 
            else {
                console.log(run.status);
            }
            // for await (const chunk of stream) {
            //     //glosses.push(chunk.choices[0]?.delta?.content || "");
            //     glosses.push({
            //         start: subtitle.start,
            //         end: subtitle.end,
            //         gloss: chunk.choices[0]?.delta?.content || ""
            //     });
            // }
        }
        fs.writeFileSync(`${glossFilePath}/${videoID}.json`, JSON.stringify(glosses, null, 2));
        return glosses;
    }
    catch(error){
        console.error('Failed to get glosses:', error);
        return null;
    }
}