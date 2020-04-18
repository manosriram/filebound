const express = require("express");
const app = express();
const PORT = process.env.PORT || 5000;
require('dotenv').config()

app.listen(PORT, () => console.log(`Server at ${PORT}`));
