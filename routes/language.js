// list dependencies
var express = require('express');
var util = require('../util');
var router = express.Router();

// add db & model dependencies
var Language = require('../model/language.model');
var dyanmoClient = require('../dynamoClient');

router.get('/list',async function(req,res){
    var items = await getLanguageList();
    console.log("items=" + items)
    res.setHeader("Content-Type","text/html;charset=UTF-8");
    res.setHeader("Access-Control-Allow-Origin","*");
    res.end(JSON.stringify(items));
})

async function getLanguageList(){
    
    var param = {
        TableName: "languages"
    }
    var result =  await dyanmoClient.scan(param).promise();
    return util.formatJSON(result.Items)
    
    /*
    try{
        const item = await Language.find({})
        return item;
    }catch(err){
        console.log(err);
        return undefined;
    }
    */
}

module.exports = router