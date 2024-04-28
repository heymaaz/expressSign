import fs from 'fs';
import path from 'path';

import dotenv from 'dotenv';
import OpenAI from 'openai';

dotenv.config();

const openai = new OpenAI({
    key: process.env.OPENAI_API_KEY,
    organization: process.env.OPENAI_ORG_ID,
});

// export async function subToGloss(subtitles, videoID) {
//     try{


//         const glossFilePath = path.resolve('glosses');
//         if (!fs.existsSync(glossFilePath)) {
//             fs.mkdirSync(glossFilePath, { recursive: true });
//             console.log('Created subtitle directory at:', glossFilePath);
//         }
//         if(fs.existsSync(`${glossFilePath}/${videoID}.json`)){
//             return JSON.parse(fs.readFileSync(`${glossFilePath}/${videoID}.json`, 'utf8'));//return glosses from file
//         }
//         const glosses = [];
//         for (const subtitle of subtitles) {
//             const thread = await openai.beta.threads.create({
//                 messages: [
//                 {
//                     "role": "user",
//                     "content": subtitle.text,
//                 }
//                 ]
//             });

//             const run = await openai.beta.threads.runs.createAndPoll(
//                 thread.id,
//                 {
//                     assistant_id: process.env.OPENAI_ASSISTANT_ID
//                 }
//             );

//             if (run.status === 'completed') {
//                 const messages = await openai.beta.threads.messages.list(
//                     run.thread_id
//                 );
//                 for (const message of messages.data.reverse()) {
//                     if(message.role === 'assistant'){
//                         glosses.push({
//                             start: subtitle.start,
//                             end: subtitle.end,
//                             gloss: message.content[0].text.value || ""
//                         });
//                     }
//                 }
//             } 
//             else {
//                 console.log(run.status);
//             }
//             // for await (const chunk of stream) {
//             //     //glosses.push(chunk.choices[0]?.delta?.content || "");
//             //     glosses.push({
//             //         start: subtitle.start,
//             //         end: subtitle.end,
//             //         gloss: chunk.choices[0]?.delta?.content || ""
//             //     });
//             // }
//         }
//         fs.writeFileSync(`${glossFilePath}/${videoID}.json`, JSON.stringify(glosses, null, 2));
//         return glosses;
//     }
//     catch(error){
//         console.error('Failed to get glosses:', error);
//         return null;
//     }
// }


export async function subToGloss(subtitles, videoID) {
    if (!subtitles || subtitles.length === 0) {
        return null;
    }
    /*
    if(subtitles.length > 50){
        //if there are more than 50 subtitles, we will use send the subtitles sequentially to avoid rate limiting
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
            }
            fs.writeFileSync(`${glossFilePath}/${videoID}.json`, JSON.stringify(glosses, null, 2));
            return glosses;
        }
        catch(error){
            console.error('Failed to get glosses:', error);
            return null;
        }
    }
    */
    
    try {
        // const glossFilePath = path.resolve('glosses');
        // if (!fs.existsSync(glossFilePath)) {
        //     fs.mkdirSync(glossFilePath, { recursive: true });
        //     console.log('Created gloss directory at:', glossFilePath);
        // }
        // if (fs.existsSync(`${glossFilePath}/${videoID}.json`)) {
        //     console.log('Glosses already exist for video:', videoID);
        //     console.log('Returning glosses from file:', `${glossFilePath}/${videoID}.json`);
        //     return JSON.parse(fs.readFileSync(`${glossFilePath}/${videoID}.json`, 'utf8'));
        // }
        
        // const promises = subtitles.map(subtitle => 
        //     openai.beta.threads.create({
        //         messages: [{
        //             role: "user",
        //             content: subtitle.text,
        //         }]
        //     }).then(thread => 
        //         openai.beta.threads.runs.createAndPoll(thread.id, {
        //             assistant_id: process.env.OPENAI_ASSISTANT_ID
        //         }).then(run => 
        //             run.status === 'completed' ?
        //             openai.beta.threads.messages.list(run.thread_id).then(messages => ({
        //                 start: subtitle.start,
        //                 end: subtitle.end,
        //                 gloss: messages.data.reverse().find(message => message.role === 'assistant')?.content[0]?.text?.value || ""
        //             })) :
        //             { start: subtitle.start, end: subtitle.end, gloss: "" }
        //         )
        //     )
        // );
        
        // const glosses = await Promise.all(promises);
        // fs.writeFileSync(`${glossFilePath}/${videoID}.json`, JSON.stringify(glosses, null, 2));
        // return glosses;
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
