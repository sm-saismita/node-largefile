const express = require('express');
const router = express.Router();
var path = require('path');
const fs = require("fs");
const { Inspection } = require('../models/fileupload');
const csvtojson = require('csvtojson')

const csv = require('fast-csv');
const { StringStream, BufferStream } = require("scramjet");
const ArrayList = require("arraylist");
const { off } = require('process');
const _ = require('lodash');

const CHUNK_SIZE = 5 * 1000 * 1000; // 10MB - 1re 7 zer0,,, 100000 * 6

const fileInspPath = path.join(__dirname,'../uploads/Inspection.csv');
const fileCertPath = path.join(__dirname,'../uploads/certificates.csv');
const fileDefPath = path.join(__dirname,'../uploads/Defects.csv');
const writePath = path.join(__dirname,'../uploads/writePath.json');

let limit = 1300;
let offset = 1;

async function getDataFromDefects(req, res){
    try{
        var prevDefCount = 0;
        var currentDefCount = 0;
        var end_reached = 0;
        var defStream = fs.createReadStream(fileDefPath,{highWaterMark: (5 * 1000 * 1000)});

        const intervalDefObj = setInterval(()=>{
            console.log('---def---');
            console.log('prevDefCount:',prevDefCount);
            console.log('currentDefCount:',currentDefCount);
            if(prevDefCount === currentDefCount && currentDefCount !== 0) {
                prevDefCount = 0;
                currentDefCount = 0;
                if(end_reached === 0)
                defStream.resume();
                else {
                    clearInterval(intervalDefObj);
                    console.log('clear cert data');
                    res.status(200).send("Success");
                }

            } else {
                prevDefCount = currentDefCount;
            }
        }, 100);

        csv.parseStream(defStream, {headers: true})
        .on("data", function(d){
            defStream.pause();
            Inspection.updateOne({Inspection_ID: d.Inspection_ID},{ $push: { Defects: d}},{upsert: true, new: true}, (err, dd) => {
                currentDefCount++;
            });
        })
        .on("end", function(){
            console.log("done def");
            end_reached = 1;
        });
    }
    catch(e) {
        console.log('Error');
        res.status(400).send('Error while fetching data from defects');
    }
}

async function getDataFromCertificates(req, res) {
    try{
        var prevCertCount = 0;
        var currentCertCount = 0;
        var end_reached = 0;
        var certStream = fs.createReadStream(fileCertPath,{highWaterMark: (5 * 1000 * 1000)});

        const intervalCertObj = setInterval(()=>{
            console.log('---cert---');
            console.log('prevCertCount:',prevCertCount);
            console.log('currentCertCount:',currentCertCount);
            if(prevCertCount === currentCertCount && currentCertCount !== 0) {
                prevCertCount = 0;
                currentCertCount = 0;
                if(end_reached === 0)
                    certStream.resume();
                else {
                    clearInterval(intervalCertObj);
                    console.log('clear cert data');
                    getDataFromDefects(req, res);
                    // res.status(200).send("Success");
                }

            } else {
                prevCertCount = currentCertCount;
            }
        }, 100);

        csv.parseStream(certStream, {headers: true})
        .on("data", function(d){
            certStream.pause();
            Inspection.updateOne({Inspection_ID: d.Inspection_ID},{ $push: { Certificates: d}},{upsert: true, new: true}, (err, dd) => {
                currentCertCount++;
            });
        })
        .on("end", function(){
            console.log("done cert");
            end_reached = 1;
        });
    }
    catch(e) {
        console.log('Error');
        res.status(400).send('Error while fetching data from certificate');
    }
}
setInterval(function() { 
    console.log('clear garbage');
    global.gc()
      }, 3500)
// Insert Inspects in to db
async function insertInspectsToDb(req, res) {
    try {
        let inspDataArr = new ArrayList;
        let currentInspCount = 0;
        let prevInspCount = 0;
        let end_reached = 0;
        let stream = fs.createReadStream(fileInspPath,{highWaterMark: CHUNK_SIZE});

        const intervalObj = setInterval(()=>{
            console.log('---insp---');
            console.log('prevInspCount:',prevInspCount);
            console.log('currentInspCount:',currentInspCount);
            if(prevInspCount === currentInspCount && currentInspCount !== 0) {
                prevInspCount = 0;
                currentInspCount = 0;
                Inspection.insertMany(inspDataArr).then(pRes=>{
                    inspDataArr.clear();
                    global.gc();
                    if(end_reached === 0)
                        stream.resume();
                    else {
                        clearInterval(intervalObj);
                        global.gc();
                        inspDataArr = null;
                        delete inspDataArr;
                        setTimeout(getDataFromCertificates(req, res),1000);
                    }
                }).catch(errr=>{
                    console.log('errrrr');
                });

            } else {
                prevInspCount = currentInspCount;
            }
        }, 100);
        
        csv.parseStream(stream, {headers: true})
        .on('error', error => console.error(error))
        .on("data", function(data){
            stream.pause();
            inspDataArr.add(data);
            currentInspCount++;
            // console.log('inspDataArr:', inspDataArr.length);
        })
        .on("end", function() {
            console.log("done insp");
            end_reached = 1;
        });
    }
    catch(e) {
      console.error(e)
      res.status(400).send("Error");

    }
  
}

router.post('/uploadfile',async(req,res,next) => {
    try{
        // Inspection.collection.drop();
        const emp = await Inspection.findOne({});
        if(emp){
            getDataFromCertificates(req, res);
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
