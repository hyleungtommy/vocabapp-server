var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectId;
const utf8 = require('utf8');
var url = "mongodb://localhost:27017/";
const cors = require("cors");

// Create application/x-www-form-urlencoded parser
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies
//var urlencodedParser = bodyParser.urlencoded({ extended: false })
const client = new MongoClient("mongodb://localhost:27017");

app.use(express.static(__dirname + '/html'));
app.options("*", cors({ origin: 'http://localhost:3000', optionsSuccessStatus: 200 }));
app.use(cors({ origin: "http://localhost:3000", optionsSuccessStatus: 200 }));



app.get('/', function (req, res) {
   res.sendFile(__dirname + "/html/login.html")
})

app.post('/login', function (req, res) {
    console.log("login username=" + req.body.username + " pw=" + req.body.password)
    res.sendFile(__dirname + "/html/vocab.html")
})

app.post('/add-vocab-single',function (req, res) {
    
    var vocab =  {
        vocab :req.body.vocab,
        type: req.body.type,
        meaning: req.body.meaning,
        sentence:(req.body.sentence || ""),
        translation:(req.body.translation || ""),
        note:(req.body.note || "")
    }
    console.log("body=" + JSON.stringify(req.body));
    console.log("add-vocab-signle vocab=" + vocab.vocab + " type=" + vocab.type + " meaning=" + vocab.meaning + " sentence=" + vocab.sentence + " translation=" + vocab.translation + " note=" + vocab.note)
    if(vocab.vocab){
        addVocab(vocab);
    }
    
    res.status(200)
    res.send("Vocab inserted");
    
})

app.get('/get-vocab',async function(req,res){
    var items = await getVocabList();
    console.log("items=" + items)
    res.setHeader("Content-Type","text/html;charset=UTF-8");
	res.setHeader("Access-Control-Allow-Origin","*");
    res.end(JSON.stringify(items));
})

app.post('/get-vocab-single',async function(req,res){
    var item = await getVocabEntry(req.body._id);
    console.log("items=" + item)
    res.setHeader("Content-Type","text/html;charset=UTF-8");
    res.end(JSON.stringify(item));
})

app.post('/update-vocab-single',async function(req,res){
    var vocab =  {
        _id:req.body._id,
        vocab :req.body.vocab,
        type: req.body.type,
        meaning: req.body.meaning,
        sentence:req.body.sentence,
        translation:req.body.translation,
        note:req.body.note
    };
    console.log("update-vocab-single vocab=" + JSON.stringify(req.body))
    updateVocab(vocab);
    res.status(200)
    res.send("Vocab updated");
})

app.post('/delete-vocab-single',async function(req,res){
    deleteVocab(req.body._id)
    res.status(200)
    res.send("Vocab deleted");
})

var server = app.listen(8081, function () {
   var host = server.address().address
   var port = server.address().port
   
   console.log("Example app listening at http://%s:%s", host, port)
})

async function addVocab(vocab){
    try{
        await client.connect();
        const database = client.db("vocabApp");
        const collection = database.collection("vocabs");
        const result = await collection.insertOne(vocab);
        await client.close();
    } catch (e) {
        console.log("Error: " + e);
    }
}

async function getVocabList(){
    try{
        let items = [];
        await client.connect();
        const database = client.db("vocabApp");
        const collection = database.collection("vocabs");
        const cursor = await collection.find();
        await cursor.forEach(function(doc){
            items.push(doc);
        });
        console.log("finish find() items=" + items)
        await client.close();
        return items;
    } catch (e) {
        console.log("Error: " + e);
    }
    return ["Nothing"];
}

async function getVocabEntry(id){
    let item = {};
    try{
        await client.connect();
        const database = client.db("vocabApp");
        const collection = database.collection("vocabs");
        const cursor = await collection.findOne({_id:new ObjectId(id)});
        if(cursor){
            item = cursor;
            console.log("finish findOne() items=" + item)
        }else{
            console.log("nothing found by=" + id)
        }
        await client.close();
    } catch (e) {
        console.log("Error: " + e);
    }
    return item;
}

async function updateVocab(vocab){
    var id = vocab._id;
    console.log("start updateVocab() id=" + id);
    try{
        await client.connect();
        const database = client.db("vocabApp");
        const collection = database.collection("vocabs");

        const updateDoc = {
            $set:{
                vocab :vocab.vocab,
                type: vocab.type,
                meaning: vocab.meaning,
                sentence:vocab.sentence,
                translation:vocab.translation,
                note:vocab.note
            }
        }

        const result = await collection.updateOne({_id:new ObjectId(id)}, updateDoc, {});
        console.log("finish updateVocab() count=" + result.modifiedCount)
        await client.close();
    } catch (e) {
        console.log("Error: " + e);
    }
}

async function deleteVocab(id){
    try{
        await client.connect();
        const database = client.db("vocabApp");
        const collection = database.collection("vocabs");
        const result = await collection.deleteOne({_id:new ObjectId(id)});
        console.log("finish deleteVocab() count=" + result.deletedCount)
        await client.close();
    }catch (e) {
        console.log("Error: " + e);
    }
}