const PORT = process.env.PORT || 5000;
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const bodyparser = require("body-parser");
const mongoose = require("mongoose");
const Bycrypt = require("bcrypt-inzi");
const useragent = require('express-useragent');

let app = express();

app.use(useragent.express());


let dbURI = "mongodb+srv://root:root@cluster0.s5oku.mongodb.net/testdb?retryWrites=true&w=majority"

mongoose.connect





app.listen(PORT, () => {
    console.log("Server is Running :", PORT);
})