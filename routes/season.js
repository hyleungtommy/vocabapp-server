// list dependencies
var express = require('express');
var util = require('../util');
var router = express.Router();

// add db & model dependencies
var dyanmoClient = require('../dynamoClient');

router.get('/:year/:season',async function(req,res){
    if(req.params.year == undefined || req.params.year.length == 0 || req.params.season == undefined || req.params.season.length == 0){
        res.status(400);
        return res.end("string undefined")
    }
    var items = await getSeasonalAnimes(req.params.year,req.params.season);
    console.log("items=" + items)
    res.setHeader("Content-Type","text/html;charset=UTF-8");
    res.setHeader("Access-Control-Allow-Origin","*");
    res.end(JSON.stringify(items));
})

router.get('/list',async function(req,res){
    var items = await getSeasonList();
    console.log("items=" + items)
    res.setHeader("Content-Type","text/html;charset=UTF-8");
    res.setHeader("Access-Control-Allow-Origin","*");
    res.end(JSON.stringify(items));
})

async function getSeasonalAnimes(year,season){
    
    var param = {
        TableName: "Anime",
        FilterExpression : "#s = :season AND #y = :year",
        ExpressionAttributeNames: {
            '#s' : 'season',
            '#y' : 'year'
        },
        ExpressionAttributeValues: {
            ':season' : {S : season},
            ':year' : {N : year}
        }
    }
    var result =  await dyanmoClient.scan(param).promise();
    return util.formatJSON(result.Items)
}

async function getSeasonList(){
    var param = {
        TableName: "Seasons",
    }
    var result =  await dyanmoClient.scan(param).promise();
    return util.formatJSON(result.Items)
}

module.exports = router