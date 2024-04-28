import fs from 'fs/promises';

export async function getSignVideosFromGlosses(glosses) {
    try {
        const signs = await fs.readFile('Sign Mappings/updated_mappings.json', 'utf8');
        const signVideosDictionary = JSON.parse(signs);
        let queue = {};
        glosses.forEach(item => {
            let start = item.start;
            let end = item.end;
            let gloss = item.gloss.replaceAll(/[^a-zA-Z0-9 ]/g, "");
            const words = gloss.split(" ");
            let videos = words.map(word => signVideosDictionary[word.toLowerCase()] || word);
            for (let i = 0; i < videos.length; i++) {
                if (videos[i] === words[i]) {
                    //finger spell the word
                    const chars = videos[i].split("");
                    videos[i] = chars.map(char => signVideosDictionary[char.toLowerCase()] || char);
                }
            }
            videos = videos.flat(); //flatten the array
            queue[start] = videos;
        });
        return queue;
    } catch (err) {
        console.error(err);
        throw err; // Re-throw the error to handle it in the calling function
    }
}