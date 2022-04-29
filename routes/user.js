// list dependencies
var express = require('express');
var router = express.Router();

// add db & model dependencies
var Language = require('../model/language.model');
var User = require('../model/user.model');

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

async function getUserList(){
    try{
        const item = await User.find({})
        return item;
    }catch(err){
        console.log(err);
        return undefined;
    }
}

async function getUserEntry(id){
    try{
        const item = await User.findById(id)
        return item;
    }catch(err){
        console.log(err);
        return undefined;
    }
}

async function getLangListByUserId(id){
    try{
        const user = await getUserEntry(id)
        if(user){
            var langList = user.langList
            console.log(langList)
            const item = await Language.find({code:{$in:langList}})
            return item;
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
            console.log(langList)
            const item = await Language.find({code:{$nin:langList}})
            return item;
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
        const updateDoc = {
            langList : langList
        }
        const item = await User.findByIdAndUpdate(id,updateDoc)
        return item;
    }catch(err){
        console.log(err);
        return undefined;
    }
}

module.exports = router