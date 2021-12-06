const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/uploadfile');
mongoose.Promise = global.Promise;