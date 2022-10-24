// list dependencies
var express = require('express');
var util = require('../util');
var router = express.Router();
var AWS = require("aws-sdk");

// add db & model dependencies
//var Language = require('../model/language.model');
var dyanmoClient = require('../dynamoClient');

router.get('/id/:id',async function(req,res){
    if(req.params.id == undefined || req.params.id.length == 0){
        res.status(400);
        return res.end("id string undefined")
    }
    var items = await getAnime(req.params.id);
    console.log("items=" + items)
    res.setHeader("Content-Type","text/html;charset=UTF-8");
    res.setHeader("Access-Control-Allow-Origin","*");
    res.end(JSON.stringify(items));
})

router.get('/search/:str',async function(req,res){
    if(req.params.str == undefined || req.params.str.length == 0){
        res.status(400);
        return res.end("search string undefined")
    }
    var items = await searchAnimeByName(req.params.str);
    console.log("items=" + items)
    res.setHeader("Content-Type","text/html;charset=UTF-8");
    res.setHeader("Access-Control-Allow-Origin","*");
    res.end(JSON.stringify(items));
})

async function getAnime(id){
    
    var param = {
        TableName: "Anime",
        Key:{
            'id' : {N : id }
        }
    }
    var result =  await dyanmoClient.getItem(param).promise();
    return AWS.DynamoDB.Converter.unmarshall(result.Item);
}

async function searchAnimeByName(str){
    
    var param = {
        TableName: "Anime",
        FilterExpression : "contains(#t,:searchStr)",
        ExpressionAttributeNames: {
            '#t' : 'searchTitle'
        },
        ExpressionAttributeValues: {
            ':searchStr' : {S : str.toLowerCase()}
        }
    }
    var result =  await dyanmoClient.scan(param).promise();
    return util.formatJSON(result.Items);
}


module.exports = router