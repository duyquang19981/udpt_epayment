const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const linhvucSchema = new Schema({
    _id: mongoose.Schema.Types.ObjectId,
    TenLinhVuc: String,
    DanhSachTag: [{type: String,
    unique: true}
    ],
}, {collection:'LinhVuc'})
module.exports = mongoose.model('LinhVuc', linhvucSchema);