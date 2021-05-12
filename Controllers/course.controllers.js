const express = require('express');
const route = express.Router();
const path = require('path');
const db = require('../db');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const fs = require('fs');

// route.use(bodyParser.urlencoded({ extended: false }));
var urlencodedParser = bodyParser.urlencoded({ extended: false })


const User = require('../Models/schema/User.model');
const ChucNang = require('../Models/schema/ChucNang.model');
const KhoaHoc  = require('../Models/schema/KhoaHoc.model');
const GiaoVien = require('../Models/schema/GiaoVien.model');
const Chuong = require('../Models/schema/Chuong.model');
const BaiHoc = require('../Models/schema/BaiHoc.model');
const router = require('../Controllers/Home.controllers');


route.get('/', (req,res)=>{
    res.send('detail');
});
router.get('/course/:courseid/lectureslist', async (req,res)=>{

    if (!req.isAuthenticated()){
        
        res.redirect('/Login/');
        return; 
    }
    const courseID = req.params.courseid;
    db._connect(); 
    const course = await KhoaHoc.findById(courseID);
    var chapter = await Chuong.find({KhoaHoc:courseID});
    
    for (i in chapter){
        chapter[i] = chapter[i].toObject();
        var lessons =  await BaiHoc.find({Chuong:chapter[i]._id});
        chapter[i].lessons = lessons;
        for (j in chapter[i].lessons){
            chapter[i].lessons[j] = chapter[i].lessons[j].toObject();
        }
    }
    
    res.render('lectureslist',{
        layout:'coursecontent',
        title : 'Course content',
        course :course.toObject(),
        chapter:chapter,
        isAuthentication: req.isAuthenticated()
    })
    db._disconnect();
});

router.get('/course/:courseid/lecture/:lectureid', async (req,res)=>{

    if (!req.isAuthenticated()){
        
        res.redirect('/Login/');
        return; 
    }
    //const courseID = "5eebb4f0fc13ae0f8c00000a";
    const courseID = req.params.courseid;
    db._connect(); 

    const lectureid = req.params.lectureid;
    const course = await KhoaHoc.findById(courseID);
    var chapter = await Chuong.find({KhoaHoc:courseID});
    
    for (i in chapter){

        chapter[i] = chapter[i].toObject();
        var lessons =  await BaiHoc.find({Chuong:chapter[i]._id});
        chapter[i].lessons = lessons;
        for (j in chapter[i].lessons){
            chapter[i].lessons[j] = chapter[i].lessons[j].toObject();
            if (chapter[i].lessons[j]._id==lectureid){
                chapter[i].lessons[j].active = "true";
            }
        }
    }
    
    var lecture = await BaiHoc.findById(lectureid);
    res.render('lecture',{
        title: 'Lecture',
        layout : 'learning.hbs',
        course :course.toObject(),
        chapter:chapter,
        lecture:lecture.toObject(),
        isAuthentication: req.isAuthenticated()
    });
    db._disconnect();
});

module.exports = route;