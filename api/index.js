// Starts server in port 80
const express = require('express');
const app = express();

app.use(express.static('./frontend'));

app.use(require('./routes/index'))

app.listen((app.get(80)), function () {
    console.log('Listening on port 80')
})
