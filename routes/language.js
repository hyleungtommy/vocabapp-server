// list dependencies
var express = require('express');
var router = express.Router();

// add db & model dependencies
var Language = require('../model/language.model');

router.get('/list',async function(req,res){
    var items = await getLanguageList();
    console.log("items=" + items)
    res.setHeader("Content-Type","text/html;charset=UTF-8");
    res.setHeader("Access-Control-Allow-Origin","*");
    res.end(JSON.stringify(items));
})

async function getLanguageList(){
    try{
        const item = await Language.find({})
        return item;
    }catch(err){
        console.log(err);
        return undefined;
    }
}

module.exports = router