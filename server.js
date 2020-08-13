const express = require("express");
const app = express();
const bodyparser = require("body-parser");
const PORT = process.env.PORT || 5000;
const fileUpload = require("express-fileupload");
const path = require("path");
const cors = require("cors");
require("dotenv").config();
const fs = require("fs");
const helmet = require("helmet");

app.use(helmet());
app.use(cors());
app.use(fileUpload());
app.use(bodyparser.json());
app.use("/file", require("./Controllers/File"));

const v8 = require("v8");
const totalh = v8.getHeapStatistics().total_available_size;
const totalh_gb = (totalh / 1024 / 1024 / 1024).toFixed(2);
console.log("totalHeapSizeGB: ", totalh_gb);

app.get("*", (req, res) => {
    app.use(express.static("client/build"));
    res.sendFile(path.resolve(__dirname, "client", "build", "index.html"));
});

app.listen(PORT, () => console.log(`Server at ${PORT}`));

module.exports = app;
