/*
WEB322 Assignment 3
Stan's Gallery - 7 Wonders
Author: Stanislav Chirikov
Student ID 074631128
Used materials: https://www.iflscience.com/the-seven-wonders-of-the-ancient-world-and-where-to-find-them-68477
*/

const express = require("express");
const exphbs = require('express-handlebars');
//const path = require("path");
//const readline = require("linebyline");
//const fs = require("fs");
const session = require("client-sessions");
const randomStr = require("randomstring");
const buy = require("./buy.js");
const MongoClient = require("mongodb").MongoClient;
const url = "mongodb+srv://Chirikov:OyRn7m8SN01apuRz@web322.wyskpws.mongodb.net/?retryWrites=true&w=majority&appName=WEB322";


const HTTP_PORT = process.env.PORT || 3000;
let imageList = [];
let RandomString = randomStr.generate();

/*
const rl = readline("./imagelist.txt");
rl.on("line", (line) => {
    imageList.push(line.substring(0, line.length - 4));
})
.on("error", (err) => {
    console.error(err);
});
*/

let userData = {};
fs.readFile("./user.json", "utf-8", (err, data) => {
    if (err) throw err;
    userData = JSON.parse(data);
    });

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname)));
app.engine(".hbs", exphbs.engine({
    extname: ".hbs",
    defaultLayout: false,
    layoutsDir: path.join(__dirname)
}));
app.set("view engine", ".hbs");

app.use(session({
	cookieName: "ActiveSession",
	secret: RandomString,
	duration: 5 * 60 * 1000,
	activeDuration: 2 * 60 * 1000,
    httpOnly: true,
    secure: true,
    ephemeral: true
}));

app.get("/", (req,res) => {
    req.ActiveSession.reset();
    res.render('loginPage');
});

app.post("/", (req,res) => {
    let login = req.body.EnterUsername;
    let password = req.body.EnterPassword;
    let msg ="";
    if (!userData.hasOwnProperty(login)) {
        msg = "Not a registered username";
        res.render('loginPage', {msg});
    } else if (userData[login] != password) {
        msg = "Invalid password";
        res.render('loginPage', {msg});
    } else {
        req.ActiveSession.user = login;
        inputData = "The Map of Wonders";
        let imagePath = path.join("images", (inputData+".jpg"));
        res.render('viewData', {
            data: {imageList, imagePath, inputData, login}
        });
    }
});

app.post("/gallery", (req,res) => {
    if (typeof req.ActiveSession.user === 'undefined') {
        res.render('loginPage');
    } else {
        let login = req.ActiveSession.user;
        let inputData = req.body.chooseImage;
        if (typeof inputData === 'undefined') {
            inputData = "The Map of Wonders";
        }
        let imagePath = path.join("images", (inputData+".jpg"));
        res.render('viewData', {
        data: {imageList, imagePath, inputData, login}
        });
    }
});

app.use("/buy", buy);

const server = app.listen(HTTP_PORT, () => {
    console.log(`Listening on port ${HTTP_PORT}`);
});
