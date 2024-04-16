import dotenv from 'dotenv';
import OpenAI from 'openai';

dotenv.config();

const openai = new OpenAI({
    key: process.env.OPENAI_API_KEY,
    organization: process.env.OPENAI_ORG_ID,
});

async function main() {
    /*
    const stream = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [{ role: "user", content: "Say this is a test" }],
        stream: true,
    });
    for await (const chunk of stream) {
        process.stdout.write(chunk.choices[0]?.delta?.content || "");
    }
    */
    //Hello how are you? I am your professor Maaz. 
    // //const thread = await openai.beta.threads.create();
    // let run = await openai.beta.threads.runs.createAndPoll(
    //     thread.id,
    //     { 
    //         assistant_id: 'asst_baigKtcyg3D79DUphgHBdIXn',
    //         instructions: "Hello how are you? I am your professor Maaz."
    //     }
    // );
    const thread = await openai.beta.threads.create({
        messages: [
          {
            "role": "user",
            "content": "Hello how are you? I am your professor Maaz.",
          }
        ]
    });

    const run = await openai.beta.threads.runs.createAndPoll(
        thread.id,
        {
            assistant_id: 'asst_baigKtcyg3D79DUphgHBdIXn'
        }
    );

    if (run.status === 'completed') {
        const messages = await openai.beta.threads.messages.list(
            run.thread_id
        );
        for (const message of messages.data.reverse()) {
            console.log(`${message.role} > ${message.content[0].text.value}`);
        }
    } else {
        console.log(run.status);
    }
}

main();