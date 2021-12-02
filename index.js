const express = require('express');
require('./db/conn');
var path = require('path');
var bodyParser = require('body-parser');
const app = express();
const api = require('./routes/api');
const File = require('./middleware/upload');
const port = process.env.PORT || 8000

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname,'public')));
app.use('/uploads',express.static(path.join(__dirname,'uploads')));


app.use(express.json());

// initialize routes
app.get('/', (req, res) => {
    res.send('Welcome home!')
});

app.use('/api',File.uploadImage.array("file", 3), api);

app.use(function(err,req,res,next){
    res.status(422).send({error: err.message});
 });

app.listen(port, function(){
    console.log(`now listening for requests ${port}`);
 });