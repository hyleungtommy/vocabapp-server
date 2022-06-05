var express = require('express');
var bodyParser = require('body-parser');
//const cors = require("cors");
var vocab = require('./routes/vocab');
var language = require('./routes/language');
var user = require('./routes/user');
//var mongoose = require('mongoose');
var app = express();

//var dbUrl = "mongodb://localhost:27017/vocabApp";

// Create application/x-www-form-urlencoded parser
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies
//var urlencodedParser = bodyParser.urlencoded({ extended: false })
app.use(express.static(__dirname + '/html'));
//app.options("*", cors({ origin: 'http://localhost:3000', optionsSuccessStatus: 200 }));
//app.use(cors({ origin: "http://localhost:3000", optionsSuccessStatus: 200 }));

app.use('/vocab',vocab)
app.use('/user',user)
app.use('/language',language)

app.get('/', function (req, res) {
   res.send("Deploy success")
})

/*
app.post('/login', function (req, res) {
    console.log("login username=" + req.body.username + " pw=" + req.body.password)
    res.sendFile(__dirname + "/html/vocab.html")
})
*/

/*
mongoose.connect(dbUrl, { useNewUrlParser: true }, (err) => {
    if (!err) { console.log('MongoDB Connection Succeeded.') }
    else { console.log('Error in DB connection : ' + err) }
});
*/

var server = app.listen(process.env.PORT || 3000, function () {
   var host = server.address().address
   var port = server.address().port
   
   console.log("Example app listening at http://%s:%s", host, port)
})