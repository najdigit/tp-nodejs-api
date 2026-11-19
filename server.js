const http = require('http');
const url = require('url');
const postManager = require('./postManager');

const PORT = 3000;

function parseJsonBody(request, callback) {
    let body = '';
    request.on('data', (chunk) => {
        body += chunk.toString();
    });
    request.on('end', () => {
        if (!body) return callback(null, {});
        try {
            const data = JSON.parse(body);
            callback(null, data);
        } catch (error) {
            callback(error, null);
        }
    });
}

function extractId(pathname) {
    const match = pathname.match(/^\/api\/posts\/(\d+)$/);
    return match ? match[1] : null;
}

const server = http.createServer((request, response) => {
    const parsedUrl = url.parse(request.url, true);
    const pathname = parsedUrl.pathname;
    const method = request.method;

    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    response.setHeader('Content-Type', 'application/json');

    if (method === 'OPTIONS') {
        response.writeHead(204);
        return response.end();
    }

    // GET /api/posts
    if (pathname === '/api/posts' && method === 'GET') {
        postManager.getAllPosts((err, posts) => {
            if (err) {
                response.writeHead(500);
                return response.end(JSON.stringify({ error: 'Erreur serveur' }));
            }
            response.writeHead(200);
            response.end(JSON.stringify(posts));
        });
        return;
    }

    // GET /api/posts/:id
    if (pathname.match(/^\/api\/posts\/\d+$/) && method === 'GET') {
        const id = extractId(pathname);
        postManager.getPost(id, (err, post) => {
            if (err) {
                response.writeHead(404);
                return response.end(JSON.stringify({ error: 'Post non trouvé' }));
            }
            response.writeHead(200);
            response.end(JSON.stringify(post));
        });
        return;
    }

    // POST /api/posts
    if (pathname === '/api/posts' && method === 'POST') {
        parseJsonBody(request, (err, data) => {
            if (err) {
                response.writeHead(400);
                return response.end(JSON.stringify({ error: 'JSON invalide' }));
            }
            postManager.insertPost(data, (err2, created) => {
                if (err2) {
                    response.writeHead(500);
                    return response.end(JSON.stringify({ error: 'Erreur création' }));
                }
                response.writeHead(201);
                response.end(JSON.stringify(created));
            });
        });
        return;
    }

    // PUT /api/posts/:id
    if (pathname.match(/^\/api\/posts\/\d+$/) && method === 'PUT') {
        const id = extractId(pathname);
        parseJsonBody(request, (err, data) => {
            if (err) {
                response.writeHead(400);
                return response.end(JSON.stringify({ error: 'JSON invalide' }));
            }
            postManager.updatePost(id, data, (err2, updated) => {
                if (err2) {
                    response.writeHead(404);
                    return response.end(JSON.stringify({ error: 'Post non trouvé' }));
                }
                response.writeHead(200);
                response.end(JSON.stringify(updated));
            });
        });
        return;
    }

    // DELETE /api/posts/:id
    if (pathname.match(/^\/api\/posts\/\d+$/) && method === 'DELETE') {
        const id = extractId(pathname);
        postManager.deletePost(id, (err, deleted) => {
            if (err) {
                response.writeHead(404);
                return response.end(JSON.stringify({ error: 'Post non trouvé' }));
            }
            response.writeHead(200);
            response.end(JSON.stringify({ message: 'Post supprimé', post: deleted }));
        });
        return;
    }

    // Route non trouvée
    response.writeHead(404);
    response.end(JSON.stringify({ error: 'Route non trouvée' }));
});

server.listen(PORT, () => {
    console.log(`✅ Serveur API démarré sur http://localhost:${PORT}`);
    console.log('Routes disponibles :');
    console.log('  GET    /api/posts');
    console.log('  GET    /api/posts/:id');
    console.log('  POST   /api/posts');
    console.log('  PUT    /api/posts/:id');
    console.log('  DELETE /api/posts/:id');
});