// list dependencies
var express = require('express');
var router = express.Router();
var util = require('../util');
var AWS = require("aws-sdk");
var crypto = require("crypto")

// add db & model dependencies
var mongoose = require('mongoose');
var Vocab = require('../model/vocab.model');
var dyanmoClient = require('../dynamoClient');

router.post('/add-single',async function (req, res) {
     var msg = ""
     /*
     var vocab =  new Vocab({
         vocab :req.body.vocab,
         type: req.body.type,
         meaning: req.body.meaning,
         sentence:(req.body.sentence || ""),
         translation:(req.body.translation || ""),
         note:(req.body.note || ""),
         langCode:req.body.langCode,
         userId:req.body.userId
     })
     */
    var vocab = {
        '_id' : {S : crypto.randomUUID()},
        'vocab' : {S : req.body.vocab},
        'type' : {S : req.body.type},
        'meaning' : {S : req.body.meaning},
        'sentence' : {S : (req.body.sentence || "")},
        'translation' : {S : (req.body.translation || "")},
        'note' : {S : (req.body.note || "")},
        'langCode' : {S : req.body.langCode},
        'userId' : {S : req.body.userId},
        'correctAnswerCount' : {N : '0'}

    }
     //console.log("body=" + JSON.stringify(req.body));
     //console.log("add-vocab-signle vocab=" + vocab.vocab + " type=" + vocab.type + " meaning=" + vocab.meaning + " sentence=" + vocab.sentence + " translation=" + vocab.translation + " note=" + vocab.note)
     if(vocab){
         var item = await addVocab(vocab);
         console.log("inserted item=" + JSON.stringify(item));
         if(item){
            msg = "Vocab inserted";
         }else{
            msg = "Cannot insert item";
         }
     }else{
        msg = "Empty item";
     }
     res.status(200)
     res.send(msg);
 })
 
 router.get('/list',async function(req,res){
     var items = await getVocabList();
     //console.log("items=" + items)
     res.setHeader("Content-Type","text/html;charset=UTF-8");
     res.setHeader("Access-Control-Allow-Origin","*");
     res.end(JSON.stringify(items));
 })

router.post('/list-langcode',async function(req,res){
    console.log("list-langcode=" + req.body.userId + "," + req.body.langCode)
    var items = await getVocabListByUserIdAndLangCode(req.body.userId,req.body.langCode);
    //console.log("items=" + items)
    res.setHeader("Content-Type","text/html;charset=UTF-8");
    res.setHeader("Access-Control-Allow-Origin","*");
    res.end(JSON.stringify(items));
})
 
 router.post('/get-single',async function(req,res){
     var item = await getVocabEntry(req.body._id);
     //console.log("items=" + item)
     res.setHeader("Content-Type","text/html;charset=UTF-8");
     res.end(JSON.stringify(item));
 })
 
 router.post('/update-single',async function(req,res){
     var msg = "";
     var vocab =  {
         _id:req.body._id,
         vocab :req.body.vocab,
         type: req.body.type,
         meaning: req.body.meaning,
         sentence:req.body.sentence,
         translation:req.body.translation,
         note:req.body.note
     };
     //console.log("update-vocab-single vocab=" + JSON.stringify(req.body))
     var item = await updateVocab(vocab);
     if(item)
        msg = "Vocab updated"
     else 
        msg = "Cannot update vocab"
     res.status(200)
     res.send(msg);
 })
 
 router.post('/delete-single',async function(req,res){
     await deleteVocab(req.body._id)
     res.status(200)
     res.send("Vocab deleted");
 })

 router.post('/filter/type',async function(req,res){
    var item = await filterByType(req.body.userId,req.body.langCode,req.body.type);
    //console.log("items=" + item)
    res.setHeader("Content-Type","text/html;charset=UTF-8");
    res.end(JSON.stringify(item));
 })

async function addVocab(vocab){
    var param = {
        TableName: "Vocabs",
        Item:vocab
    }
    try{
        //const item = await Vocab.create(vocab)
        //return item;
        const result = await dyanmoClient.putItem(param).promise()
    }catch(err){
        console.log(err);
        return undefined;
    }
}

async function getVocabList(){
    var param = {
        TableName: "Vocabs"
    }
    try{
        //const item = await Vocab.find({})
        //return item;
        const result = await dyanmoClient.scan(param).promise()
        return util.formatJSON(result.Items)
    }catch(err){
        console.log(err);
        return undefined;
    }
}

async function getVocabEntry(id){
    var param = {
        TableName: "Vocabs",
        Key:{
            '_id' : {S : id }
        }
    }
    try{
        //const item = await Vocab.findById(id)
        //return item;
        const result = await dyanmoClient.getItem(param).promise()
        return AWS.DynamoDB.Converter.unmarshall(result.Item)
    }catch(err){
        console.log(err);
        return undefined;
    }
}

async function getVocabListByUserIdAndLangCode(userId,langCode){
    var param = {
        TableName: "Vocabs",
        FilterExpression : "#u = :userId AND #c = :langCode",
        ExpressionAttributeNames: {
            '#u' : 'userId',
            '#c' : 'langCode'
        },
        ExpressionAttributeValues: {
            ':userId' : {S : userId},
            ':langCode' : {S : langCode}
        }
    }
    try{
        //const item = await Vocab.find({userId:userId,langCode:langCode})
        //return item;
        const result = await dyanmoClient.scan(param).promise()
        return util.formatJSON(result.Items)
    }catch(err){
        console.log(err);
        return undefined;
    }
}

async function updateVocab(vocab){
    var id = vocab._id;
    console.log("start updateVocab() id=" + id);
    /*
    const updateDoc = {
        vocab :vocab.vocab,
        type: vocab.type,
        meaning: vocab.meaning,
        sentence:vocab.sentence,
        translation:vocab.translation,
        note:vocab.note
    }
    */
    var param = {
        TableName: "Vocabs",
        UpdateExpression: 'SET #v = :vocab, #t = :type, #m = :meaning,#s = :sentence,#tr = :translation,#n = :note',
        Key:{
            '_id' : {S : id}
        },
        ExpressionAttributeNames: {
            '#v' : 'vocab',
            '#t' : 'type',
            '#m' : 'meaning',
            '#s' : 'sentence',
            '#tr' : 'translation',
            '#n' : 'note'
        },
        ExpressionAttributeValues: {
            ':vocab' : {S : vocab.vocab},
            ':type' : {S : vocab.type},
            ':meaning' : {S : vocab.meaning},
            ':sentence' : {S : vocab.sentence},
            ':translation' : {S : vocab.translation},
            ':note' : {S : vocab.note}
        }
    }
    try{
        //const item = await Vocab.findByIdAndUpdate(id,updateDoc)
        //return item;
        const result = await dyanmoClient.updateItem(param).promise()
        return result
    }catch(err){
        console.log(err);
        return undefined;
    }
}

async function deleteVocab(id){
    var param = {
        TableName: "Vocabs",
        Key:{
            '_id' : {S : id}
        }
    }
    try{
        //await Vocab.findByIdAndRemove(id)
        await dyanmoClient.deleteItem(param).promise()
    }catch(err){
        console.log(err);
    }
}

async function filterByType(userId,langCode,type){
    try{
        var item
        if(type == ""){// treat as an all search
            item = await getVocabListByUserIdAndLangCode(userId,langCode)
        }else{
            var param = {
                TableName: "Vocabs",
                FilterExpression : "#u = :userId AND #c = :langCode AND #t = :type",
                ExpressionAttributeNames: {
                    '#u' : 'userId',
                    '#c' : 'langCode',
                    '#t' : 'type'
                },
                ExpressionAttributeValues: {
                    ':userId' : {S : userId},
                    ':langCode' : {S : langCode},
                    ':type' : {S : type}
                }
            }
            //item = await Vocab.find({userId:userId,langCode:langCode,type:type})
            var result = await dyanmoClient.scan(param).promise()
            var item = util.formatJSON(result.Items)
        }
        return item;
    }catch(err){
        console.log(err);
        return undefined;
    }
}

module.exports = router