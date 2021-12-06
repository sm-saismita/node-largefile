const express = require('express');
const router = express.Router();
var path = require('path');
const fs = require("fs");
const {File, Inspection, Certificate, Defects, Search} = require('../models/fileupload');
const { Writable } = require('stream');
const csv = require('fast-csv');

const CHUNK_SIZE = 1000000; // 10MB

const fileInspPath = path.join(__dirname,'../uploads/Inspection.csv');
const fileCertPath = path.join(__dirname,'../uploads/certificates.csv');
const fileDefPath = path.join(__dirname,'../uploads/Defects.csv');

const createJsonPath = path.join(__dirname,'../uploads/totalStudents.json');

// Upload json obj into db
async function uploadinDatabase(inspectionData, certificateData, defectData, res, offset, limit) {
    let inspData = [];

    inspectionData.forEach((data, index)=>{
        let filteredCertData = certificateData.filter(certData => certData.data.Inspection_ID === data.data.Inspection_ID);
        let filteredDefData = defectData.filter(DefData => DefData.data.Inspection_ID === data.data.Inspection_ID);

        data.data.certificates = filteredCertData ? filteredCertData : [];
        data.data.defects = filteredDefData ? filteredDefData : [];

        inspData.push(data);

        if((inspectionData.length - 1) === index) {
            const _data = new Search({
                offset,
                limit,
                data: inspData,
            });

            _data.save().then(pRes=>{
                res.status(201).send(pRes);
            }).catch(err=>{
                console.log(err);
                res.status(201).send('Error:');
            });
        }
    })
}

async function getDataFromDb(req, res){
    try{
        let {offset,limit} = req.body;
        let skipPage = (offset - 1) * limit;
        const inspData = await Inspection.find({}).skip(skipPage).limit(limit);
        if(inspData){
            let inspectionData = inspData;
            const ids = [];
            for(let d of inspectionData){
                ids.push(d.data.Inspection_ID);
            }
            console.log(ids);
            if(ids.length) {
                const certRecords = await Certificate.find({"data.Inspection_ID":ids});
                let certificateData = certRecords;
                const defRecords = await Defects.find({"data.Inspection_ID":ids});
                let defectsData = defRecords;
                uploadinDatabase(inspectionData, certificateData, defectsData, res, offset, limit);
            } else {
                res.status(400).send('No contents found !')
            }
        } else {
            console.log('err');
        }
    }
    catch(e) {
        res.status(400).send(e);
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
            data: data,
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
        getDataFromDb(req, res);
    });

}

// Insert Certificates in to db
function insertCertificatesToDb(req, res) {
    // res.status(201).send('Success');
    var certStream = fs.createReadStream(fileCertPath,{highWaterMark: CHUNK_SIZE});
    var cnts = 0;
    csv.parseStream(certStream, {headers: true})
    .on("data", function(data){
        certStream.pause();
        const _Certificate = new Certificate({
            data: data,
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
        insertDefectsToDb(req, res);
    });

}

// Insert Inspects in to db
function insertInspectsToDb(req, res) {
    var stream = fs.createReadStream(fileInspPath,{highWaterMark: CHUNK_SIZE});
    var cnt = 0;
    csv.parseStream(stream, {headers: true})
    .on("data", function(data){
        stream.pause();
        const _Inspection = new Inspection({
            data: data,
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
        insertCertificatesToDb(req, res);
    });

}

router.post('/uploadfile',async(req,res,next) => {
    try{
        const emp = await Inspection.findOne({});
        if(emp){
            // 
            const existingData = await Search.find({offset: req.body.offset, limit: req.body.limit});
            if(existingData && existingData.length) {
                res.status(200).send(existingData);
            } else {
                console.log('data not present');
                getDataFromDb(req, res);
            }
        }else{
            // Insert inspections data to the database
            insertInspectsToDb(req, res);
        }
    }
    catch(e) {
        res.send(e);
    }
});

router.get('/getfile',async(req,res,next) => {
    try{
        const emp = await Inspection.findOne({});
        if(emp){
        console.log(emp);
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
