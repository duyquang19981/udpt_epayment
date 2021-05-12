const mongoose=require('mongoose')
const khoahocSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    TenKhoaHoc: String,
    MoTa: String,
    NgayDang: {
        type: Date,
        default: new Date()
    },
    Rating:{
        type: Number,
        min:0,
        max: 5,
        default: 0
    },
    Gia:Number,
    PhanTramGiam:{
        type: Number,
        min: 0,
        max: 100
    },
    HinhAnh:String,
    GioiThieu: String,
    GiaoVien:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'GiaoVien'
    },
    LinhVuc: String,
}, {collection:'KhoaHoc'});

module.exports = mongoose.model('KhoaHoc', khoahocSchema);