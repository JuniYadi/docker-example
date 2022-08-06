const express = require('express');
const app = express();

app.use(express.json());
app.set('trust proxy');

app.get('/', (req, res) => {
    res.send({ header: req.headers, ip: req.ip, server: req.hostname });
});

app.get('/env', (req, res) => {
    res.send({ env: process.env });
});

app.listen(3000, () => {
    console.log('Server started on port 3000');
});