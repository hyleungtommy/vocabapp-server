const mongoose = require('mongoose');

var languageSchema = new mongoose.Schema({
    name:String,
    code:String,
    flag:String
});

module.exports = mongoose.model('Language',languageSchema);