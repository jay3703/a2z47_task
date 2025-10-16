var express = require("express");
var bodyparser = require("body-parser");
var mysql = require("mysql");
require("dotenv").config();

var util = require("util");
var session =require("express-session")


var conn =mysql.createConnection({
    host:"bldxcgadhpzbdaaczqip-mysql.services.clever-cloud.com",
    user:"uivbnqccetoihrcb",
    password:"H9gVO5bwt4qYQcIldb0g",
    database:"bldxcgadhpzbdaaczqip"
})

var exe = util.promisify(conn.query).bind(conn);



 var app = express();
 app.use(bodyparser.urlencoded({extended:true}));
 app.use(session({
    secret:"gfuheuorpgheuo",
    resave:true,
    saveUninitialized:true
 }))

 app.get("/",function(req,res){
    res.render("home.ejs");

 })
 app.get("/register",function(req,res){
    res.render("register.ejs")
 })

 app.post("/save_user",async function(req,res){
    var d=req.body;
    var user_name=d.first_name+" "+d.last_name;
    var sql=`INSERT INTO users(user_name,user_mobile,user_password) VALUES(?,?,?) `;
    var result = await exe(sql,[user_name,d.user_mobile,d.user_password]);

    // res.send(result);
    res.redirect("/login");
 })
 app.get("/login",function(req,res){
    res.render("login.ejs")
 })

//  Simple pop


//  app.post("/login_process", async function(req,res){
//     var d=req.body;
//     var sql= `SELECT * FROM users WHERE user_mobile = ? AND user_password = ?`;
//     var result= await exe(sql,[d.user_mobile,d.user_password]);
//     if(result.length > 0)
//     {
//         req.session.user_id = result[0].user_id;
//         // res.send("Login Success");
//         res.redirect("/dashboard")
//     }
//     else
//     {
//         res.send("Invalid Mobile And Password");
//     }
    
//  })


//  Wrong password pop deto 


app.post("/login_process", async function(req,res){
    var d = req.body;

    var sqlMobile = `SELECT * FROM users WHERE user_mobile = ?`;
    var resultMobile = await exe(sqlMobile,[d.user_mobile]);

    if(resultMobile.length > 0) {
        if(resultMobile[0].user_password === d.user_password) {
            req.session.user_id = resultMobile[0].user_id;
            res.redirect("/dashboard");
        } else {
            res.send(`<script>alert("Wrong Password"); window.location.href='/login';</script>`);
        }
    } else {
        res.send(`<script>alert("Wrong Mobile Number"); window.location.href='/login';</script>`);
    }
});

// wrong and success

// app.post("/login_process", async function(req,res){
//     var d = req.body;

//     var sqlMobile = `SELECT * FROM users WHERE user_mobile = ?`;
//     var resultMobile = await exe(sqlMobile,[d.user_mobile]);

//     if(resultMobile.length > 0) {
//         if(resultMobile[0].user_password === d.user_password) {
//             req.session.user_id = resultMobile[0].user_id;
//             res.send(`<script>alert("Login Successful"); window.location.href='/dashboard';</script>`);
//         } else {
//             res.send(`<script>alert("Wrong Password"); window.location.href='/login';</script>`);
//         }
//     } else {
//         res.send(`<script>alert("Wrong Mobile Number"); window.location.href='/login';</script>`);
//     }
// });



  function checklogin(req,res,next)
  {
     if(req.session.user_id == undefined)
    {
        res.redirect("/login");
    
    }
   else
    {
        next();
    } 
}
 app.get("/dashboard",checklogin,async function(req,res)
 {
    var user_id= req.session.user_id;
    var sql=`SELECT * FROM users WHERE user_id = ?`;
    var user_info= await exe(sql,[user_id]);
    var packet = {user_info}
    // console.log(req.session.user_id);
    res.render("dashboard.ejs",packet);
 })

 app.listen(process.env.PORT || 1000);