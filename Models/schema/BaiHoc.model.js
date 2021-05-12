const mongoose=require('mongoose')
const baihocSchema = new mongoose.Schema({
    _id:mongoose.Schema.Types.ObjectId,
    TenBaiHoc:String,
    MoTa:String,
    Url: String,
    ThoiGian:Date,
    Chuong:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Chuong'
    }
    
}, {collection:'BaiHoc'});

module.exports = mongoose.model('BaiHoc', baihocSchema);