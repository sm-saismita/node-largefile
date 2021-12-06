const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// create student schema & model
const FileSchema = new Schema({
    data: {
        type: Object
    }
});

// Course Modal Schema
const inspectionSchema = new mongoose.Schema({
    data: {
        type: Object
    }
});
  
// Student Modal Schema
const certificateSchema = new mongoose.Schema({
    data: {
        type: Object
    }
});
  
// // Teacher Modal Schema
const defectsSchema = new mongoose.Schema({
    data: {
        type: Object
    }
})

// // Search Modal Schema
const searchSchema = new mongoose.Schema({
    offset: Number,
    limit: Number,
    data: {
        type: Object
    }
})

const File = mongoose.model('file', FileSchema);
// Creating model objects
const Inspection = mongoose.model('inspection', inspectionSchema);
const Certificate = mongoose.model('certificate', certificateSchema);
const Defects = mongoose.model('defects', defectsSchema);
const Search = mongoose.model('searchresult', searchSchema);

module.exports = {
    Inspection, Certificate, Defects, Search, File
};