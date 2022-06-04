// list dependencies
var express = require('express');
var router = express.Router();
var util = require('../util');
var AWS = require("aws-sdk");
var crypto = require("crypto")

// add db & model dependencies
var Language = require('../model/language.model');
var User = require('../model/user.model');
var dyanmoClient = require('../dynamoClient');

router.get('/list',async function(req,res){
    var items = await getUserList();
    console.log("items=" + items)
    res.setHeader("Content-Type","text/html;charset=UTF-8");
    res.setHeader("Access-Control-Allow-Origin","*");
    res.end(JSON.stringify(items));
})

router.post('/get-single',async function(req,res){
    var item = await getUserEntry(req.body._id);
    console.log("items=" + item)
    res.setHeader("Content-Type","text/html;charset=UTF-8");
    res.end(JSON.stringify(item));
})

router.post('/get-langlist',async function(req,res){
    var item = await getLangListByUserId(req.body._id);
    console.log("items=" + item)
    res.setHeader("Content-Type","text/html;charset=UTF-8");
    res.end(JSON.stringify(item));
})

router.post('/get-langlist-new',async function(req,res){
    var item = await getAvailableLangListByUserId(req.body._id);
    console.log("items=" + item)
    res.setHeader("Content-Type","text/html;charset=UTF-8");
    res.end(JSON.stringify(item));
})

router.post('/update-langlist',async function(req,res){
    var msg = "";
    var item = await addNewLang(req.body.userId,req.body.code);
    if(item)
        msg = "Vocab updated"
     else 
        msg = "Cannot update vocab"
     res.status(200)
     res.send(msg);
})

router.post('/create',async function(req,res){
    var msg = "";
    var item = await createUser(req.body.username,req.body.password,req.body.firstLang,req.body.motherLang);
    if(item)
        msg = "User created"
     else 
        msg = "Cannot create user"
    res.status(200)
    res.send(msg);
})

router.post('/check-exist',async function(req,res){
    var msg = "";
    var item = await getUserByName(req.body.username);
    console.log(item)
    if(item && item.length > 0)
        msg = "Exist"
     else 
        msg = ""
    res.status(200)
    res.send(msg);
})

router.post('/login',async function(req,res){
    var userId = await getUserId(req.body.username,req.body.password)
    console.log(userId)
    if(userId && userId.length > 0){
        res.status(200)
        res.send({
            token: 'test123',
            userId: userId
        });
    }else{
        res.status(200)
        res.send({
            token: ''
        });
    }
})



async function getUserList(){
    var param = {
        TableName: "Users"
    }
    var result = await dyanmoClient.scan(param).promise()
    return util.formatJSON(result.Items)
    /*
    try{
        const item = await User.find({})
        return item;
    }catch(err){
        console.log(err);
        return undefined;
    }
    */
}

async function getUserEntry(id){
    var param = {
        TableName: "Users",
        Key:{
            '_id' : {S : id}
        }
    }
    var result = await dyanmoClient.getItem(param).promise()
    const newResult = AWS.DynamoDB.Converter.unmarshall(result.Item)
    return newResult
    /*
    try{
        const item = await User.findById(id)
        return item;
    }catch(err){
        console.log(err);
        return undefined;
    }
    */
}

async function getUserByName(name){
    var param = {
        TableName: "Users",
        FilterExpression: '#n = :name',
        ExpressionAttributeValues: {
            ':name' : {S : name}
        },
        ExpressionAttributeNames: {
            '#n' : 'username'
        }
    }
    var result = await dyanmoClient.scan(param).promise()
    if(result.Items.length > 0)
        return util.formatJSON(result.Items)
    else
        return undefined
    /*
    try{
        const item = await User.find({username:name})
        return item;
    }catch(err){
        console.log(err);
        return undefined;
    }
    */
}

async function getLangListByUserId(id){
    try{
        const user = await getUserEntry(id)
        if(user){
            var langList = user.langList

            var langObject = {}
            var index = 0
            langList.forEach((value)=>{
                index ++;
                var key = ':lang' + index
                langObject[key] = {S : value}
            })

            var param = {
                TableName: "languages",
                FilterExpression: '#c IN (' + Object.keys(langObject) + ')',
                ExpressionAttributeNames: {
                    '#c' : 'code'
                },
                ExpressionAttributeValues: langObject
            }

            var result = await dyanmoClient.scan(param).promise()
            return util.formatJSON(result.Items);
        }
    }catch(err){
        console.log(err);
    }
    return undefined;
}

async function getAvailableLangListByUserId(id){
    try{
        const user = await getUserEntry(id)
        if(user){
            var langList = user.langList

            var langObject = {}
            var index = 0
            langList.forEach((value)=>{
                index ++;
                var key = ':lang' + index
                langObject[key] = {S : value}
            })

            var param = {
                TableName: "languages",
                FilterExpression: 'NOT (#c IN (' + Object.keys(langObject) + '))',
                ExpressionAttributeNames: {
                    '#c' : 'code'
                },
                ExpressionAttributeValues: langObject
            }

            var result = await dyanmoClient.scan(param).promise()
            return util.formatJSON(result.Items);
        }
    }catch(err){
        console.log(err);
    }
    return undefined;
}

async function addNewLang(id,code){
    console.log(code)
    try{
        const user = await getUserEntry(id)
        console.log(user)
        var langList = user.langList
        langList.push(code)
        
        var newLangList = langList.map(function(value){
            return {S : value}
        })

        var param = {
            TableName: "Users",
            UpdateExpression: 'SET #l = :langList',
            Key:{
                '_id' : {S : id}
            },
            ExpressionAttributeNames: {
                '#l' : 'langList'
            },
            ExpressionAttributeValues: {
                ':langList' : {L : newLangList}
            }
        }

        const item = await dyanmoClient.updateItem(param).promise()
        return item;
    }catch(err){
        console.log(err);
        return undefined;
    }
}

async function createUser(name,pw,firstLang,motherLang){

    var param = {
        TableName: "Users",
        Item:{
            '_id' : {S : crypto.randomUUID()},
            'username' : {S : name},
            'password' : {S : pw},
            'langList' : {L : []},
            'motherLang' : {S : motherLang}
        }
    }
    try{
        const item = await dyanmoClient.putItem(param).promise()
        return item;
    }catch(err){
        console.log(err);
        return undefined;
    }
    
    /*
    var user = new User({
        username:name,
        password:pw,
        langList:[firstLang],
        motherLang:motherLang
    })
    try{
        const item = await User.create(user)
        return item;
    }catch(err){
        console.log(err);
        return undefined;
    }
    */
}

async function getUserId(username,password){

    var param = {
        TableName: "Users",
        FilterExpression : "#u = :username AND #p = :password",
        ExpressionAttributeNames: {
            '#u' : 'username',
            '#p' : 'password'
        },
        ExpressionAttributeValues: {
            ':username' : {S : username},
            ':password' : {S : password}
        }
    }
    /*
    console.log(username + " , " + password)
    const item = await User.findOne({
        username:username,
        password:password
    })
    console.log(item)
    */
   const result = await dyanmoClient.scan(param).promise()
   const item = result.Items
    if(item.length > 0) 
        return item[0]._id.S + ""
    else 
        return ""
    
}

module.exports = router