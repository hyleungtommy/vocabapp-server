const mongoose = require('mongoose');

var vocabSchema = new mongoose.Schema({
    vocab: String,
    type:String,
    meaning:String,
    sentence:String,
    translation:String,
    note:String,
    langCode:String
});

module.exports = mongoose.model('Vocab',vocabSchema);