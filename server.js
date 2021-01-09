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
        });
        newUser.save((err, data) => {
            if (!err) {
                res.send({
                    message: "Sign UP SuccessFully",
                    status: 200
                });
            }
            else {

                res.send({
                    message: "User Error " + err,
                    status: 200
                });

            }
        });

    });
})
app.post("/login", (req, res, next) => {
    if (!req.body || !req.body.userName || !req.body.password) {
        res.send({
            message: "Info Missing",
            status: 404
        });
    }
    newUser.find({ userName: req.body.userName })
        .then((currentUser) => {
            currentUser = currentUser[0];
            console.log("Current User :", currentUser);
            console.log("Current UserName And Password :", currentUser.password);
            if (currentUser) {
                Bycrypt.varifyHash(JSON.stringify(req.body.password), currentUser.password)
                    .then(passwordVerifed => {
                        console.log("Password Verifiy ", passwordVerifed);
                        if (passwordVerifed) {
                            let tokenData = {
                                ip: req.socket.remoteAddress,
                                browserName: req.useragent.browser
                            };
                            console.log("Tokan Data 1", JSON.stringify(tokenData));
                            Bycrypt.stringToHash(JSON.stringify(tokenData))
                                .then(token => {
                                    sessions.create({
                                        token: token,
                                        expire: new Date().getTime() + (1000 * 60)
                                    }).then(() => {
                                        console.log("User Session ", sessions);
                                        res.json({
                                            "token": token
                                        })
                                    })
                                })

                        } else {
                            res.send("Password in invalid")
                            console.log("Password is invalid");
                        }
                    }).catch(e => {
                        console.log("error: ", e)
                    })
            } else {
                res.send("Invalid username or password || user not found")
            }
        })
})
app.get("/profile", (req, res, next) => {
    if (!req.query.token) {
        res.send("Token is Missing")
    }
    sessions.find({ token: req.query.token })
        .then((session) => {
            session = session[0],
                console.log("Indivision Session ", session);
            if (new Date().getTime() > session.expire) {
                res.send({
                    status: 404,
                    message: "Token Expire"
                })
            }
            Bycrypt.validateHash(req.query.token)
                .then(isValidTokenHash => {
                    if (isValidTokenHash) {
                        console.log("Hash is Valid");

                        let tokenData = {
                            ip: req.socket.remoteAddress,
                            browserName: req.useragent.browser
                        }
                        Bycrypt.varifyHash(JSON.stringify(tokeData), session.token)
                            .then(hashVerified => {
                                if (hashVerified) {
                                    res.send({
                                        message: "Welcome TO Profile"
                                    })
                                } else {
                                    res.send("Hash is invalid");
                                    console.log("hash is not valid");
                                }
                            }).catch(e => {
                                console.log("Error :", e);
                            })

                    } else {
                        res.send("Not valid token")
                        console.log("hash is invalid")
                    }
                })
        })
})

app.get("/Dashboard", (req, res, next) => {
    if (!req.query.token) {
        res.send("token is Missing")
    }
    sessions.find({ token: req.query.token })
        .then((session) => {
            session = session[0],
                console.log("Indivision Session ", session);
            if (new Date().getTime() > session.expire) {
                res.send({
                    status: 404,
                    message: "Token Expire"
                })
            }
            Bycrypt.validateHash(req.query.token)
                .then(isValidTokenHash => {
                    if (isValidTokenHash) {
                        console.log("Hash is Valid");

                        let tokenData = {
                            ip: req.socket.remoteAddress,
                            browserName: req.useragent.browser
                        }
                        Bycrypt.varifyHash(JSON.stringify(tokeData), session.token)
                            .then(hashVerified => {
                                if (hashVerified) {
                                    res.send({
                                        message: "Welcome TO Profile"
                                    })
                                } else {
                                    res.send("Hash is invalid");
                                    console.log("hash is not valid");
                                }
                            }).catch(e => {
                                console.log("Error :", e);
                            })

                    } else {
                        res.send("Not valid token")
                        console.log("hash is invalid")
                    }
                })
        })
})














app.listen(PORT, () => {
    console.log("Server is Running :", PORT);
})