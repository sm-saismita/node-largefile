const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Course Modal Schema
const inspectionSchema = new mongoose.Schema({
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


// Student Modal Schema
const certificateSchema = new mongoose.Schema({
    Certificate_ID: String,
    Inspection_ID: { type: String, index: true },
    Lrno: String,
    Certificate_Title_Code: String,
    Certificate_Title: String,
    Issuing_Authority_Code: String,
    Issuing_Authority: String,
    Class_Soc_Of_Issuer: String,
    Other_Issuing_Authority: String,
    Issue_Date: String,
    Expiry_Date: String,
    Last_Survey_Date: String,
    Survey_Authority_Code: String,
    Survey_Authority: String,
    Other_Survey_Authority: String,
    Latest_Survey_Place: String,
    Latest_Survey_Place_Code: String,
    Survey_Authority_Type: String,
    Inspection_Date: String,
    Inspected_By: String,
});
  
// // Teacher Modal Schema
const defectsSchema = new mongoose.Schema({
    Inspection_ID: { type: String, index: true },
    Defect_Code: String,
    Defect_Text: String,
    Action_1: String,
    Action_2: String,
    Action_3: String,
    Other_Action: String,
    Main_Defect_Code: String,
    Main_Defect_Text: String,
    Other_Recognised_Org_Resp: String,
    Recognised_Org_Resp: String,
    Recognised_Org_Resp_Code: String,
    Recognised_Org_Resp_YN: String,
    Action_Code_1: String,
    Action_Code_2: String,
    Action_Code_3: String,
    Defect_ID: String,
    Class_Is_Responsible: String,
    Detention_Reason_Deficiency: String,
    Defective_Item_Code: String,
    Nature_Of_Defect_Code: String,
    Nature_Of_Defect_DeCode: String,
    IsAccidentalDamage: String
})


// Creating model objects
const Inspection = mongoose.model('inspection', inspectionSchema);
const Certificate = mongoose.model('certificate', certificateSchema);
const Defects = mongoose.model('defects', defectsSchema);

module.exports = {
    Inspection, Certificate, Defects
};