const express = require('express');
const router = express.Router();
const path = require('path');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const passport = require('passport')
    , LocalStrategy = require('passport-local').Strategy;

const db = require('../db');
const contants = require('../config/contants');

const KhoaHoc = require('../Models/schema/KhoaHoc.model');
const GiaoVien = require('../Models/schema/GiaoVien.model');
const Chuong = require('../Models/schema/Chuong.model');
const BinhLuan = require('../Models/schema/BinhLuan.model');
const User = require('../Models/schema/User.model');
const ChucNang = require('../Models/schema/ChucNang.model');
const LinhVuc = require('../Models/schema/LinhVuc.model')


router.get(contants.HOME_LINK, async (req, res) => {
    
    db._connect();
    const cheapest = await KhoaHoc.find({}).sort({Gia: 1}).limit(6).populate('GiaoVien', 'TenGiaoVien').lean();
    cheapest.map(async (course) => {
        course.Gia = course.Gia / 1000;
        var mydate = new Date(course.NgayDang);
        course.NgayDang = mydate.toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });
        course.totalStudent = Math.floor(Math.random() * 20) + 10;
    });

    const newest = await KhoaHoc.find({}).sort({NgayDang: -1}).limit(6).populate('GiaoVien', 'TenGiaoVien').lean();
    newest.map(async (course) => {
        course.Gia = course.Gia / 1000;
        var mydate = new Date(course.NgayDang);
        course.NgayDang = mydate.toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });
        course.totalStudent = Math.floor(Math.random() * 20) + 10;
    });

    const bestCourse = await KhoaHoc.find({}).sort({Rating:-1}).limit(6).populate('GiaoVien', 'TenGiaoVien').lean();
    bestCourse.map(async (course) => {
        course.Gia = course.Gia / 1000;
        var mydate = new Date(course.NgayDang);
        course.NgayDang = mydate.toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });
        course.totalStudent = Math.floor(Math.random() * 20) + 10;
    });

    if(req.isAuthenticated()){
        const linhvucfollow = await ChucNang.findOne({belongTo: req.user._id});
        let khoaHocLQ = await KhoaHoc.find({LinhVuc: linhvucfollow.LinhVuc[0]}).limit(6).populate('GiaoVien', 'TenGiaoVien').lean();
        if(!khoaHocLQ.length){
            khoaHocLQ = await KhoaHoc.find({}).limit(6).populate('GiaoVien', 'TenGiaoVien').lean();
        }

        db._disconnect();
        return res.render('homepage', { cheapest, newest, bestCourse, isAuthentication: req.isAuthenticated(), khoaHocLQ});
    }else{
        db._disconnect();
        return res.render('homepage', { cheapest, newest, bestCourse, isAuthentication: req.isAuthenticated()});
    }
    
    
});

router.get(contants.COURSE_ID_LINK, async (req, res) => {
    db._connect();
    const { _id } = req.params;
    const course = await KhoaHoc.findOne({ _id }).lean();
    const course_latest = await KhoaHoc.find({ _id: { $ne: _id } }).limit(3).lean();
    const teacher = await GiaoVien.findOne({ _id: course.GiaoVien }).lean();
    const chuong = await Chuong.find({ KhoaHoc: _id }).lean();;
    const comment = await BinhLuan.find({ KhoaHoc: _id }).sort({NgayPost:"desc"}).populate('User').lean();
    const {TenLinhVuc} = await LinhVuc.findOne({_id: course.LinhVuc}).lean();
    console.log(TenLinhVuc)
    course.rate = comment.length;
    comment.forEach(cmt => {
        let mydate = new Date(cmt.NgayPost);
        cmt.datePost = mydate.toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });
    });
    let rating_hbs = '';
    for (let i = 0; i < course.Rating; i++) {
        rating_hbs += `<i></i>`
    }
    course.rating_hbs = rating_hbs;
    let UserId = '';
    if(req.isAuthenticated()){
        UserId = req.user._id;
    }
    db._disconnect();
    res.render('detailcourse', { course, course_latest, teacher, chuong, comment, totalLec: chuong.length ,isAuthentication: req.isAuthenticated(), User: UserId, TenLinhVuc});
})

router.get(contants.LOGIN, checkNotAuthenticated, (req, res) => {
    // console.log(req.flash('error'))
    req.session.returnTo = req.header('Referer');
    res.render('login',{msg: req.flash('error')});
});

router.get(contants.SIGN_UP,checkNotAuthenticated, async (req, res) => {
    //get linhvuc
    db._connect();
    const linhvuc = await LinhVuc.find().limit(8).lean();
    res.render('signup', {linhvuc:linhvuc});
});
// ! TODO
router.post(contants.LOGIN, passport.authenticate('local',{
        failureRedirect: '/login', 
        failureFlash: 'Invalid username or password.', 
        failureFlash: true}), (req, res) => {
        
        if (req.session.returnTo) {
            returnTo = req.session.returnTo
            delete req.session.returnTo
            return res.redirect(returnTo);
        }
        return res.redirect('/');
    }
);

router.post(contants.SIGN_UP, async (req, res) => {
    if(
		req.body['g-recaptcha-response'] === undefined ||
		req.body['g-recaptcha-response'] === '' ||
		req.body['g-recaptcha-response'] === null
	){
		const linhvuc = await LinhVuc.find().limit(8).lean();
		return res.render('signup',{"msg":"Check Captcha!!!",linhvuc:linhvuc });

    }
    const {topic} = req.body ;
    const { fullname, email, password } = req.body;
    
    // *Check data
    // *TODO
    try {
        db._connect();
        let NgaySinh = new Date('1990-01-01')
        let user = new User({ HoTen: fullname, Email: email, Password: hashPassword(password), Avt:"https://lh3.googleusercontent.com/-XdUIqdMkCWA/AAAAAAAAAAI/AAAAAAAAAAA/4252rscbv5M/photo.jpg", NgaySinh: NgaySinh });
        await user.save();

        // khoi tao collection Chuc nang, them LinhVuc(personalization)
        let chucnang = new ChucNang({LinhVuc: topic, belongTo:user._id});
        await chucnang.save();
        db._disconnect();
       
        return res.redirect('/login')
    } catch (error) {
        console.log(error)
        const linhvuc = await LinhVuc.find().limit(8).lean();
        return res.render('signup',{"msg":"Error!!!", linhvuc:linhvuc});
    }

});

router.get(contants.LOG_OUT, (req, res) => {
    req.logout();
    res.redirect('/login');
})

router.get('/courses', async (req, res) => {
    db._connect();

    const courses = await KhoaHoc.find({}).lean();
    courses.map(async (course) => {
        course.Gia = course.Gia / 1000;
        var mydate = new Date(course.NgayDang);
        course.NgayDang = mydate.toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });
        course.totalStudent = Math.floor(Math.random() * 20) + 10;
        
    });
    
    db._disconnect();
    res.render('sort',{bestCourse: courses, isAuthentication: req.isAuthenticated()});
});

router.get('/course/gia/:type', async (req, res) => {
    const {type} = req.params;
    let sort = type == '1' ? 'Tăng dần' : 'Giảm dần'
    db._connect();
    const courses = await KhoaHoc.find({}).sort({Gia: parseInt(type)}).lean();
    await courses.map(async (course) => {
        course.Gia = course.Gia / 1000;
        var mydate = new Date(course.NgayDang);
        course.NgayDang = mydate.toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });
        course.totalStudent = Math.floor(Math.random() * 20) + 10;
        
    });
    
    res.render('sort',{bestCourse: courses, sort, isAuthentication: req.isAuthenticated()});
    db._disconnect();
});

router.get('/course/rating/:type', async (req, res) => {
    const {type} = req.params;
    let sort = type == '1' ? 'Tăng dần' : 'Giảm dần'
    db._connect();
    const courses = await KhoaHoc.find({}).sort({Rating: parseInt(type)}).lean();
    await courses.map(async (course) => {
        course.Gia = course.Gia / 1000;
        var mydate = new Date(course.NgayDang);
        course.NgayDang = mydate.toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });
        course.totalStudent = Math.floor(Math.random() * 20) + 10;
        
    });
    
    res.render('sort',{bestCourse: courses, sort, isAuthentication: req.isAuthenticated()});
    db._disconnect();
})

router.get('/course/:courseid', (req, res) => {
    return res.status(200).json({ msg: 'successful', data: { courseId: req.params.courseid } })
});

router.get('/search', async(req, res) => {
    db._connect();
    const courses = await KhoaHoc.aggregate([
        {
            $match: {
                $or:[{
                    TenKhoaHoc:{
                        $regex:req.query.q,
                        $options: 'i'
                    }
                },
                {
                    MoTa:{
                        $regex:req.query.q,
                        $options: 'i'
                    }
                }
                ]
            }
        }]);
    await courses.map(async (course) => {
        course.Gia = course.Gia / 1000;
        var mydate = new Date(course.NgayDang);
        course.NgayDang = mydate.toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });
        course.totalStudent = Math.floor(Math.random() * 20) + 10;
    });
    db._disconnect();
    res.render('search',{bestCourse: courses, isAuthentication: req.isAuthenticated()});
})

const MoMo = require('../config/payment');
const crypto = require('crypto');
const https = require('https');
router.get('/payment/:id/:amount', async (request, response) => {
    if (!request.isAuthenticated()){
        response.redirect('/login/');
        return; 
    }
    // Tạo mã requestId
    const requestId = 'REQ' + getRndInteger(100,1000);
    // Số tiền giao dịch
    const amount = request.params.amount;
    // tạo mã đơn hàng orderId
    
    const orderId = 'OR' + request.params.id + getRndInteger(100,1000);
    const orderInfo = `${request.user._id},${request.params.id}`;
    var rawSignature = "partnerCode=" + MoMo.partnerCode + "&accessKey=" + MoMo.accessKey + "&requestId=" + requestId + "&amount=" + amount + "&orderId=" + orderId + "&orderInfo=" + orderInfo + "&returnUrl=" + MoMo.returnUrl + "&notifyUrl=" + MoMo.notifyurl + "&extraData=" + MoMo.extraData;
    var signature = crypto.createHmac('sha256', MoMo.serectkey)
        .update(rawSignature)
        .digest('hex');
    
    var body = JSON.stringify({
        partnerCode: MoMo.partnerCode,
        accessKey: MoMo.accessKey,
        requestId: requestId,
        amount: amount,
        orderId: orderId,
        orderInfo: orderInfo,
        returnUrl: MoMo.returnUrl,
        notifyUrl: MoMo.notifyurl,
        extraData: MoMo.extraData,
        requestType: MoMo.requestType,
        signature: signature,
    })
    var options = {
        hostname: 'test-payment.momo.vn',
        port: 443,
        path: '/gw_payment/transactionProcessor',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(body)
        }
    };
    var req = await https.request(options, (res) => {
        res.setEncoding('utf8');
        res.on('data', (body) => {
            
            response.redirect(JSON.parse(body).payUrl);
        });
        res.on('end', () => {
            console.log('No more data in response.');
        });
    });
    req.write(body);
    req.end();
})

function getRndInteger(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

router.get('/comfirm', async (req, res) => {
    db._connect();
    var data = Object.assign([], req.query);
    data.isSuccess = false;
    if(req.query.errorCode == '0'){
        data.isSuccess = true;
        console.log(req.query)
        try {
            const exDataMoMo = req.query.orderInfo.split(',');
            const belongTo = exDataMoMo[0] || null;
            const courseId = exDataMoMo[1] || null;
            if(courseId == 'cart'){
                const cartBeforeDelete = await ChucNang.findOne({belongTo});
                await ChucNang.findOneAndUpdate({belongTo}, { $push: { KhoaHocDaMua: cartBeforeDelete.GioHang},GioHang: [] })
                db._disconnect();
                return res.render('comfirm', {data: data});
            }
            const result = await KhoaHoc.findById(courseId).lean();
            console.log(result)
            if(result){
                const checkBelongUser = await ChucNang.findOne({belongTo}).lean();
                if(!checkBelongUser){
                    let newKhoaHocDaMua = new ChucNang({belongTo, KhoaHocDaMua: [courseId]});
                    await newKhoaHocDaMua.save();
                }else{
                    await ChucNang.findByIdAndUpdate(checkBelongUser._id, { $push: { KhoaHocDaMua: courseId } })
                }
                await ChucNang.findByIdAndUpdate(checkBelongUser._id, { $pull: { GioHang: courseId } })
            }
        } catch (error) {
            console.log(error);
        }
    }
    db._disconnect();
    res.render('comfirm', {data: data});
})
const mongoose=require('mongoose');
const { query } = require('express');
router.post('/createComment', async (req, res) => {
    try {
        db._connect();
        const {NoiDung, NgayPost, User, KhoaHoc} = req.body;
        const newCommnet = new BinhLuan({_id: new mongoose.Types.ObjectId(),NoiDung, NgayPost, User, KhoaHoc});
        await newCommnet.save();
        db._disconnect();
    } catch (error) {
        console.log(error);
        return res.send({success: false, msg:"Create comment is failed"});
    }
    return res.send({success: true, msg:"Create comment is successfull"});
})

router.post('/addtocart', async (req, res) => {
    if(!req.user){
        return res.status(401).send({success: false, msg:"You must be login"});
    }
    
    try {
        db._connect();
        const {id: courseId} = req.body;
        const {user} = req;

        const checkGioHang = await ChucNang.findOne({belongTo: user._id}).lean();
        if(!checkGioHang){
            const newChucNang = new ChucNang({_id: new mongoose.Types.ObjectId(), belongTo: user._id, GioHang: [courseId]});
            await newChucNang.save();
            db._disconnect();
            return res.status(201).send({success: true, msg:"Add course is successfull", mount: 1});
        }
        const {GioHang, KhoaHocDaMua} = checkGioHang;
        if(KhoaHocDaMua.findIndex(course => course == courseId) != -1){
            db._disconnect();
            return res.status(409).send({success: false, msg:"Course was bought"});
        }
        else if(GioHang.findIndex(course => course == courseId) != -1){
            db._disconnect();
            return res.status(409).send({success: false, msg:"Course was exists"});
        }else if(GioHang){
            GioHang.push(courseId);
            const result = await ChucNang.findOneAndUpdate({_id: checkGioHang._id}, { $set: {GioHang: GioHang}});
            db._disconnect();
            return res.status(200).send({success: true, msg:"Course was added", mount: GioHang.length});
        }
        
        db._disconnect();
    } catch (error) {
        return res.status(404).send({success: false, msg:"Add course is failed"});
    }
    
})


const hashPassword = (myPassword) => {
    const hash = bcrypt.hashSync(myPassword, contants.SALT_HASH);
    return hash;
}

function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
		return next();
	}
	res.redirect('/Login/');
}

function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
		return res.redirect('/');
	}
	next();
}

router.get('/category', async(req,res)=>{
    db._connect();

    const courses = await KhoaHoc.find({}).lean();
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