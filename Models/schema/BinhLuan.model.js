const mongoose=require('mongoose')
const binhluanSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    NoiDung:String,
    StarRating:{
        type: Number,
        min: 0,
        max: 5
    },
    NgayPost:{
        type: Date,
        default: new Date()
    },
    User: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    KhoaHoc:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'KhoaHoc'
    }
}, {collection:'BinhLuan'});

module.exports = mongoose.model('BinhLuan', binhluanSchema);