const express = require("express");
const app = express(); const bodyparser = require("body-parser");
const PORT = process.env.PORT || 5000;
const fileUpload = require("express-fileupload");
const path = require("path");
const cors = require("cors");
require('dotenv').config()
const fs = require("fs");
const helmet = require("helmet");

app.use(helmet());
app.use(express.static(path.join(__dirname, "client/build")));
app.use(cors());
app.use(fileUpload());
app.use(bodyparser.json());
app.use("/file", require("./Controllers/File"));

app.get("/*", (req, res) => {
    res.sendFile(path.join(__dirname, "client/build/index.html"), err => {
        res.status(500).send(err);
    });
});

app.listen(PORT, () => console.log(`Server at ${PORT}`));

module.exports = app;
