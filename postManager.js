const fs = require('fs');
const path = require('path');

const POSTS_FILE = path.join(__dirname, 'posts.json');

function getAllPosts(callback) {
    fs.readFile(POSTS_FILE, 'utf8', (err, data) => {
        if (err) return callback(err, null);
        try {
            const posts = JSON.parse(data);
            callback(null, posts);
        } catch (parseError) {
            callback(parseError, null);
        }
    });
}

function getPost(id, callback) {
    getAllPosts((err, posts) => {
        if (err) return callback(err, null);
        const post = posts.find((p) => p.id === Number(id));
        if (!post) return callback(new Error('Post non trouvé'), null);
        callback(null, post);
    });
}

function insertPost(newPost, callback) {
    getAllPosts((err, posts) => {
        if (err) return callback(err, null);
        const maxId = posts.reduce((max, p) => (p.id > max ? p.id : max), 0);
        const post = {
            id: maxId + 1,
            userId: newPost.userId || 1,
            title: newPost.title || '',
            body: newPost.body || '',
        };
        posts.push(post);
        savePosts(posts, (saveErr) => {
            if (saveErr) return callback(saveErr, null);
            callback(null, post);
        });
    });
}

function updatePost(id, updatedPost, callback) {
    getAllPosts((err, posts) => {
        if (err) return callback(err, null);
        const index = posts.findIndex((p) => p.id === Number(id));
        if (index === -1) return callback(new Error('Post non trouvé'), null);
        posts[index] = { ...posts[index], ...updatedPost, id: posts[index].id };
        savePosts(posts, (saveErr) => {
            if (saveErr) return callback(saveErr, null);
            callback(null, posts[index]);
        });
    });
}

function deletePost(id, callback) {
    getAllPosts((err, posts) => {
        if (err) return callback(err, null);
        const index = posts.findIndex((p) => p.id === Number(id));
        if (index === -1) return callback(new Error('Post non trouvé'), null);
        const deleted = posts.splice(index, 1)[0];
        savePosts(posts, (saveErr) => {
            if (saveErr) return callback(saveErr, null);
            callback(null, deleted);
        });
    });
}

function savePosts(posts, callback) {
    fs.writeFile(POSTS_FILE, JSON.stringify(posts, null, 2), 'utf8', (err) => {
        callback(err);
    });
}

module.exports = {
    getAllPosts,
    getPost,
    insertPost,
    updatePost,
    deletePost,
};