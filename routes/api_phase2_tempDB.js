const express = require('express');
const router = express.Router();
var path = require('path');
const fs = require("fs");
const { Inspection, Certificate, Defects} = require('../models/fileupload');

const { Writable } = require('stream');
const csv = require('fast-csv');

const CHUNK_SIZE = 1000000; // 10MB

const fileInspPath = path.join(__dirname,'../uploads/Inspection.csv');
const fileCertPath = path.join(__dirname,'../uploads/certificates.csv');
const fileDefPath = path.join(__dirname,'../uploads/Defects.csv');

let offset = 1;
let limit = 10000;
let totalCount = 0;

async function dropDBCollections(req, res) {
    try{
        Certificate.collection.drop();
        Defects.collection.drop();
        console.log('completed');
        res.status(200).send('Data inserted successfuly.');
    }
    catch(e) {
        res.status(400).send('error drop collection');
    }
}

async function getDataSearch(req, res) {
    try{
        let skipPage = (offset - 1) * limit;
        const inspData = await Inspection.find({},{_id: 0, Inspection_ID: 1}).skip(skipPage).limit(limit);
        // console.log(inspData);
        // return;
        if(inspData){
            let inspectionData = inspData;
            for await(let d of inspectionData){
                if(d.Inspection_ID) {
                    const certSearchData = await Certificate.find({Inspection_ID: d.Inspection_ID},{_id: 0, __v: 0});
                    const defSearchData = await Defects.find({Inspection_ID: d.Inspection_ID},{_id: 0, __v: 0});
                    d.Certificates = certSearchData;
                    d.Defects = defSearchData;
                    // console.log(d);

                    Inspection.findOneAndUpdate({Inspection_ID: d.Inspection_ID},d).then(dd => {
                        console.log(d.Inspection_ID);
                        if(inspectionData.indexOf(d) === (inspectionData.length -1)) {
                            if(totalCount > (offset * limit)) {
                                offset++;
                                getDataSearch(req,res);
                            } else {
                                dropDBCollections(req,res);
                            }
                        }
                    })
                    .catch(err => {
                        console.log(err);
                        res.status(400).send(err);
                    })
                }
            }
        } else {
            res.status(400).send('error!');
        }
    }
    catch(e){
        res.status(400).send('error data search');
    }
}

async function countInspects(req, res){
    try{
        Inspection.count({}, function( err, count){
            console.log( "Number of users:", count );
            if(err) throw err;
            if(count){
                totalCount = count;
                getDataSearch(req, res);
            }
        })
    }
    catch(e) {
        console.log('err!');
    }
}

// Insert Defects in to db
function insertDefectsToDb(req, res){
    var defStream = fs.createReadStream(fileDefPath,{highWaterMark: CHUNK_SIZE});
    var cntsd = 0;
    csv.parseStream(defStream, {headers: true})
    .on("data", function(data){
        defStream.pause();
        const _Defects = new Defects({
            Inspection_ID: data.Inspection_ID,
            Defect_Code: data.Defect_Code,
            Defect_Text: data.Defect_Text,
            Action_1: data.Action_1,
            Action_2: data.Action_2,
            Action_3: data.Action_3,
            Other_Action: data.Other_Action,
            Main_Defect_Code: data.Main_Defect_Code,
            Main_Defect_Text: data.Main_Defect_Text,
            Other_Recognised_Org_Resp: data.Other_Recognised_Org_Resp,
            Recognised_Org_Resp: data.Recognised_Org_Resp,
            Recognised_Org_Resp_Code: data.Recognised_Org_Resp_Code,
            Recognised_Org_Resp_YN: data.Recognised_Org_Resp_YN,
            Action_Code_1: data.Action_Code_1,
            Action_Code_2: data.Action_Code_2,
            Action_Code_3: data.Action_Code_3,
            Defect_ID: data.Defect_ID,
            Class_Is_Responsible: data.Class_Is_Responsible,
            Detention_Reason_Deficiency: data.Detention_Reason_Deficiency,
            Defective_Item_Code: data.Defective_Item_Code,
            Nature_Of_Defect_Code: data.Nature_Of_Defect_Code,
            Nature_Of_Defect_DeCode: data.Nature_Of_Defect_DeCode,
            IsAccidentalDamage: data.IsAccidentalDamage
        });
        // inspectionData.shift();
        _Defects.save().then(pRes=>{
            console.log('inserted Def------>',cntsd++);
            defStream.resume();
        }).catch(err=>{
            console.log(err);
            res.status(201).send('Error:');
        });
    })
    .on("end", function(){
        console.log("done def");
        // res.status(200).send('success');
        countInspects(req, res);
    });

}

// Insert Certificates in to db
function insertCertificatesToDb(req, res) {
    var certStream = fs.createReadStream(fileCertPath,{highWaterMark: CHUNK_SIZE});
    var cnts = 0;
    csv.parseStream(certStream, {headers: true})
    .on("data", function(data){
        certStream.pause();
        const _Certificate = new Certificate({
            Certificate_ID: data.Certificate_ID,
            Inspection_ID: data.Inspection_ID,
            Lrno: data.Lrno,
            Certificate_Title_Code: data.Certificate_Title_Code,
            Certificate_Title: data.Certificate_Title,
            Issuing_Authority_Code: data.Issuing_Authority_Code,
            Issuing_Authority: data.Issuing_Authority,
            Class_Soc_Of_Issuer: data.Class_Soc_Of_Issuer,
            Other_Issuing_Authority: data.Other_Issuing_Authority,
            Issue_Date: data.Issue_Date,
            Expiry_Date: data.Expiry_Date,
            Last_Survey_Date: data.Last_Survey_Date,
            Survey_Authority_Code: data.Survey_Authority_Code,
            Survey_Authority: data.Survey_Authority,
            Other_Survey_Authority: data.Other_Survey_Authority,
            Latest_Survey_Place: data.Latest_Survey_Place,
            Latest_Survey_Place_Code: data.Latest_Survey_Place_Code,
            Survey_Authority_Type: data.Survey_Authority_Type,
            Inspection_Date: data.Inspection_Date,
            Inspected_By: data.Inspected_By
        });
        // inspectionData.shift();
        _Certificate.save().then(pRes=>{
            console.log('inserted Cert------>',cnts++);
            certStream.resume();
        }).catch(err=>{
            console.log(err);
            res.status(201).send('Error:');
        });
    })
    .on("end", function(){
        console.log("done cert");
        // res.status(200).send("success");
        insertDefectsToDb(req,res);
    });
}

// Insert Inspects in to db
function insertInspectsToDb(req, res) {
    var stream = fs.createReadStream(fileInspPath,{highWaterMark: CHUNK_SIZE});
    var cnt = 0;
    csv.parseStream(stream, {headers: true})
    .on("data", function(data){
        stream.pause();
        // console.log(data);
        const _Inspection = new Inspection({
            IHSLR_or_IMO_Ship_No: data.IHSLR_or_IMO_Ship_No,
            Ship_Name: data.Ship_Name,
            Inspection_ID: data.Inspection_ID,
            Inspection_Date: data.Inspection_Date,
            Country: data.Country,
            Inspection_Port_Decode: data.Inspection_Port_Decode,
            UNLOCODE: data.UNLOCODE,
            Expanded_Inspection: data.Expanded_Inspection,
            Followup_Inspection: data.Followup_Inspection,
            Other_Inspection_Type: data.Other_Inspection_Type,
            Ship_Detained: data.Ship_Detained,
            Number_Of_Days_Detained: data.Number_Of_Days_Detained,
            Number_Of_Part_Days_Detained: data.Number_Of_Part_Days_Detained,
            Release_Date: data.Release_Date,
            Number_Of_Defects: data.Number_Of_Defects,
            Ship_Type_Decode: data.Ship_Type_Decode,
            Ship_Type_Code: data.Ship_Type_Code,
            Year_Of_Build: data.Year_Of_Build,
            Keel_Laid: data.Keel_Laid,
            Gross_Tonnage: data.Gross_Tonnage,
            Dead_Weight: data.Dead_Weight,
            Flag: data.Flag,
            CallSign: data.CallSign,
            Class: data.Class,
            Owner: data.Owner,
            Manager: data.Manager,
            Charterer: data.Charterer,
            Cargo: data.Cargo,
            Authorisation: data.Authorisation,
            Source: data.Source,
            Last_Updated: data.Last_Updated
        });
        // inspectionData.shift();
        _Inspection.save().then(pRes=>{
            console.log('inserted Inspect ------>',cnt++);
            stream.resume();
        }).catch(err=>{
            console.log(err);
            res.status(201).send('Error:');
        });
    })
    .on("end", function(){
        console.log("done insp");
        // res.status(200).send("success");
        insertCertificatesToDb(req, res);
    });

}

router.post('/uploadfile',async(req,res,next) => {
    try{
        const emp = await Inspection.findOne({});
        if(emp){
            insertCertificatesToDb(req, res);
        }else{
            // Insert inspections data to the database
            insertInspectsToDb(req, res);
        }
    }
    catch(e) {
        res.send(e);
    }
});

router.post('/getfile',async(req,res,next) => {
    try{
        let {offset,limit} = req.body;
        let skipPage = (offset - 1) * limit;
        const inspData = await Inspection.find({}).skip(skipPage).limit(limit);
        if(inspData){
            console.log(inspData);
            res.status(200).send('emp--success');
        }else{
            res.status(400).send('Data not found'); // 404
        }
    }
    catch(e) {
        res.status(400).send(e);
    }
})

router.get('/test',(req,res) => {
    res.send('success');
})

router.post('/uploadfile',(req,res) => {
    // console.log(req.body);
    const fileInspPath = "";
    const fileCertPath = "";
    const fileDefPath = "";
    req.files.forEach((data)=>{

    })
    console.log(req.files);

    res.send('post upload file');
});

module.exports = router;
