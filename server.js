
var express = require("express")
var app = express()
var db = require("./database.js")

var md5 = require("md5")

var bodyParser = require("body-parser");
//app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json());

const cors = require("cors");

app.use(cors());

var HTTP_PORT = 8000 

app.listen(HTTP_PORT, () => {
    console.log("Server running on port %PORT%".replace("%PORT%",HTTP_PORT))
});

app.get("/", (req, res, next) => {
    res.json({"message":"Ok"})
});

app.post("/api/connect", (req, res, next)=>{
    var errors=[]
    if (!req.body.user1){
        errors.push("user1 needed");
    }
    if (!req.body.user2){
        errors.push("user2 needed");
    }
    if (errors.length){
        res.status(400).json({"error":errors.join(","),"data":req.body},);
        return;
    }
    var data = {
        user1: req.body.user1,
        user2: req.body.user2,
        commit : req.body.commit
    }
    var sql ='INSERT INTO connection (user1, user2, last_commit) VALUES (?,?,?)'
    var params =[data.user1, data.user2, data.commit]
    db.run(sql, params, function (err, result) {
        if (err){
            res.status(400).json({"error": err.message})
            return;
        }
        res.json({
            "message": "success",
            "data": data,
            "id" : this.lastID
        })
    });
})

app.post("/api/addChat", (req, res, next)=>{
    
    
    var sql ='INSERT INTO chat (`from`, `to`, `text`, `time`) VALUES (?,?,?,?)'
    var params =[req.body.from, req.body.to, req.body.text, req.body.time]
    db.run(sql, params, function (err, result) {
        if (err){
            res.status(400).json({"error": err.message})
            return;
        }
        res.json({
            "message": "success",
            
            "id" : this.lastID
        })
    });
})

app.get("/api/users", (req, res, next) => {
    var sql = "select * from user"
    var params = []
    db.all(sql, params, (err, rows) => {
        if (err) {
          res.status(200).json({"error":err.message});
          return;
        }
        res.json({
            "message":"success",
            "data":rows
        })
      });
});

app.get("/api/user/:id", (req, res, next) => {
    var sql = "select * from user where email = ?"
    var params = [req.params.id]
    db.get(sql, params, (err, row) => {
        if (err) {
          res.status(200).json({"error":err.message});
          return;
        }
        res.json({
            "message":"success",
            "data":row
        })
      });
});

app.post("/api/login", (req, res, next) => {
    var errors = [];
    if (!req.body.password) {
        errors.push("No password specified");
    }
    if (!req.body.email) {
        errors.push("No email specified");
    }
    if (errors.length) {
        res.json({ "error": errors.join(","), "data": req.body });
        return;
    }

    var data = {
        email: req.body.email,
        password: md5(req.body.password)
    };

    var sql = 'SELECT * FROM user WHERE email = ? AND password = ?';
    var params = [data.email, data.password];
    db.get(sql, params, function (err, result) {
        if (err) {
            res.status(500).json({ "error": err.message });
            return;
        }
        if (!result) {
            res.status(401).json({ "error": "Invalid email or password" });
            return;
        }
        res.json({
            "message": "success",
            "data": result
        });
    });
});

app.post("/api/user/", (req, res, next) => {
    var errors=[]
    if (!req.body.password){
        errors.push("No password specified");
    }
    if (!req.body.email){
        errors.push("No email specified");
    }
    if (errors.length){
        res.status(400).json({"error":errors.join(","),"data":req.body},);
        return;
    }
    var data = {
        name: req.body.name,
        email: req.body.email,
        password : md5(req.body.password)
    }
    var sql ='INSERT INTO user (name, email, password) VALUES (?,?,?)'
    var params =[data.name, data.email, data.password]
    db.run(sql, params, function (err, result) {
        if (err){
            res.status(400).json({"error": err.message})
            return;
        }
        res.json({
            "message": "success",
            "data": data,
            "id" : this.lastID
        })
    });
})

app.get("/api/getConnection/:email", (req, res, next) =>{
    var sql = "select * from connection where `user1` = ?"
    var params = [req.params.email]
    db.all(sql, params, (err, rows) => {
        if (err) {
          res.status(200).json({"error":err.message});
          return;
        }
        let records=[];
        rows.forEach((row) =>records.push(row));
        res.json({
            "message":"success",
            "data":records
        })
      });
})
app.get("/api/msg/:from/:to", (req, res, next) =>{
    var sql = "select * from chat where ((( `from` = ?) and (`to` = ?) ) or (( `from` = ?) and (`to` = ?)))"
    var params = [req.params.from,req.params.to,req.params.to,req.params.from]
    db.all(sql, params, (err, rows) => {
        if (err) {
          res.status(200).json({"error":err.message});
          return;
        }
        let records=[];
        rows.forEach((row) =>records.push(row));
        res.json({
            "message":"success",
            "data":records
        })
      });
})

app.use(function(req, res){
    res.status(404).json({message:404});
});