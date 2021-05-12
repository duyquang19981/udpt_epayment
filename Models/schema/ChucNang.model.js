const mongoose = require('mongoose');

const otherSchema = new mongoose.Schema({
    _id: {
        type: mongoose.Schema.Types.ObjectId,
        default: new mongoose.mongo.ObjectId()      
    },
    GioHang:[{
        type: mongoose.Schema.Types.ObjectId,
        //ref: 'KhoaHoc'
    }],
    KhoaHocDaMua:[{
        type: mongoose.Schema.Types.ObjectId,
        // ref: 'KhoaHoc'
    }],
    yeuThich:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    LinhVuc:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'LinhVuc'
    }],
    belongTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {collection:'ChucNang'});
module.exports = mongoose.model('ChucNang', otherSchema);
