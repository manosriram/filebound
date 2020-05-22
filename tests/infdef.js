const zlib = require("zlib");
const fs = require("fs");

const wt = fs.createWriteStream("out.txt");

fs.readFile("./in.txt", (err, data) => {
    console.log(data.byteLength);
    var deflated = zlib.deflateSync(data);
    console.log(deflated.byteLength);
    wt.write(deflated);
});
