const express = require('express');
const router = express.Router();
var path = require('path');
const fs = require("fs");
const { Inspection } = require('../models/fileupload');

const { Writable } = require('stream');
const csv = require('fast-csv');

const CHUNK_SIZE = 1000000; // 10MB

const fileInspPath = path.join(__dirname,'../uploads/Inspection.csv');
const fileCertPath = path.join(__dirname,'../uploads/certificates.csv');
const fileDefPath = path.join(__dirname,'../uploads/Defects.csv');

async function getDataFromDefects(req, res){
    try{
        var defStream = fs.createReadStream(fileDefPath,{highWaterMark: CHUNK_SIZE});
        var cntsd = 0;
        csv.parseStream(defStream, {headers: true})
        .on("data", function(d){
            defStream.pause();
            Inspection.updateOne({Inspection_ID: d.Inspection_ID},{ $push: { Defects: d}},{upsert: true, new: true}, (err, dd) => {
                console.log('def--',d.Inspection_ID);
                defStream.resume();
            });
        })
        .on("end", function(){
            console.log("done def");
            res.status(200).send("success");
        });
    }
    catch(e) {
        console.log('Error');
        res.status(400).send('Error while fetching data from defects');
    }
}

async function getDataFromCertificates(req, res) {
    try{
        var certStream = fs.createReadStream(fileCertPath,{highWaterMark: CHUNK_SIZE});
        var cnts = 0;
        csv.parseStream(certStream, {headers: true})
        .on("data", function(d){
            certStream.pause();
            Inspection.updateOne({Inspection_ID: d.Inspection_ID},{ $push: { Certificates: d}},{upsert: true, new: true}, (err, dd) => {
                console.log('cert--',d.Inspection_ID);
                certStream.resume();
            });
        })
        .on("end", function(){
            console.log("done cert");
            // res.status(200).send("success");
            getDataFromDefects(req,res);
        });
    }
    catch(e) {
        console.log('Error');
        res.status(400).send('Error while fetching data from certificate');
    }
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
        // Inspection.insertMany(_Inspection).then(pRes=>{
        //     console.log('inserted Inspect ------>',cnt++);
        //     stream.resume();
        // })
        // .catch(err => {
        //     console.log(err);
        //     res.status(201).send('Error:');
        // })
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
        // res.status(200).send('Success');
        getDataFromCertificates(req, res);
        
    });
}

router.post('/uploadfile',async(req,res,next) => {
    try{
        // Inspection.collection.drop();
        const emp = await Inspection.findOne({});
        if(emp){
            getDataFromDefects(req, res);
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
