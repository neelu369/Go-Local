const express = require("express")
const app = express()
const cors = require("cors")
const bcrypt = require("bcryptjs")
app.use(cors())

//Create Database

var MongoClient=require('mongodb').MongoClient;
var url="mongodb://127.0.0.1:27017/ndb";
//var url = "mongodb+srv://nileshsrrm:neelu123@cluster0.7zfpief.mongodb.net/"

app.use(express.json()) // to receive json data

app.listen(5000, ()=>{
    console.log("server started")
})

let client
app.post("/register", async(req, res)=>{
    console.log(req.body)
    const {name,emailid, phoneno, password} = req.body
    const epwd = await bcrypt.hash(password, 10) // encrypt the password

    MongoClient.connect(url)
    .then((connectedClient) => {
        client = connectedClient;
        return client.db("GoLocal").collection("users");
    })
    .then ((collection)=>{     
        // Insert example data
        const data = { name: name, phone: phoneno, emailid:emailid, password:epwd };
        return collection.insertOne(data);
    })
    .then((result) => {
        console.log("1 document inserted");
        client.close();
        res.send({status:"ok", username:name})
        // close the connection
        
    })
    .catch((err) => {
        if (err.code == 11000) {
            console.log("duplicate email id, mongodb validation error");
            res.send({error:"Email Id already exists in database"})
        }
        else {
            console.error("An error occurred:", err.code);
            res.send({status:"error has occured"})
        }
    });

    
})

let result;
app.post("/signin", async(req, res)=>{
    console.log("in sign in " + req.body)
    const {emailid, password} = req.body
    //const epwd = await bcrypt.hash(password, 10) // encrypt the password
    let username;

    MongoClient.connect(url)
    .then((connectedClient) => {
        client = connectedClient;
        return client.db("GoLocal").collection("users").findOne({emailid:emailid}, {projection:{_id:1, name:1, password:1}});
    })
    .then((result) => {
        if (result == null){
            return res.json({status:"error", msg:"invalid user email"})
        }
        console.log(result)
        username = result.name
        return result
    })
    .then((result)=>{
        //console.log("doc found", result);
        //console.log("password send in req: "+password, "password in db: " + result.password, "new enc password: " +epwd)
        // verify the password is correct
        return bcrypt.compare(password, result.password)
    })
    .then((pmatches)=>{
        if (pmatches) 
            return res.json({status:"ok", msg:"password is good", username : username})
        else
            return res.json({status:"error", msg:"invalid password"})
    })
    .catch((err) => {
            console.error("An error occurred:", err);
            res.send({status:"error", msg:"error has occured"})
    });
 
})


app.post("/getvno", async(req, res)=>{
    console.log(req.body)
    const {currentemailid} = req.body
   

    MongoClient.connect(url)
    .then((connectedClient) => {
        client = connectedClient;
        return client.db("GoLocal").collection("vbooking").findOne({booked:false}, {projection:{_id:1, vehicleno:1, mileage:1}});
    })
    .then((result) => {
        if (result == null){
            return res.json({status:"error", msg:"no vehicles available"})
        }
        return result
    })
    .then((result)=>{
        if (result) 
            return res.json({status:"ok", msg:{vehicleno : result.vehicleno, mileage : result.mileage}})
    })
    .catch((err) => {
            console.error("An error occurred:", err);
            res.send({status:"error", msg:err})
    });
 
})

app.post("/booknow", async(req, res)=>{
    console.log(req.body)
    const {currentemailid,curvno} = req.body
   

    MongoClient.connect(url)
    .then((connectedClient) => {
        client = connectedClient;
        var myquery = { vehicleno: curvno};
        var newvalues = { $set: {emailid: currentemailid, booked: true } };
        return client.db('GoLocal').collection("vbooking").updateOne(myquery, newvalues,JSON.stringify(result))
    })
    .then((result) => {
        console.log(" Document updated for book now");
        console.log(result);
        client.close();
        res.send({status : "ok"})
    })  
    .catch((error) => 
    {
        console.log("Db error",error);
        res.send({status : "error"})
    })
 
})

app.post("/endride", async(req, res)=>{
    console.log("end ride server" , req.body)
    const {curvno} = req.body
   
    
    MongoClient.connect(url)
    .then((connectedClient) => {
        client = connectedClient;
        var myquery = { vehicleno: curvno};
        var newvalues = { $set: {emailid: "", booked: false } };
        return client.db('GoLocal').collection("vbooking").updateOne(myquery, newvalues,JSON.stringify(result))
    })
    .then((result) => {
        console.log(" Document updated for end ride");
        console.log(result);
        client.close();
        res.send({status : "ok"})
    })  
    .catch((error) => 
    {
        console.log("Db error",error);
        res.send({status : "error"})
    })
 
})

