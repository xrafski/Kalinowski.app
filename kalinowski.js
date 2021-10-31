const fs = require('fs');
const http = require('http');
// const https = require('https');
// const privateKey = fs.readFileSync('sslcert/server.key', 'utf8');
// const certificate = fs.readFileSync('sslcert/server.crt', 'utf8');

// const credentials = { key: privateKey, cert: certificate };
const express = require('express');
const app = express();

// Importing routes
const homeRoute = require('./Routes/home');
app.use('/', homeRoute);


// your express configuration here

const httpServer = http.createServer(app);
// const httpsServer = https.createServer(credentials, app);

httpServer.listen(80, () => {
    console.log('Server running on port port 80 (http)');
});


// httpsServer.listen(8443);