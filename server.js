const PORT = process.env.PORT || 5000;
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const Bycrypt = require("bcrypt-inzi");
const useragent = require('express-useragent');

let app = express();

app.use(useragent.express());
app.use(bodyParser.json());
app.use(cors());
app.use(morgan("dev"));

let dbURI = "mongodb+srv://root:root@cluster0.s5oku.mongodb.net/testdb?retryWrites=true&w=majority"

mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true });

mongoose.connection.on("connected", function () {
    console.log("Mongoose is Connected");
});

mongoose.connection.on("disconnected", function () {
    console.log("Mogoose is disconnected");
});

mongoose.connection.on("err", function (err) {
    console.log("Mongoose connection error" + err);
    process.exit(1);
});

process.on("SIGINT", function () {
    console.log("app is terminated");
    mongoose.connection.close(function () {
        console.log("Mongoose Default Connection Close");
    });
});

mongoose.set('useCreateIndex', true);


var userSchema = new mongoose.Schema({
    userName: { type: String, required: true, unique: true },
    password: { type: String, required: true }
});

var users = mongoose.model("users", userSchema);

var sessionScheme = new mongoose.Schema({
    token: { type: String },
    expire: { type: String }
});

var sessions = mongoose.model("sessions", sessionScheme);

app.get("/", (req, res, next) => {
    res.send("Some GET ANYONE");
});

app.post("/signup", (req, res, next) => {

    if (!req.body.userName || !req.body.password) {
        console.log("Something Missing");
        res.send({
            message: "Please Provide Username & Password"
        });
    }
    Bycrypt.stringToHash(JSON.stringify(req.body.password)).then(passwordHash => {
        var newUser = new users({
            userName: req.body.userName,
            password: passwordHash
        })
        newUser.save((err, data) => {
            if (!err) {
                res.send({
                    message: "Sign UP SuccessFully",
                    status: 200
                })
            }
            else{

                res.send({
                    message: "User Error "+err,
                    status: 200
                })
                
            }
        })

    })
})


















app.listen(PORT, () => {
    console.log("Server is Running :", PORT);
})