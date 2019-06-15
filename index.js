/* task 

/my_events - евенты, которые пользователь купил
 */

var MongoClient = require("mongodb").MongoClient
var ObjectId = require("mongodb").ObjectID


var express = require("express");
var app=express();
var bodyParser = require('body-parser');

var MongoClient = require("mongodb").MongoClient
var ObjectId = require("mongodb").ObjectID
var url = "mongodb://127.0.0.1:27017"

app.use(bodyParser.json());
app.listen(1337, () => {
    console.log("Server listening on port 1337")
})


app.get("/auth", (req,res)=>{
    MongoClient.connect(url,(err,db)=>{
        if (err) throw err;
        var dbo = db.db("lesson")
        dbo.collection("users").findOne({user_id: req.query.user_id}, (err,check)=> {
            if (err) throw err;
            if (!check){
                var obj={
                    name:req.query.name,
                    sername: req.query.sername,
                    user_id: req.query.user_id
                }
                dbo.collection("users").insertOne(obj,(err, result)=>{
                    if (err) throw err;
                    if (result){
                        res.json({type: "Теперь вы авторизованы"})
                    }else{
                        res.json({type: "server_err"})
                    }
                })

            }else{
                res.json({type: "Вы авторизованы"})
            }
            db.close();      
        })
    })
})

app.get("/new_event", (req,res)=>{
    MongoClient.connect(url,(err,db)=>{
        if (err) throw err;
        var dbo = db.db("lesson")
        var event = {
            "capper":{"name":req.query.caper_name,"user_id":req.query.user_id},"date": req.query.date,"sport":req.query.sport,
            "name": req.query.name,"rate":req.query.rate,"result":req.query.result,"price":req.query.price
        }
        dbo.collection("events").insertOne(event, (err,check)=> {
            if (err) throw err;
            if (!check){
                    res.json({type: "Произошла ошибка"})
                } else {
                    res.json({type: "Событие добавлено"})         
                }
        db.close();      
        })
    })
})

//active_events - все события, которые есть в базе данных, приходит вся инфа о них,
// кроме результата матча
app.get("/active_events", (req,res)=>{
    MongoClient.connect(url,(err,db)=>{
        if (err) throw err;
        var dbo = db.db("lesson")

        dbo.collection("users").findOne({user_id: req.query.user_id}, (err,check)=> {
            if (err) throw err;
            if (!check){ res.json({type: "Что-то пошло не так"})
            } else { 
                
                var bets=check.bets;
                dbo.collection("events").find({},{projection:{result: null}}).toArray((err,check)=> {
                    if (err) throw err;
                    if (!check){
                            res.json({type: "Произошла ошибка"})
                        } else {
                            var my_events=[];
                            for (j=0; j<check.length;j++){
                                for (var i=0; i<bets.length; i++){
                                    if (bets[i]!=check[j]._id){
                                        my_events.push(check[j])
                                    }
                            }
                            }
                            res.json({type: "ВСЕ СОБЫТИЯ", my_events})  
                        }       
                        
                db.close();      
                })
            }
    })
})
})
//buy - юзер купил событие, добавить его к акку пользователя и 
//на /active_events не отображать, купленные им события

app.get("/buy", (req,res)=>{
    MongoClient.connect(url,(err,db)=>{
        if (err) throw err;
        var dbo = db.db("lesson")
        dbo.collection("users").findOne({user_id: req.query.user_id}, (err,check)=> {
            if (err) throw err;
            if (!check){ res.json({type: "Что-то пошло не так"})
            } else {
               var bets=check.bets;
               bets.push(req.query.event_id)
                dbo.collection("users").updateOne({user_id: req.query.user_id},{$set: {bets: bets}}, (err,check)=> {
                    if (err) throw err;
                    if (!check){
                        res.json({type: "КОго позвать?"})

                    }else{
                        res.json({type: "Благодарим за покупку"})
                    }
                    db.close();      
                })
            }
        })
        
    })
})

//my_events - евенты, которые пользователь купил

app.get("/my_events", (req,res)=>{
    MongoClient.connect(url,(err,db)=>{
        if (err) throw err;
        var dbo = db.db("lesson")

        dbo.collection("users").findOne({user_id: req.query.user_id}, (err,check)=> {
            if (err) throw err;
            if (!check){ res.json({type: "Что-то пошло не так"})
            } else { 
                
                var bets=check.bets;
                dbo.collection("events").find().toArray((err,check)=> {
                    if (err) throw err;
                    if (!check){
                            res.json({type: "Произошла ошибка"})
                        } else {
                            var my_events=[];
                            for (j=0; j<check.length;j++){
                                for (var i=0; i<bets.length; i++){
                                    if (bets[i]==check[j]._id){
                                        my_events.push(check[j])
                                    }
                            }
                            }
                            res.json({type: "ВСЕ купленные СОБЫТИЯ", my_events})  
                        }       
                        
                db.close();      
                })
            }
    })
})
})