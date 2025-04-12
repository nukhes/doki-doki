const express = require('express');
const app = express();
const path = require('path');

//settings
app.use(express.static('./frontend'));

//routes
app.use(require('./routes/index'))

//starting the server
app.listen((app.get(80)), function () {
    console.log('Listening on port 80')
})
