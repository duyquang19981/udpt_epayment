const mongoose=require('mongoose')
const giaovienSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    TenGiaoVien:String,
    HinhAnh:String,
    NgaySinh:Date,
    ListLinhVuc:[{type:mongoose.Schema.Types.ObjectId,ref:'LinhVuc}'}]
}, {collection:'GiaoVien'});

module.exports = mongoose.model('GiaoVien', giaovienSchema);