if(process.env.NODE_ENV != "production")
{
        require('dotenv').config() ;
}

// console.log(require("dotenv").config());
// console.log(process.env);

// Start your server
const PORT = process.env.PORT || 8080;
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const session = require('express-session');
// const MongoStore = require('connect-mongo');
const MongoStore = require("connect-mongo").default;

const ejsMate = require('ejs-mate');
const ExpressError = require("./utils/ExpressError.js");
const listingsRouter = require("./routes/listing.js");
const reviewsRouter = require("./routes/review.js");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./Models/user.js");
const path = require("path");
const methodOverride = require('method-override');
const cookie = require("express-session/session/cookie.js");
const userRouter = require("./routes/user.js");

//set EJS engine
app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended : true})); // to parse data from request body
app.use(methodOverride("_method"));
app.engine("ejs",ejsMate);
app.use(express.static(path.join(__dirname,"/public")));

const db_url = process.env.ATLASDB_URL ;

async function main() {
  await mongoose.connect(db_url);
}

main().then(()=>{
    console.log("Connected to DB...");
}).catch((err)=>{
    console.log(err);
});

const store = MongoStore.create({
    mongoUrl : db_url,
    crypto : {
        secret : process.env.SECRET,
    } ,
    touchAfter : 24 * 3600 ,
});

store.on("error" , (err)=>{
    console.log("ERROR IN MONGO SESSION STORE" , err);
});

//Express session
const sessionOptions = {
    store,
    secret : process.env.SECRET,
    resave : false ,
    saveUninitialized : false ,
    cookie : {
        expires : Date.now() + 7 * 24 * 60 * 60 * 1000 ,
        maxAge : 7 * 24 * 60 * 60 * 1000 ,
        httpOnly : true ,
    },
};

app.use(session(sessionOptions));
app.use(flash());
console.log(MongoStore);
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//req.locals
app.use((req,res,next)=>{
    res.locals.success = req.flash("success");
    // console.log(res.locals.success);
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user || null ;
    next();
});

// app.get("/demouser" , async (req,res)=>{
//     let fakeUser = new User({
//         email:"student@apnacollege.in",
//         username : "delta-student"
//     });
//     let registeredUser = await User.register(fakeUser, "helloworld");
//     res.send(registeredUser);
// });

app.get("/",(req,res)=>{
    res.send("I am root!!!");
});

app.use("/listings",listingsRouter);
app.use("/listings/:id/reviews", reviewsRouter);
app.use("/",userRouter);

//Custom Error handler
app.use((err,req,res,next)=>{
    let { statusCode = 500 , message = "something went wrong..." } = err ;
    res.status(statusCode).render("error.ejs" , {message});
});

//custom express error for any route that doesn't exists in our application
// app.all("*", (req,res,next)=>{
//     next(new ExpressError(404,"Page Not Found..."));
// });

app.all("*", (req, res, next) => {
    next(new ExpressError(404, "Page Not Found..."));
});


app.listen(PORT,()=>{
    console.log(`Listening to port ${PORT}`);
});