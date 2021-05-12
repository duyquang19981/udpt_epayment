const express = require('express');
const route = express.Router();
const path = require('path');
const db = require('../db');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const fs = require('fs');

const User = require('../Models/schema/User.model');
const ChucNang = require('../Models/schema/ChucNang.model');
const KhoaHoc  = require('../Models/schema/KhoaHoc.model');
const GiaoVien = require('../Models/schema/GiaoVien.model');
const Chuong = require('../Models/schema/Chuong.model');
const BaiHoc = require('../Models/schema/BaiHoc.model');
const router = require('../Controllers/Home.controllers');
//const { Router } = require('express');

router.get('/category/webdev', async (req, res) => {

    db._connect();
    const courseID = '5f0e7ae2bbbbae112c7a54a9';
    const courses = await KhoaHoc.find({LinhVuc:mongoose.Types.ObjectId(courseID)}).lean();
    courses.map(async (course) => {
        course.Gia = course.Gia / 1000;
        var mydate = new Date(course.NgayDang);
        course.NgayDang = mydate.toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });
        course.totalStudent = Math.floor(Math.random() * 20) + 10;

    });

    db._disconnect();
    res.render('category',{bestCourse: courses, isAuthentication: req.isAuthenticated()});
    
});
router.get('/category/datascience', async (req, res) => {

    db._connect();
    const courseID = '5f0e7ae2bbbbae112c7a54aa';
    const courses = await KhoaHoc.find({LinhVuc:mongoose.Types.ObjectId(courseID)}).lean();
    courses.map(async (course) => {
        course.Gia = course.Gia / 1000;
        var mydate = new Date(course.NgayDang);
        course.NgayDang = mydate.toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });
        course.totalStudent = Math.floor(Math.random() * 20) + 10;

    });

    db._disconnect();
    res.render('category',{bestCourse: courses, isAuthentication: req.isAuthenticated()});
    
});
router.get('/category/mobileapp', async (req, res) => {

    db._connect();
    const courseID = '5f0e7ae2bbbbae112c7a54ab';
    const courses = await KhoaHoc.find({LinhVuc:mongoose.Types.ObjectId(courseID)}).lean();
    courses.map(async (course) => {
        course.Gia = course.Gia / 1000;
        var mydate = new Date(course.NgayDang);
        course.NgayDang = mydate.toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });
        course.totalStudent = Math.floor(Math.random() * 20) + 10;

    });

    db._disconnect();
    res.render('category',{bestCourse: courses, isAuthentication: req.isAuthenticated()});
    
});
router.get('/category/gamedev', async (req, res) => {

    db._connect();
    const courseID = '5f0e7ae2bbbbae112c7a54ad';
    const courses = await KhoaHoc.find({LinhVuc:mongoose.Types.ObjectId(courseID)}).lean();
    courses.map(async (course) => {
        course.Gia = course.Gia / 1000;
        var mydate = new Date(course.NgayDang);
        course.NgayDang = mydate.toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });
        course.totalStudent = Math.floor(Math.random() * 20) + 10;

    });

    db._disconnect();
    res.render('category',{bestCourse: courses, isAuthentication: req.isAuthenticated()});
    
});
router.get('/category/database', async (req, res) => {

    db._connect();
    const courseID = '5f0e7ae2bbbbae112c7a54ae';
    const courses = await KhoaHoc.find({LinhVuc:mongoose.Types.ObjectId(courseID)}).lean();
    courses.map(async (course) => {
        course.Gia = course.Gia / 1000;
        var mydate = new Date(course.NgayDang);
        course.NgayDang = mydate.toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });
        course.totalStudent = Math.floor(Math.random() * 20) + 10;

    });

    db._disconnect();
    res.render('category',{bestCourse: courses, isAuthentication: req.isAuthenticated()});
    
});
router.get('/category/softwaretesting', async (req, res) => {

    db._connect();
    const courseID = '5f0e7ae2bbbbae112c7a54af';
    const courses = await KhoaHoc.find({LinhVuc:mongoose.Types.ObjectId(courseID)}).lean();
    courses.map(async (course) => {
        course.Gia = course.Gia / 1000;
        var mydate = new Date(course.NgayDang);
        course.NgayDang = mydate.toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });
        course.totalStudent = Math.floor(Math.random() * 20) + 10;

    });

    db._disconnect();
    res.render('category',{bestCourse: courses, isAuthentication: req.isAuthenticated()});
    
});
router.get('/category/sofwareengineering', async (req, res) => {

    db._connect();
    const courseID = '5f0e7ae2bbbbae112c7a54b0';
    const courses = await KhoaHoc.find({LinhVuc:mongoose.Types.ObjectId(courseID)}).lean();
    courses.map(async (course) => {
        course.Gia = course.Gia / 1000;
        var mydate = new Date(course.NgayDang);
        course.NgayDang = mydate.toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });
        course.totalStudent = Math.floor(Math.random() * 20) + 10;

    });

    db._disconnect();
    res.render('category',{bestCourse: courses, isAuthentication: req.isAuthenticated()});
    
});
router.get('/category/devtools', async (req, res) => {

    db._connect();
    const courseID = '5f0e7ae2bbbbae112c7a54b1';
    const courses = await KhoaHoc.find({LinhVuc:mongoose.Types.ObjectId(courseID)}).lean();
    courses.map(async (course) => {
        course.Gia = course.Gia / 1000;
        var mydate = new Date(course.NgayDang);
        course.NgayDang = mydate.toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });
        course.totalStudent = Math.floor(Math.random() * 20) + 10;

    });

    db._disconnect();
    res.render('category',{bestCourse: courses, isAuthentication: req.isAuthenticated()});
    
});
router.get('/category/Ecommerce', async (req, res) => {

    db._connect();
    const courseID = '5f0e7ae2bbbbae112c7a54b2';
    const courses = await KhoaHoc.find({LinhVuc:mongoose.Types.ObjectId(courseID)}).lean();
    courses.map(async (course) => {
        course.Gia = course.Gia / 1000;
        var mydate = new Date(course.NgayDang);
        course.NgayDang = mydate.toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });
        course.totalStudent = Math.floor(Math.random() * 20) + 10;

    });
    
    db._disconnect();
    res.render('category',{bestCourse: courses, isAuthentication: req.isAuthenticated()});
    
});
module.exports = router;