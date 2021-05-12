const mongoose=require('mongoose')
const chuongSchema = new mongoose.Schema({
    _id:mongoose.Schema.Types.ObjectId,
    TenChuong:String,
    MoTa:String,
    KhoaHoc:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'KhoaHoc'
    }
    
}, {collection:'Chuong'});

module.exports = mongoose.model('Chuong', chuongSchema);