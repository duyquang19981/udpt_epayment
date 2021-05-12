/**
 * Created by vinhnt on 6/16/2017.
 */
var express = require('express');
var router = express.Router();
var $ = require('jquery');
const db = require('../db');
const mongoose = require('mongoose');
const User = require('../Models/schema/User.model');
const ChucNang = require('../Models/schema/ChucNang.model');
const KhoaHoc  = require('../Models/schema/KhoaHoc.model');
const GiaoVien = require('../Models/schema/GiaoVien.model');

router.get('/', function(req, res, next){
    res.render('orderlist', { title: 'Danh sách đơn hàng' })
});

//router.post('/create_payment', function (req, res, next) {
router.post('/create_payment', function (req, res, next) {
    var userid = req.user._id;
    var type = req.body.type;
    var prodname = req.body.prodname;
    var price = req.body.totalprice;
    var courseid  = req.body.courseid || '';
    var dateFormat = require('dateformat');
    var date = new Date();

    var desc = 'Thanh toan don hang thoi gian: ' + dateFormat(date, 'yyyy-mm-dd HH:mm:ss') + '\nSan pham: Sach' ;
    var desc_code = "";
    if(type == "1"){
        // thanh toán giỏ hàng
        desc_code = userid + '_type1';
    }
    else if( type == "2"){
         // thanh toán khoa học
         desc_code = courseid + '_type2';
    }
    else{
        res.redirect('/');
        return; 
    }
    
    res.render('order.jade', {title: 'Thanh toán đơn hàng',
    prodname : prodname, 
    amount: price, 
    description: desc_code })
});

router.post('/create_payment_url', function (req, res, next) {
    
    var ipAddr = req.headers['x-forwarded-for'] ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        req.connection.socket.remoteAddress;

    var config = require('config');
    var dateFormat = require('dateformat');

    
    var tmnCode = config.get('vnp_TmnCode');
    var secretKey = config.get('vnp_HashSecret');
    var vnpUrl = config.get('vnp_Url');
    var returnUrl = config.get('vnp_ReturnUrl');

    var date = new Date();

    var createDate = dateFormat(date, 'yyyymmddHHmmss');
    var orderId = dateFormat(date, 'HHmmss');
    var amount = req.body.amount;
    var bankCode = req.body.bankCode;
    
    var orderInfo = req.body.orderDescription;
    var orderType = req.body.orderType;
    var locale = req.body.language;
    if(locale === null || locale === ''){
        locale = 'vn';
    }
    var currCode = 'VND';
    var vnp_Params = {};
    vnp_Params['vnp_Version'] = '2';
    vnp_Params['vnp_Command'] = 'pay';
    vnp_Params['vnp_TmnCode'] = tmnCode;
    // vnp_Params['vnp_Merchant'] = ''
    vnp_Params['vnp_Locale'] = locale;
    vnp_Params['vnp_CurrCode'] = currCode;
    vnp_Params['vnp_TxnRef'] = orderId;
    vnp_Params['vnp_OrderInfo'] = orderInfo;
    vnp_Params['vnp_OrderType'] = orderType;
    vnp_Params['vnp_Amount'] = amount * 100;
    vnp_Params['vnp_ReturnUrl'] = returnUrl;
    vnp_Params['vnp_IpAddr'] = ipAddr;
    vnp_Params['vnp_CreateDate'] = createDate;
    if(bankCode !== null && bankCode !== ''){
        vnp_Params['vnp_BankCode'] = bankCode;
    }

    vnp_Params = sortObject(vnp_Params);

    var querystring = require('qs');
    var signData = secretKey + querystring.stringify(vnp_Params, { encode: false });

    var sha256 = require('sha256');

    var secureHash = sha256(signData);

    vnp_Params['vnp_SecureHashType'] =  'SHA256';
    vnp_Params['vnp_SecureHash'] = secureHash;
    vnpUrl += '?' + querystring.stringify(vnp_Params, { encode: true });

    //Neu muon dung Redirect thi dong dong ben duoi
    res.status(200).json({code: '00', data: vnpUrl})
    //Neu muon dung Redirect thi mo dong ben duoi va dong dong ben tren
    //res.redirect(vnpUrl)
});

router.get('/vnpay_return', async function (req, res, next) {
  
    var vnp_Params = req.query;

    var secureHash = vnp_Params['vnp_SecureHash'];
 
    var userid = req.user._id;


    delete vnp_Params['vnp_SecureHash'];
    delete vnp_Params['vnp_SecureHashType'];

    vnp_Params = sortObject(vnp_Params);

    var config = require('config');
    var tmnCode = config.get('vnp_TmnCode');
    var secretKey = config.get('vnp_HashSecret');

    var querystring = require('qs');
    var signData = secretKey + querystring.stringify(vnp_Params, { encode: false });

    var sha256 = require('sha256');

    var checkSum = sha256(signData);

    var amount = vnp_Params['vnp_Amount'] /100;

    if(secureHash === checkSum){
        //Kiem tra xem du lieu trong db co hop le hay khong va thong bao ket qua
        var OrderInfo = vnp_Params['vnp_OrderInfo'];
        var courseid = "";
        var item = OrderInfo.split('_');
        if(item[1] =='type1'){
            //them khoa hoc vao data
            console.log('type1');
            db._connect();
            var chucnang = await ChucNang.findOne({belongTo:userid}).lean();
                while(chucnang.GioHang.length>0){
                    let temp = chucnang.GioHang.shift();
                    if(chucnang.KhoaHocDaMua.indexOf(temp)<0){
                        chucnang.KhoaHocDaMua.push(temp);
                    } 
                    else(console.log('khong add'));
                }
            
    //        await chucnang.save();
            await ChucNang.findByIdAndUpdate(chucnang._id,chucnang);  
            db._disconnect();
        
        }
        else if(item[1]=='type2'){
            console.log('type 2');
            var courseid = item[0];
            
            db._connect();
            //var chucnang = await ChucNang.findOne({belongTo:userid}).lean();
            //chucnang.KhoaHocDaMua.push(courseid);
            await ChucNang.findOneAndUpdate({belongTo:userid},{$push:{KhoaHocDaMua: courseid}});
            db._disconnect();
        }
        
        res.render('success.jade', {
            code: vnp_Params['vnp_ResponseCode'],
            amount : amount + ' VND',
            orderInfo : vnp_Params['vnp_OrderInfo'],

        })
    } else{
        res.render('success.jade', {code: '97'})
    }
});

router.get('/vnpay_ipn', function (req, res, next) {
    var vnp_Params = req.query;
    var secureHash = vnp_Params['vnp_SecureHash'];

    delete vnp_Params['vnp_SecureHash'];
    delete vnp_Params['vnp_SecureHashType'];

    vnp_Params = sortObject(vnp_Params);
    var config = require('config');
    var secretKey = config.get('vnp_HashSecret');
    var querystring = require('qs');
    var signData = secretKey + querystring.stringify(vnp_Params, { encode: false });
    
    var sha256 = require('sha256');

    var checkSum = sha256(signData);

    if(secureHash === checkSum){
        var orderId = vnp_Params['vnp_TxnRef'];
        var rspCode = vnp_Params['vnp_ResponseCode'];
        //Kiem tra du lieu co hop le khong, cap nhat trang thai don hang va gui ket qua cho VNPAY theo dinh dang duoi
        res.status(200).json({RspCode: '00', Message: 'success'})
    }
    else {
        res.status(200).json({RspCode: '97', Message: 'Fail checksum'})
    }
});

function sortObject(o) {
    var sorted = {},
        key, a = [];

    for (key in o) {
        if (o.hasOwnProperty(key)) {
            a.push(key);
        }
    }

    a.sort();

    for (key = 0; key < a.length; key++) {
        sorted[a[key]] = o[a[key]];
    }
    return sorted;
}

module.exports = router;