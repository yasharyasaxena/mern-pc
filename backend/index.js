const mongoose = require("mongoose");
const express = require("express");
const path = require("path");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const { type } = require("os");

mongoose.connect('mongodb://127.0.0.1:27017/quiz_maker')
const connection = 'mongodb://127.0.0.1:27017/quiz_maker'

const sessionStore = MongoStore.create({
    mongoUrl: connection,
    collectionName: 'sessions'
})



const userSchema = new mongoose.Schema(
    {
        firstName: {
            type: String,
            required: true
        },
        lastName: String,
        email: {
            type: String,
            required: true,
            unique: true
        },
        password: {
            type: String,
            required: true
        },
        author: {
            type: Boolean,
            default: false
        }
    }
)

const quizSchema = new mongoose.Schema({
    author: String,
    quizTitle: String,
    questions: [{
        text: String,
        a: String,
        b: String,
        c: String,
        d: String,
        correctOption: {
            type: String,
            enum: ["a","b","c","d"]
        }
    }]
});

const Quizes = mongoose.model('Quizes', quizSchema);
const Users = mongoose.model('Users', userSchema);

async function passwordVerify(user, password){
    if(await user.password == password){
        return true;
    }
    else{
        return false;
    }
}

const app = express();
app.set("view engine", "ejs");
app.set("views", path.resolve("../views"))
app.use(express.urlencoded({extended: false}))
app.use(session({
    secret: 'qwerty',
    resave: false,
    store: sessionStore,
    saveUninitialized: true
    }))

function isAuthenticated(req, res, next){
    if(req.session.user){
        if(req.session.author){
            res.redirect('/quiz_maker');
        }
        else res.redirect('/quiz_taker');
    }
    else next();
}

app
    .route("/")
    .get((req, res) => {
        return res.render('home');
    })

app
    .route("/login")
    .get(isAuthenticated, (req, res) => {
        return res.render('login');
    })
    .post(async (req, res) => {
        const body = req.body;
        const user = await Users.findOne({email: body.email});
        if(!user){
            return res.redirect('/signup');
        }
        else if(!await passwordVerify(user, body.password)){
            return res.redirect('/login');
        }
        else if(await passwordVerify(user, body.password)) {
            req.session.user = body.email;
            if(user.author){
                req.session.author = true;
                return res.redirect('/quiz_maker');
            }
            else {
                req.session.author = false;
                return res.redirect('/quiz_taker');
            }
        }
    })
    
app
    .route("/quiz_maker")
    .get(async (req, res) => {
        return res.render('quiz_maker', {
            email: req.session.user,
            db: Quizes,
            questions: Object.values(await Quizes.find({author:req.session.user}))[0].questions,
        });
    })
    .post(async (req, res) => {
        var question = Object.values(await Quizes.find({author:req.session.user}))[0].questions
        question.push(...[{  
            text: req.body.question,
            a: req.body.a,
            b: req.body.b,
            c: req.body.c,
            d: req.body.d,
            correctOption: req.body.correctOption
        }])
        await Quizes.findByIdAndUpdate(Object.values(await Quizes.find({author:req.session.user}))[0]._id, {
            questions: question
        })
        if(req.body.save){
            return res.redirect('/quiz_taker')
        }
        else return res.redirect('/quiz_maker')
    })


app
    .route("/quiz_taker")
    .get((req, res) => {
        return res.render('quiz_taker');
    })

app
    .route("/signup")
    .get(isAuthenticated, (req, res) => {
        return res.render('signup');
    })
    .post(async (req, res) => {
        const body = req.body;
        await Users.create({
            firstName: body.firstname,
            lastName: body.lastname,
            email: body.email,
            password: body.password
        });
        return res.redirect('/login');
    })

app.listen("8000", () => console.log("Server connected!"));
