const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Course Modal Schema
const inspectionSchema = new Schema({
    IHSLR_or_IMO_Ship_No: String,
    Ship_Name: String,
    Inspection_ID: { type: String, index: true },
    Inspection_Date: String,
    Country: String,
    Inspection_Port_Decode: String,
    UNLOCODE: String,
    Expanded_Inspection: String,
    Followup_Inspection: String,
    Other_Inspection_Type: String,
    Ship_Detained: String,
    Number_Of_Days_Detained: String,
    Number_Of_Part_Days_Detained: String,
    Release_Date: String,
    Number_Of_Defects: String,
    Ship_Type_Decode: String,
    Ship_Type_Code: String,
    Year_Of_Build: String,
    Keel_Laid: String,
    Gross_Tonnage: String,
    Dead_Weight: String,
    Flag: String,
    CallSign: String,
    Class: String,
    Owner: String,
    Manager: String,
    Charterer: String,
    Cargo: String,
    Authorisation: String,
    Source: String,
    Last_Updated: String,
    Certificates:Array,
    Defects: Array
});

// Creating model objects
const Inspection = mongoose.model('inspection', inspectionSchema);

module.exports = {
    Inspection
    // , Certificate, Defects
};