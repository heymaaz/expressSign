import fs from 'fs/promises';

async function convertJsonToJsonl(inputFilePath, outputFilePath) {
    try {
        // Read the JSON file
        const data = await fs.readFile(inputFilePath, { encoding: 'utf8' });
        const json = JSON.parse(data);

        // Convert JSON to JSONL
        const jsonl = Object.entries(json).map(([key, value]) => {
            return JSON.stringify({ key, value });
        }).join('\n');

        // Write JSONL to a new file
        await fs.writeFile(outputFilePath, jsonl, { encoding: 'utf8' });
        console.log('Conversion completed successfully.');
    } catch (error) {
        console.error('An error occurred:', error);
    }
}


let signs = await fs.readFile('Sign Mappings/updated_mappings.json', 'utf8')
// get the keys of the json object
let gloss_dict = JSON.parse(signs)
let glosses = Object.keys(gloss_dict)
// convert into a string seperated by commas
let glosses_str = glosses.join(', ')

let str = "You are a sign language translator, skilled in translating English to BSL GLOSS."+
"You should respond to the prompts only with the BSL GLOSS after conversion. "+
"Don't worry about punctuation or capitalisation"+
"Try to keep the glosses short and simple."+
"For example, if the subtitle is 'Hello, how are you?', the gloss should be 'HELLO HOW YOU'"+
"If the subtitle is 'I am fine thank you', the gloss should be 'FINE THANKYOU' "+
"You can only use the following glosses:\n"
+glosses_str+
"\n\nIf gloss is not available, use fingerspelling."+
" For example names of people, places, or things that do not have a gloss, should be fingerspelled."+
" like 'Kolkata', 'James', 'sharpen', 'prune', you should fingerspell them as 'K-O-L-K-A-T-A', 'J-A-M-E-S', 'S-H-A-R-P-E-N' and 'P-R-U-N-E' respectively."+
"\nIf any sentence is too technical, then try to rephrase and make it easier by trying to use the words in gloss";
console.log(str)
