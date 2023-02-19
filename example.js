const {FileDB} = require("./src/index");

const fs = require("fs");
const path = require("path");
const srcPath = "./data/";
const outPath = "./data/output/";

const delimiter = Buffer.from([127, 127, 127, 127]);
const delimiterLength = delimiter.length;

const img0 = fs.readFileSync(path.resolve(__dirname, srcPath, "10KB.data"));
const img2 = fs.readFileSync(path.resolve(__dirname, srcPath, "1byte.data"));

const fileDBPath = path.resolve(__dirname, outPath, "out.jpg");
const fileDB = new FileDB(fileDBPath);
fileDB.append(img0).append(img2);
fileDB.read(res => console.log("read cb from app, res.length:", res.length)).append(img0);

// thenable way of .read() usage
// fileDB.read().then(res => console.log("read.then from app, res.length:", res.length));

fileDB.append(img2);
