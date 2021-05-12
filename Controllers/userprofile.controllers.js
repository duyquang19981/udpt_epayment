const express = require('express');
const route = express.Router();
const path = require('path');
const db = require('../db');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const fs = require('fs');
const router = require('../Controllers/Home.controllers');
const contants = require('../config/contants');
var order = require('./order');
// route.use(bodyParser.urlencoded({ extended: false }));

const bcrypt = require('bcrypt');
const comparePassword = (myPassword, hash) => {
    return bcrypt.compareSync(myPassword, hash);
};
const hashPassword = (myPassword) => {
    const hash = bcrypt.hashSync(myPassword, contants.SALT_HASH);
    return hash;
}
var urlencodedParser = bodyParser.urlencoded({ extended: false });

const User = require('../Models/schema/User.model');
const ChucNang = require('../Models/schema/ChucNang.model');
const KhoaHoc  = require('../Models/schema/KhoaHoc.model');
const GiaoVien = require('../Models/schema/GiaoVien.model');
const { send } = require('process');
const { loadavg } = require('os');
const { profile } = require('console');

//mongoose.set('useNewUrlParser', false);

// combo async await let  
route.get('/', async (req,res)=>{
   
    if (!req.isAuthenticated()){
        
        res.redirect('/Login/');
        return; 
    }
    db._connect();
    const _id =  req.user._id ;
    let data_Obj = {};
    var info = await User.findById(_id).lean();
    console.log('data :>> ', info);
    var oriDate = '';
    if(info && info.NgaySinh){
        oriDate = info.NgaySinh
        var DOB = (oriDate.getMonth()+1) + '/' + oriDate.getDate() + '/' + oriDate.getFullYear() || '';
        info.NgaySinh = DOB;
    }
    db._disconnect();
    res.render('info',{
        layout : 'profile.hbs',
        title:"Profile",
        userinfo : info,
        isAuthentication: req.isAuthenticated(),
    });
});


route.post('/changeinfo', async (req,res)=>{

    if (!req.isAuthenticated()){
        
        res.redirect('/Login/');
        return; 
    }
    const _id = req.user._id ;
    var DOB = req.body.DOB || '01/01/1990';
    db._connect(); 

    // DOB = DOB.replace(/\//g,'-');
    var subDOB = DOB.split('/');
    for (i in subDOB){
        if (subDOB[i] != Number(subDOB[i]) || Number(subDOB[i]) == 0) {
            subDOB[i] = '01';
        }
    }
    var newDOB = subDOB[2] + '-'+subDOB[0]+ '-' + subDOB[1];
    var toDate = new Date(newDOB);
    const update = {
        HoTen : req.body.hoten,
        DiaChi : req.body.diachi,
        NgaySinh : toDate,
        SDT : req.body.SDT,
    };
    let doc = await User.findByIdAndUpdate({_id:_id}, update,function(err){
        if(err){
            res.json({kq:0, ErrMgs:err});
        }else{
            res.redirect('./');
        }
    });
     
    db._disconnect();
});

route.get('/mycourses', async (req,res)=>{

    if (!req.isAuthenticated()){
        res.redirect('/Login/');
        return; 
    }

    const ID = req.user._id ;
    db._connect(); 

    var userCourses = {};
    var pageNumberRequest = req.query.page || 1;
    var perPage = 8;

    var userInfo = await User.findById(ID).lean();
    if(userInfo && userInfo.NgaySinh){
        var oriDate = userInfo.NgaySinh;
        var DOB = oriDate.getMonth() + '/' + oriDate.getDate() + '/' + oriDate.getFullYear();
        userInfo.NgaySinh = DOB;
    }
   
    var KhoaHocDaMua = await ChucNang.aggregate([{
        $lookup: {
            from :"KhoaHoc",
            localField: "KhoaHocDaMua",
            foreignField: "_id",
            as: "KhoaHocDaMua"
        }
    }], async function(err,data){
        if(err){
            res.json({kq:0, ErrMsg:err});
            console.log('sai');
        }
        else{
            for( i of data){
                if (i.belongTo == ID){
                    userCourses = i;
                    break;
                }
            }
          
        }
        var giaovien = [];
        var k = 0;

        for (i of userCourses.KhoaHocDaMua){
            let doc = await GiaoVien.findById(i.GiaoVien, function(err, data){
               
            });
            userCourses.KhoaHocDaMua[k].GiaoVien = doc.TenGiaoVien;
            giaovien[k] = doc;
            k = k + 1;
        }
        // console.log('userCourses.KhoaHocDaMua :>> ', userCourses.KhoaHocDaMua);
        var start = (pageNumberRequest - 1 ) * perPage;
        var end = perPage * pageNumberRequest;
        var coursesInPage = userCourses.KhoaHocDaMua.slice(start,end);
        var totalPage = parseInt(userCourses.KhoaHocDaMua.length / perPage + 1);;
        const pages = [];       // array of page and status
        
        for (let i = 0; i < totalPage; i++) {
            pages[i] = {
                value : i + 1 ,
                isActive : (i+1) == pageNumberRequest,
            }
        }
        const pagesNav = {};
        if(pageNumberRequest > 1){
            pagesNav.prev = Number(pageNumberRequest) - 1;
        }
        if(pageNumberRequest < totalPage){
            pagesNav.next = Number(pageNumberRequest) + 1;
        }
        db._disconnect();
        res.render('usercourses',{
            layout : 'profile.hbs',
            title :'My courses',
            usercourses : coursesInPage,
            pages:pages,
            pagesNav : pagesNav,
            userinfo:userInfo,
            isAuthentication: req.isAuthenticated()
        });
    });
});



route.get('/cart', async (req,res)=>{   
    if (!req.isAuthenticated()){
        res.redirect('/Login/');
        return; 
    }

    const ID =  req.user._id ;

    db._connect(); 
    var userInfo = {};
    var userCart = {};
    var pageNumberRequest = req.query.page || 1;
    var perPage = 8;
 
    var info = await User.findById(ID).lean();
    var oriDate = '';
    if(info && info.NgaySinh){
        oriDate = info.NgaySinh;
        var DOB = (oriDate.getMonth()+1) + '/' + oriDate.getDate() + '/' + oriDate.getFullYear() || '';
        info.NgaySinh = DOB;
    }

    var GioHang = await ChucNang.aggregate([{
        $lookup: {
            from :"KhoaHoc",
            localField: "GioHang",
            foreignField: "_id",
            as: "GioHang"
        }
    }], async function(err,data){
        if(err){
            res.json({kq:0, ErrMsg:err});
            console.log('sai');
        }
        else{
            for( i of data){
                if (i.belongTo == ID){
                    userCart = i;
                    break;
                }
            }
        }
        //tinh tong tien gio hang
        var totalprice = 0;
        for(i of userCart.GioHang){
           
            totalprice+= Number(i.Gia);
        }
        var giaovien = [];
        var k = 0;
        for (i of userCart.GioHang){
            let doc = await GiaoVien.findById(i.GiaoVien);
            userCart.GioHang[k].GiaoVien = doc.TenGiaoVien;
            giaovien[k] = doc;
            k = k + 1;
        }
         
        var start = (pageNumberRequest - 1 ) * perPage;
        var end = perPage * pageNumberRequest;
        var coursesInPage = userCart.GioHang.slice(start,end);
        var totalPage = parseInt(userCart.GioHang.length / perPage + 1);;
        const pages = [];       // array of page and status
        for (let i = 0; i < totalPage; i++) {
            pages[i] = {
                value : i + 1 ,
                isActive : (i+1) == pageNumberRequest,
            }
        }
        const pagesNav = {};
        if(pageNumberRequest > 1){
            pagesNav.prev = Number(pageNumberRequest) - 1;
        }
        if(pageNumberRequest < totalPage){
            pagesNav.next = Number(pageNumberRequest) + 1;
        }

      
        res.render('cart',{
            layout : 'profile.hbs',
            title :'Cart',
            totalprice: totalprice,
            usercart : coursesInPage,
            pages:pages,
            pagesNav : pagesNav,
            userinfo:info,
            isAuthentication: req.isAuthenticated()
        });
        db._disconnect();
    });

    
});

route.get('/delCourse', async (req,res)=>{
    db._connect(); 
    // cần id khóa học xóa
    // if (!req.isAuthenticated()){
    //     res.redirect('/Login/');
    //     return; 
    // }
    var id_user = req.user._id;
    var id_course = req.query.idcourse;
    var course = await KhoaHoc.findById(id_course);
    await ChucNang.findOneAndUpdate({belongTo:id_user},{$pull:{GioHang: id_course}}, function(err){
        if(err){
            console.log('err' + err);
            res.send({status:'Failed',  subtractValue:0});
        }
        else{
            console.log('removed ');   
            res.send({status:'Successed',  subtractValue:course.Gia});
        }
    });
    
    db._disconnect();
});

route.get("/changepw", async (req,res)=>{ 
    if (!req.isAuthenticated()){
        
        res.redirect('/Login/');
        return; 
    }
    const ID =  req.user._id ;
    db._connect(); 
    var userInfo = await User.findById(ID).lean();
    res.render('changepw',{
        title:"Change Password" ,
        layout : 'profile.hbs',
        userinfo : userInfo,
        isAuthentication: req.isAuthenticated()
    });
    db._disconnect();
});

route.post("/postchangepw2", async (req, res) => {
    db._connect(); 
    var ID = req.query.id;  
    var curpw = req.query.curpw;
    var newpw  = req.query.newpw;
    var user = await User.findById(ID);
    if(!comparePassword(curpw,user.Password)){
        res.send('incorrect');
        return;
    }else{console.log("dung");}
    var changepw = await User.findByIdAndUpdate(ID,{Password:hashPassword(newpw)},function(err){
        if(err){
            console.log('Err: ', err);
            res.send('failed');
        }
        else{
            res.send('successed');
        }
    });
    db._disconnect();
}
);

route.post("/postchangepw", async(req,res)=>{
    db._connect(); 
    var ID = req.query.id;  
    var curpw = req.query.curpw;
    var newpw  = req.query.newpw;
    
    var user = await User.findById(ID);
    if(curpw != user.Password){
        res.send('incorrect');
        return;
    }

    var changepw = await User.findByIdAndUpdate(ID,{Password:newpw},function(err){
        if(err){
            console.log('Err: ', err);
            res.send('failed');
        }
        else{
            res.send('successed');
        }
    });
    db._disconnect();
});

route.post('/paymentchoose',async (req,res)=>{
    if (!req.isAuthenticated()){
        res.redirect('/Login/');
        return; 
    }
    const ID =  req.user._id ;
    var {type, totalprice, prodname, courseid} = req.body;
   ;
    // type = 1: thanh toan trong gio hang
    // type = 2: thanh toan trong khoa hoc
    const isCartCheckout = type == '1';
    res.render('payment', {
        title:"Payment" ,
        layout : 'profile.hbs',
        prodname: prodname,
        totalprice: totalprice,
        isCartCheckout: isCartCheckout,
        courseid:courseid,
        isAuthentication: req.isAuthenticated()
    });
    
});

route.use('/order', order);
module.exports = route;