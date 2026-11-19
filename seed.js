// seed.js
const https = require('https');
const fs = require('fs');

const API_URL = 'https://jsonplaceholder.typicode.com/posts';

function fetchPosts() {
    https.get(API_URL, (res) => {
        let data = '';
        res.on('data', (chunk) => {
            data += chunk;
        });
        res.on('end', () => {
            try {
                const posts = JSON.parse(data);
                savePosts(posts);
            } catch (err) {
                console.error('Erreur de parsing JSON :', err.message);
            }
        });
    }).on('error', (err) => {
        console.error('Erreur de requête :', err.message);
    });
}

function savePosts(posts) {
    fs.writeFile('posts.json', JSON.stringify(posts, null, 2), 'utf8', (err) => {
        if (err) {
            console.error('Erreur écriture fichier :', err.message);
            return;
        }
        console.log(`✅ ${posts.length} posts sauvegardés dans posts.json`);
    });
}

fetchPosts();