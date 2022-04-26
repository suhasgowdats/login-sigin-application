//password:WoDDjbsC3uyvFHIS   usename:suhas
//mongodb+srv://suhas:WoDDjbsC3uyvFHIS@cluster0.ac3n6.mongodb.net/test
const {MongoClient}=require('mongodb');
const express=require('express');
const {createTransport}=require('nodemailer')
const cors=require('cors')
require("dotenv").config()
const app=express();
app.use(express.json())
app.use(cors())
const PORT=process.env.PORT||500
const {hashedPassword,pwsCompair}=require('./hashingpassword')


const url="mongodb+srv://suhas:WoDDjbsC3uyvFHIS@cluster0.ac3n6.mongodb.net/test"
const Client=new MongoClient(url)

app.post('/signin',async(req,res)=>{
    console.log("==========>",req.body)
    let connection=await Client.connect()
    let db=connection.db("users")
    let collection=db.collection('details')
    let user= await collection.findOne({email:req.body.email});
    if(user){
        res.send("User already exist")
    }else{
        console.log("first")
        let hidePws= await hashedPassword(req.body.password);
        req.body.password=hidePws;
        let addData=await collection.insertOne(req.body);
        res.send("Signin successfull")
    }
})

app.post('/login',async(req,res)=>{
    let connection=await Client.connect()
    let db=connection.db("users")
    let collection=db.collection('details')
    let user= await collection.findOne({email:req.body.email})
    console.log(user)
    if(user){
        let compair=await pwsCompair(req.body.password,user.password)
        if(compair){
            res.send("logIn successfull")
        }else {
            res.send("Please enter correct passsword")
        }
    }else{
        res.send("Email not registered, please signin")
    }    
})


app.post('/emailverification',async(req,res)=>{
    let connection=await Client.connect();
    let db=connection.db("users");
    let collection=db.collection('details');
    let user=await collection.findOne({email:req.body.email})
    console.log(user)
    if(user){
        let transportMail=createTransport({
            service:"gmail",
            auth:{
                user:"nodejs500@gmail.com",
                pass:"kiran@7624"
            }
        })
        let randomOtp=(Math.random()*100000).toFixed(0);
        let updateOtp=await collection.updateOne({email:req.body.email},{$set:{otp:randomOtp}})
        let mailOptions={
            from:"nodejs500@gmail.com",
            to:`${req.body.email}`,
            subject:"password reset verification for the test app",
            text:`The OPT to rest your UPI password is ${randomOtp}`
        }    
        transportMail.sendMail(mailOptions,(err,info)=>{
            if(err){
                console.log(err)
                res.send("Failed to send OTP")
            }else{
                console.log("info",info.response)
                res.send("OPT send")
            }
        })    
    }else{
        res.send("not found")
    }
})


app.post('/optverification',async(req,res)=>{
    let connection=await Client.connect();
    let db=connection.db("users");
    let collection=db.collection('details');
    let user=await collection.findOne({email:req.body.email});
    if(user){
        if(user.otp==req.body.otp){
            let removeOtp= await collection.updateOne({email:req.body.email},{$unset:{otp:user.otp}});
            res.send("OTP verification successfull")
        }else{
            res.send("Incorrect OPT")
        }
    }else{
        res.send("User not exist")
    }
})

app.post('/pwsverification', async(req,res)=>{
    let connection=await Client.connect();
    let db=connection.db("users");
    let collection=db.collection('details');
    let user=await collection.findOne({email:req.body.email});  
    if(user){
        const hidePws= await hashedPassword(req.body.pws1)
         req.body.pws1=hidePws;
         let updatepws= await collection.updateOne({email:req.body.email},{$set:{password:req.body.pws1}});
         res.send("Passwoerd updated successfully")
    }else{
        res.send("Check the email once")
    }
})




app.listen(PORT,()=>{
    console.log("ur in port:",PORT)
})



