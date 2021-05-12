const mongoose = require('mongoose');
const dbName = 'udpt_epayment';
const uri = process.env.MONGODB_URL || `mongodb+srv://duyquang:1234@cluster0.xovaa.gcp.mongodb.net/${dbName}?retryWrites=true&w=majority`
class Database{
    constructor(){
        
    }

    _connect(){
        mongoose.connect(uri, {useNewUrlParser: true,useUnifiedTopology: true })
            .then(() => {console.log('connect mongodb successful')})
            .catch((err) => console.log('connect error'));
    }

    _disconnect(db){
        mongoose.disconnect(() => {
            console.log('disconnect')
        })
        
    }
}


module.exports = new Database();