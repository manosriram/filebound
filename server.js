const express = require("express");
const app = express();
const bodyparser = require("body-parser");
const PORT = process.env.PORT || 5000;
const fileUpload = require("express-fileupload");
const path = require("path");
const cors = require("cors");
require('dotenv').config()

app.use(cors());
app.use(express.static(path.join(__dirname, "client/build")));
app.use(fileUpload());
app.use(bodyparser.json());
app.use("/file", require("./Controllers/file"));
app.listen(PORT, () => console.log(`Server at ${PORT}`));
