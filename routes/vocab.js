// list dependencies
var express = require('express');
var router = express.Router();

// add db & model dependencies
var mongoose = require('mongoose');
var Vocab = require('../model/vocab.model');

router.post('/add-single',async function (req, res) {
     var msg = ""
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
     console.log("body=" + JSON.stringify(req.body));
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
     console.log("items=" + items)
     res.setHeader("Content-Type","text/html;charset=UTF-8");
     res.setHeader("Access-Control-Allow-Origin","*");
     res.end(JSON.stringify(items));
 })

router.post('/list-langcode',async function(req,res){
    console.log("list-langcode=" + req.body.userId + "," + req.body.langCode)
    var items = await getVocabListByUserIdAndLangCode(req.body.userId,req.body.langCode);
    console.log("items=" + items)
    res.setHeader("Content-Type","text/html;charset=UTF-8");
    res.setHeader("Access-Control-Allow-Origin","*");
    res.end(JSON.stringify(items));
})
 
 router.post('/get-single',async function(req,res){
     var item = await getVocabEntry(req.body._id);
     console.log("items=" + item)
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
         note:req.body.note,
     };
     console.log("update-vocab-single vocab=" + JSON.stringify(req.body))
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

async function addVocab(vocab){
    try{
        const item = await Vocab.create(vocab)
        return item;
    }catch(err){
        console.log(err);
        return undefined;
    }
}

async function getVocabList(){
    try{
        const item = await Vocab.find({})
        return item;
    }catch(err){
        console.log(err);
        return undefined;
    }
}

async function getVocabEntry(id){
    try{
        const item = await Vocab.findById(id)
        return item;
    }catch(err){
        console.log(err);
        return undefined;
    }
}

async function getVocabListByUserIdAndLangCode(userId,langCode){
    try{
        const item = await Vocab.find({userId:userId,langCode:langCode})
        return item;
    }catch(err){
        console.log(err);
        return undefined;
    }
}

async function updateVocab(vocab){
    var id = vocab._id;
    console.log("start updateVocab() id=" + id);
    const updateDoc = {
        vocab :vocab.vocab,
        type: vocab.type,
        meaning: vocab.meaning,
        sentence:vocab.sentence,
        translation:vocab.translation,
        note:vocab.note
    }
    try{
        const item = await Vocab.findByIdAndUpdate(id,updateDoc)
        return item;
    }catch(err){
        console.log(err);
        return undefined;
    }
}

async function deleteVocab(id){
    try{
        await Vocab.findByIdAndRemove(id)
    }catch(err){
        console.log(err);
    }
}

module.exports = router