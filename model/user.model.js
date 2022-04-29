const mongoose = require('mongoose');

var userSchema = new mongoose.Schema({
    username:String,
    password:String,
    langList:[String],
    motherLang:String
});

module.exports = mongoose.model('User',userSchema);